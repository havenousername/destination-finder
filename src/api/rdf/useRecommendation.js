import {addAnonymousToHeaders} from "./generateAnonymUser";
import {useState} from "react";
import useRegionStore from "./useRegionStore";
import {useRdfUser} from "./useUser";
import {useGetJsonMap} from "./useRegions";

const MATCH_RATION_DEFAULT = 0.2;
const ADD_EXPLANATIONS = true;
const DEFAULT_TOLERANCE = 0;
const MAX_RESULTS = 10;

export const useRecommendation = () => {
  const [matchRatio] = useState(MATCH_RATION_DEFAULT);
  const [addExplanations] = useState(ADD_EXPLANATIONS);
  const [tolerance] = useState(DEFAULT_TOLERANCE);
  const [maxResults] = useState(MAX_RESULTS);

  const { updateUserPreferences } = useRdfUser();

  const { fetchJsonMapManually } = useGetJsonMap();

  const {
    selectedScope,
    chosenRegion,
    setLastRecommendationType,
    setRecommendations,
    setRecommendedMaps,
  } = useRegionStore();

  const params = {
    matchRatio,
    addExplanations,
    maxResults,
    tolerance,
    fromRegion: chosenRegion?.id.localName ?? undefined,
    toRegionType: selectedScope?.value ?? undefined
  };

  const generateGreaterThanRecommendation = async  () => {
    try {
      await updateUserPreferences();
      const query = new URLSearchParams(params).toString();
      const data = await fetch(`${process.env.REACT_APP_RDF_BACKEND_API}/recommendation/greater-than?${query}`, {
        method: "GET",
        headers: addAnonymousToHeaders(),
      });

      const recommendationResults = await data.json();
      setLastRecommendationType(recommendationResults.type);
      setRecommendations(recommendationResults.entities);

      Promise.all(recommendationResults.entities.map((entity) => {
        return fetchJsonMapManually(entity.region.type.replace("_", ""), entity.region.id.localName)
      }))
        .catch(e => {
          console.error(e, "some maps were not uploaded");
        })
        .then(maps => {
          Promise.all(maps.map(async (map, idx) => {
            if (map.status === 404) {
              return;
            }
            const jsonVersion = await map.json();
            let features = []
            if (jsonVersion?.features && jsonVersion?.features.length > 0) {
              features = jsonVersion.features;
            } else if (jsonVersion?.data?.type === 'Feature') {
              features = [jsonVersion.data];
            } else if (jsonVersion.data?.features) {
              features = jsonVersion.data.features;
            }
            const selectedFeatures = features.filter(i => i.geometry.type !== 'Point');
            selectedFeatures.forEach(feature => {
              if (!feature.properties) {
                feature.properties = {};
              }
              feature.properties.region = recommendationResults.entities[idx].region.id.localName;
            })
            return {
              type: jsonVersion.type ?? 'Feature Collection',
              features: selectedFeatures,
              region: recommendationResults.entities[idx].region.id.localName
            };
          }))
            .then(maps => setRecommendedMaps(maps))
        });
    } catch (error) {
      console.error(error);
    }
  }

  return { generateGreaterThanRecommendation };
}