import {combine, dissolve, flatten} from "@turf/turf"
import mapData from "../data/regions.json";


export function combineRegionsIntoContinents() {
  const combinedRegions = combine(mapData);
  if (!combinedRegions || !combinedRegions.features || combinedRegions.features.length === 0) {
    console.error('No combined regions found.');
    return null;
  }

  return {
    type: 'FeatureCollection',
    crs: mapData.crs,
    features: combinedRegions.features,
  }
}