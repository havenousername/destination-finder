import useRegionStore from "../api/rdf/useRegionStore";
import React, {useEffect} from "react";
import Accordion from "react-bootstrap/Accordion";
import {COLORS_MAP} from "../data/constantData";


const RdfRecommendations = () => {
  const {recommendations} = useRegionStore();

  useEffect(() => {
    console.log(recommendations);
  }, [recommendations]);

  if (recommendations.length === 0) {
    return (<div className="w-100 h-100 d-flex align-items-center">
      No results found. Please select the search area and region first
    </div>);
  }
  return (<Accordion>
      {recommendations.map((item, index) => (<Accordion.Item eventKey={index}>
        <Accordion.Header>
          <div className="d-flex w-100 h-100 gap-3">
            <div
              style={{
                borderRadius: '50%',
                width: '1.5rem',
                height: '1.5rem',
                border: `1px solid rgba(255, 255, 255, 0.7)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.priority}
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
      </Accordion.Item>))}
  </Accordion>);
}

export default RdfRecommendations;