import React, { useRef, useState, useEffect, useCallback } from "react";
import { MapContainer, GeoJSON, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/Map.css";
import Legend from "./components/Legend";
import useTravelRecommenderStore from "../../store/travelRecommenderStore";
import LeafletTooltip from "../../components/LeafletPopup";
import { ReactComponent as MarkerIcon } from '../../images/Marker.svg';
import { create } from "zustand";

const position = [51.0967884, 5.9671304];

export const useReferencedCountry = create((set) => ({
  countryId: null,
  setCountry: (countryId) => {
    set({ countryId })
  },
  resetCountry: () => {
    set({ countryId: null })
  }
}));

const Map = ({ setActiveResult }) => {
  const [map, setMap] = useState(null);
  const countries = useTravelRecommenderStore((state) => state.countries);
  const travelStore = useTravelRecommenderStore();
  const {recommendationType} = useTravelRecommenderStore();
  const geoJsonLayer = useRef(null);
  const mapLayers = useRef([]);
  const {
    countryId: referencedCountryId,
    resetCountry: resetReferencedCountry
  } = useReferencedCountry();

  useEffect(() => {
    if (referencedCountryId) {
      onCountryPopupOpen(referencedCountryId);
      resetReferencedCountry();
    }
  }, [referencedCountryId]);

  useEffect(() => {
    if (geoJsonLayer.current) {
      geoJsonLayer.current.clearLayers().addData(countries);
    }
  });

  const addNumberToTheIndexedCountry = (layer, cIndex) => {
    layer.options.fillColor = getColor(100);
    layer.bindTooltip(`
        <div>
          <h4>${cIndex + 1}</h4>
        </div>`, {
      permanent: true,
      opacity: 1,
      direction: "center",
    });
  }

  /**
   *
   * @type {(function($ObjMap, *): void)|*}
   */
  const onEachCountry = useCallback((country, layer) => {
    // travelStore.results
    const cIndex = countries.findIndex(
      (r) => r.properties.u_name === country.properties.u_name
    );

    let score;
    const currentRecommendationType = useTravelRecommenderStore.getState().recommendationType;
    const currentResults = useTravelRecommenderStore.getState().results;

    if (currentRecommendationType === 'single') {
      score = country.properties.result.scores.totalScore;
    } else {
      const existsInResults = currentResults.some(
        r => r.id === country.properties.result.id
      );

      if (existsInResults) {
        score = country.properties.result.scores.totalScore;
      } else {
        score = -1;
      }
    }
    // const score = 0;


    // console.log(travelStore.results)
    layer.options.fillColor = getColor(score);

    if (cIndex < 10 && score > 0) {
      addNumberToTheIndexedCountry(layer, cIndex);
    }
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      dblclick: clickCountry,
      click: (event) => onOpenPopup(event, country),
    });

    // add references to the leaflet ids to for the programmatic event handling
    if (country.properties.result.id) {
      setTimeout(() => {
        layer.id = country.properties.result.id;
        mapLayers.current[country.properties.result.id] = layer._leaflet_id;
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries]);


  const onCountryPopupOpen = (countryId) => {
    const layer = geoJsonLayer.current.getLayer(mapLayers.current[countryId]);
    const { lat, lng } = layer.getCenter();
    map.flyTo([lat, lng]);
    map.once('moveend', () => {
      layer.fireEvent('click', {
        latlng: { lat, lng }
      });
    });
  };


  const countryStyle = {
    fillOpacity: 1,
    color: "#868686",
    weight: 1,
  };

  const highlightFeature = (e) => {
    const layer = e.target;

    layer.setStyle({
      weight: 5,
      color: "white",
      fillOpacity: 0.7,
    });
  };

  const resetHighlight = (e) => {
    const layer = e.target;
    layer.setStyle({
      fillOpacity: 1,
      color: "#868686",
      weight: 1,
    });
  };

  const [tooltipPosition, setTooltipPosition] = useState([0, 0]);
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedResult, setSelectedResult] = useState();

  /**
   *
   * @param {Object} event
   * @param {Object} country
   */
  const onOpenPopup = (event, country) => {
    if (!event.latlng) {
      return;
    }
    setOpenPopup(true);
    setTooltipPosition([event.latlng?.lat, event.latlng?.lng]);
    setSelectedResult(country.properties.result);
  }

  const onPopupReset = () => {
    setOpenPopup(false);
  }

  const clickCountry = (e) => {
    let ind = countries.findIndex(
      (r) => r.properties.u_name === e.target.feature.properties.u_name
    );
    if (ind < 10) {
      setActiveResult(ind);
    } else {
      setActiveResult(-1);
    }
  };

  const getColor = (d) => {
    return d > 90
      ? "#109146"
      : d > 70
        ? "#7CBA43"
        : d > 60
          ? "#FFCC06"
          : d > 50
            ? "#F58E1D"
            : d >= 0
              ? "#BF1E24"
              : "#fff";
  };

  return (
    <div>
      <div>
        <MapContainer
          style={{ height: "100vh", width: "auto" }}
          zoom={4}
          id={'map'}
          center={position}
          ref={setMap}
          doubleClickZoom={false}
        >


          <GeoJSON
            ref={geoJsonLayer}
            style={countryStyle}
            data={countries}
            onEachFeature={onEachCountry}
          />
          {/* {true && (
  <Marker icon={MarkerIcon} position={[28.5946, 16.4861]}>
    <Popup>This is the point you highlighted</Popup>
  </Marker>
)} */}
          <LeafletTooltip
            map={map}
            data={{
              position: tooltipPosition,
            }}
            isActive={openPopup}
            country={selectedResult}
            reset={onPopupReset}
          />
          <Legend map={map} />
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
