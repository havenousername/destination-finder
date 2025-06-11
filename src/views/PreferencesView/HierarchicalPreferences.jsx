import React, {useEffect, useState} from "react";
import "../../styles/App.css";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import {useGetJsonMap, useGetRegion, useRegionTypes, useSimplifiedRegions} from "../../api/rdf/useRegions";
import SearchDropdownMenu from "../../components/SearchDropdown";
import useRegionStore from "../../api/rdf/useRegionStore";
import {CustomizationContainer} from "./components/CustomizationContainer";
import {LinkedList} from "../../helpers/linkedList";
import {useRecommendation} from "../../api/rdf/useRecommendation";
import {simplify, union, cleanCoords} from "@turf/turf";


const HierarchicalPreferences = () => {
  const {types: regionTypes} = useRegionTypes();
  const {
    fromRegionType,
    setFromRegionType,
    setChosenRegion,
    setTileMaps,
    selectedScope,
    setSelectedScope,
    recommendations
  } = useRegionStore();

  const {response: lightRegionResponse, fetchLightRegionByType} = useSimplifiedRegions();
  const {response: regionIdResponse, fetchRegion} = useGetRegion();
  const {response: jsonMap, fetchJsonMap} = useGetJsonMap();

  const [selectedRegion, setSelectedRegion] = useState({name: '', uri: {}});

  const availableRegionsOfType = lightRegionResponse?.data ?? [];
  const scopedRegionTypes = LinkedList.fromNode(fromRegionType.next);

  useEffect(() => {
    if (regionTypes && !!fromRegionType?.value && (fromRegionType?.value !== regionTypes?.head?.value)) {
      fetchLightRegionByType(fromRegionType.value);
    }
  }, [fromRegionType]);

  useEffect(() => {
    if (selectedRegion.name) {
      fetchRegion(selectedRegion.uri.localName);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (regionIdResponse?.data && fromRegionType?.next?.value) {
      setChosenRegion(regionIdResponse.data);
      fetchJsonMap(
        fromRegionType.value.toString().toLowerCase(),
        selectedRegion.uri.localName.toLowerCase()
      );
    }
  }, [regionIdResponse])

  useEffect(() => {
    if (jsonMap?.data) {
      const jsonMapData = jsonMap.data;
      // debugger;
      if (jsonMapData?.data?.type === 'Feature') {
        const fromRegionMapJson = {
          type: "FeatureCollection",
          features: [jsonMapData.data],
        };
        setTileMaps([fromRegionMapJson]);
        return;
      } else if (jsonMapData?.data?.type === 'FeatureCollection') {
        const fromRegionMapJson = {
          type: "FeatureCollection",
          features: jsonMapData.data.features,
        };
        setTileMaps([fromRegionMapJson]);
        return;
      }
      const features = jsonMapData.features
        .filter(f =>
          f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
        ).map((feature) => {
          return cleanCoords(simplify(feature, { tolerance: 0.01, highQuality: false }));
        });

      const fromRegionMapJson = {
        type: jsonMapData.type,
        features: features,
      };
      setTileMaps([union(fromRegionMapJson)]);
    }
  }, [jsonMap])

  const { generateGreaterThanRecommendation } = useRecommendation();
  const [loading, setLoading] = useState(false);

  const makeNewRecommendationRequest = async () => {
    setLoading(true);
    await generateGreaterThanRecommendation();
    setLoading(false);
  }

  return (
    <div style={{height: "100%", overflowY: "auto", overflowX: "hidden", padding: "1rem"}}>
      <div style={{textAlign: "left", paddingTop: "10px"}}>
        <div style={{fontWeight: "700", fontSize: "1.1em"}}>DestiRec</div>
        <span style={{fontWeight: "300", fontSize: "0.8rem"}}>Travel Destination Recommender System</span>
      </div>

      <div className='d-flex flex-column align-items-start' >
        <div className="d-flex flex-column align-items-start mt-3">
          <div className="d-flex flex-column align-items-start mb-3 gap-1">
            <span style={{fontSize: '0.9rem'}}>Select search area</span>
            <DropdownButton id="dropdown-search-area" title={fromRegionType?.value ?? 'Select element'}>
              {regionTypes.toArrayList().map((region) =>
                <Dropdown.Item
                  key={region.value}
                  style={{
                    minWidth: "12rem",
                    width: "100%",
                  }}
                  onClick={() => setFromRegionType(region)}
                  as="button">
                  {region.value}
                </Dropdown.Item>)}
            </DropdownButton>
          </div>
          <div className="d-flex flex-column align-items-start">
          <span style={{fontSize: '0.9rem'}}>Search region in <strong
            style={{fontWeight: 'bold'}}>{fromRegionType?.value ?? 'None'}</strong></span>
            <DropdownButton id="dropdown-search-area" title={selectedRegion.name || 'Select element'}>
              <SearchDropdownMenu id="dropdown-search-region">
                {availableRegionsOfType.map((region) =>
                  <Dropdown.Item
                    key={region.value1}
                    onClick={() => setSelectedRegion({name: region.value1, uri: region.value0})}
                    style={{
                      minWidth: "12rem",
                      width: "100%",
                    }}
                    as="button">
                    {region.value1}
                  </Dropdown.Item>)}
              </SearchDropdownMenu>
            </DropdownButton>
          </div>
          <div className="d-flex flex-column align-items-start my-3 gap-1">
            <span style={{fontSize: '0.9rem'}}>Select search scope</span>
            <DropdownButton id="dropdown-search-area" title={selectedScope?.value ?? 'Select element'}>
              {scopedRegionTypes.toArrayList().map((region) =>
                <Dropdown.Item
                  key={region.value}
                  style={{
                    minWidth: "12rem",
                    width: "100%",
                  }}
                  onClick={() => setSelectedScope(region)}
                  as="button">
                  {region.value}
                </Dropdown.Item>)}
            </DropdownButton>
          </div>
        </div>
        <span className="mt-4">
          Select your user profile
        </span>
        <CustomizationContainer/>
        <div className="d-flex justify-content-center w-100">
          <button
            style={{
              fontSize: '12px',
              borderRadius: '5px',
              padding: '0.7rem 2.2rem',
              backgroundColor: '#336273',
              color: 'white',
            }}
            className='btn mt-4'
            onClick={makeNewRecommendationRequest}
          >
            { loading ? 'Loading...' :
              (recommendations.length > 0 ? 'Regenerate recommendations' :  'Generate recommendations')
            }
          </button>
        </div>


        {/*  <Dropdown.ItemText>Dropdown item text</Dropdown.ItemText>*/}
        {/*  <Dropdown.Item as="button">Action</Dropdown.Item>*/}
        {/*  <Dropdown.Item as="button">Another action</Dropdown.Item>*/}
        {/*  <Dropdown.Item as="button">Something else</Dropdown.Item>*/}
        {/*</DropdownButton>*/}
      </div>
    </div>
  );
};

export default HierarchicalPreferences;
