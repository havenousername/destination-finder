import {useEffect, useRef} from "react";
import {GeoJSON} from "react-leaflet";
import {simplify, union} from "@turf/turf";

const ReactiveGeoJson = ({ data, style }) => {
  const layerRef = useRef();

  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.clearLayers();
    addNewLayers();
  }, [data]);

  const addNewLayers = () => {
    layerRef.current.addData(data);
  }

  return (
    <GeoJSON
      ref={layerRef}
      style={style}
      data={data}
    />
  );
};

export default ReactiveGeoJson;