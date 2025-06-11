import {useEffect, useRef} from "react";
import {GeoJSON} from "react-leaflet";

const ReactiveGeoJson = ({ data, style, onEachFeature, recommendations }) => {
  const layerRef = useRef();

  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.clearLayers();
    addNewLayers();
  }, [data]);

  const addNewLayers = () => {
    layerRef.current.addData(data);
  }

  const doOnEachFeature = (region, layer) => {
    onEachFeature && onEachFeature(region, layer, recommendations)
  }

  useEffect(() => {
    if (!recommendations || recommendations?.length === 0) return;
    layerRef.current.options.onEachFeature = doOnEachFeature;
  }, [recommendations]);

  return (
    <GeoJSON
      ref={layerRef}
      style={style}
      data={data}
      onEachFeature={doOnEachFeature}
    />
  );
};

export default ReactiveGeoJson;