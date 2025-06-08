import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/App.css";
import { Row, Col } from "react-bootstrap";
import Map from "../MapView/Map";
import Preferences from "../PreferencesView/Preferences";
import { RightSidebar } from "../ResultsView/RightSidebar";
import { Tooltip } from 'react-tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import PersonalInformation from "../Personalnformation/PersonalInformation";
import AppModal from "../../components/AppModal";
import {useAuthContext} from "../../context/AuthContext";
import useTravelRecommenderStore from "../../store/travelRecommenderStore";
import HierarchicalPreferences from "../PreferencesView/HierarchicalPreferences";

const TravelRecommender = () => {
  const [activeResult, setActiveResult] = useState(0);
  const [leftColumnOpen, setLeftColumnOpen] = useState(true);
  const [rightColumnOpen, setRightColumnOpen] = useState(true);
  const { user } = useAuthContext();

  const isNewMode = useTravelRecommenderStore((state) => state.isRdfVersion());

  /**
   *
   * @type {{xl: number, xs: number, lg: number}}
   */
  const leftColumnSizes = {
    xs: 12,
    lg: 4,
    xl: 3,
  };

  /**
   *
   * @type {{xl: number, xs: number, lg: number}}
   */
  const rightColumnSizes = {
    xs: 12,
    lg: 4,
    xl: 3,
  };

  const calculateMiddleSize = (size) =>
    (12 - leftColumnSizes[size] - rightColumnSizes[size]) +
    (leftColumnOpen ? 0 : leftColumnSizes[size]) +
    (rightColumnOpen ? 0 : rightColumnSizes[size]);

  /**
   *
   * @type {{xl: number, xs: number, lg: number}}
   */
  const middleColumnSizes = {
    xs: calculateMiddleSize('xs'),
    lg: calculateMiddleSize('lg'),
    xl: calculateMiddleSize('xl'),
  };

  return (
    <div className="App">
      <Row style={{ height: "100%" }}>
        {leftColumnOpen && (
          <Col
            style={{ height: "100%" }}
            {...leftColumnSizes}
          >
            {!isNewMode && <Preferences/>}
            {isNewMode && <HierarchicalPreferences />}
          </Col>
        )}
        <Col
          style={{ height: "100%", padding: 0 }}
          {...middleColumnSizes}
        >
          <div style={{ display: "grid", gridTemplateColumns: "10px 1fr 10px", height: "100%" }}>
            <div className="expand-bar" onClick={() => setLeftColumnOpen(oldState => !oldState)}>
              <FontAwesomeIcon icon={leftColumnOpen ? faAngleLeft : faAngleRight} />
            </div>
            <Map key={`map-${leftColumnOpen}-${rightColumnOpen}`} setActiveResult={setActiveResult} />
            <div className="expand-bar" onClick={() => setRightColumnOpen(oldState => !oldState)}>
              <FontAwesomeIcon icon={rightColumnOpen ? faAngleRight : faAngleLeft} />
            </div>
          </div>
        </Col>
        {rightColumnOpen && (
          <Col
            className='right-column'
            {...rightColumnSizes}
          >
            <RightSidebar activeResult={activeResult} />
          </Col>
        )}
      </Row>
      <Tooltip id="prio-switch-tooltip" style={{ width: "300px", zIndex: 99999 }} />
      <Tooltip id="additional-info-tooltip" style={{ width: "300px", zIndex: 99999 }} place="bottom" />
      <Tooltip id="barchart-tooltip" style={{ width: "300px", zIndex: 99999 }} place="bottom" />
      {user?.id && <PersonalInformation/>}
      <AppModal />
    </div>
  );
};

export default TravelRecommender;
