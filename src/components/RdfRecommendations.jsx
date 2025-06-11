import useRegionStore from "../api/rdf/useRegionStore";
import React, {useEffect, useState} from "react";
import Accordion from "react-bootstrap/Accordion";
import {COLORS_MAP} from "../data/constantData";
import ResultInfo from "../views/ResultsView/components/ResultInfo";
import RdfRecommendationDetails from "./RdfRecommendationDetails";

const RdfRecommendations = () => {
  const {recommendations} = useRegionStore();
  const [activeKey, setActiveKey] = useState(undefined);


  const handleSelect = (eventKey) => {
    setActiveKey(prev => (prev === eventKey) ? undefined : eventKey);
  };


  if (recommendations.length === 0) {
    return (<div className="w-100 h-100 d-flex align-items-center">
      No results found. Please select the search area and region first
    </div>);
  }
  return (
    <Accordion activeKey={activeKey} onSelect={handleSelect}>
      {recommendations.map((item, index) => (<Accordion.Item eventKey={index}>
        <Accordion.Header>
          <div className="d-flex w-100 h-100 gap-3">
            <div
              style={{
                borderRadius: '50%',
                width: '1.5rem',
                height: '1.5rem',
                border: '1px solid #336273',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span>
                {item.priority}
              </span>
            </div>
            <div className={'d-flex flex-column flex-grow-1'}>
              <span
                title={item.region.name}
                style={{
                  maxWidth: '120px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  width: "100%"
                }}
              >
                {item.region.name}
              </span>
              <span
                title={item.region.name}
                style={{
                  fontSize: '0.8rem',
                }}
              >
                Good for
                <span className="ms-2">
                  {item.explanation.forFeatures.map((feature) => {
                    return (
                      <div style={{
                        width: '10px',
                        height: '10px',
                        background: COLORS_MAP[feature],
                        borderRadius: '50%',
                        display: 'inline-block',
                        border: '1px solid white',
                        margin: '0 2px',
                      }} >
                      </div>
                    )
                  })}
                </span>
              </span>
            </div>
          </div>
        </Accordion.Header>

        <Accordion.Body>
          <RdfRecommendationDetails
            isActive={activeKey === index}
            recommendation={item}
          />
        </Accordion.Body>
      </Accordion.Item>))}
  </Accordion>);
}

export default RdfRecommendations;