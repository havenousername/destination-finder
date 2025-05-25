import React, { useState } from "react";
import "../../styles/App.css";
import { CustomizationContainer } from "./components/CustomizationContainer";
import { PresetTypesContainer } from "./components/PresetTypesContainer";
import { Tabs, Tab } from "react-bootstrap";
import TravelMonths from "./components/TravelMonths";
import useTravelRecommenderStore from "../../store/travelRecommenderStore";
import RangedPreference from "../../components/RangedPreference";
import styles from "./Preferences.module.css";
import { ToggleButton } from "react-bootstrap";

const Preferences = () => {
  const { userData, setUserData,  recommendationType, setRecommendationType } = useTravelRecommenderStore();

  const [key, setKey] = useState('advanced');
  const isSingleTrip = recommendationType === 'single';
  return (
    <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", padding: "1rem" }}>
      <div style={{ textAlign: "left", paddingTop: "10px" }}>
        <div style={{ fontWeight: "700", fontSize: "1.1em" }}>DestiRec</div>
        <span style={{ fontWeight: "300", fontSize: "0.8rem" }}>Travel Destination Recommender System</span>
      </div>

      <div style={{marginTop:"10px", display: "flex", justifyContent: "space-evenly"}}>
        <ToggleButton
          checked={isSingleTrip}
          onClick={() => {setRecommendationType("single")}}
          type="checkbox"
          className={styles.toggle}
          variant="outline-primary"
          value={"Single destination trip"}
        >
          <span>Single Trip</span>
        </ToggleButton>
        <ToggleButton
          checked={!isSingleTrip}
          onClick={() => {setRecommendationType("composite")}}
          type="checkbox"
          className={styles.toggle}
          variant="outline-primary"
          value={"Multi composite trip"}
        > <span>Composite Trip</span>
        </ToggleButton>
      </div>
      
      { !isSingleTrip &&<div className='mb-4'>
        <RangedPreference
          userDataKey='Distance'
          title='Distance between regions'
          checkKey='isDistanceNotImportant'
          stepsText={['Low', 'Medium','High']}
          checkLabel='Dont consider distance between countries'
          checkTooltipText='If you select the checkbox the distance between countries in a composite trip would not be in consideration
          ,meaning that you can get very far away countries from each others'
          step={10}
        />
      </div>}
      { !isSingleTrip &&<div className='mb-4'>
        <RangedPreference
          userDataKey='Weeks'
          title='Total Of Weeks'
          stepsText={['1', '11','21']}
          step={5}
        />
      </div>}
      { !isSingleTrip && <div className='mb-4'>
        <RangedPreference
          userDataKey='weekAllocationDistribution'
          title='Week allocation distribution'
          step={10}
        />
      </div>}
      <div className='mb-4'>
        <RangedPreference
          userDataKey='Budget'
          checkKey='isPriceImportant'
          title='Budget'
          checkLabel='Filter out the destinations over the  budget'
          checkTooltipText='If you select the checkbox the over-budget destinations will be
          filtered out. if it is not selected, price would have an impact on the
          recommendations just like any other attribute'
          step={50}
        />
      </div>
      <div className='mb-4'>
        <RangedPreference
          userDataKey='VisitorIndex.score'
          title='Region Popularity'
          stepsText={['High', 'Medium', 'Low']}
        />
      </div>
      <div className='mb-4'>
        <TravelMonths />
      </div>
      <div className='mb-4'>
        <Tabs
          activeKey={key}
          id="mode"
          onSelect={(k) => { setKey(k); setUserData({ ...userData, PresetType: [] }); }}
          className="mb-3"
          style={{ display: "grid", columnGap: "1rem", gridAutoFlow: "column" }}
        >
          <Tab eventKey="novice" title="Presets (Novice)">
            <PresetTypesContainer />
          </Tab>
          <Tab eventKey="advanced" title="Advanced Preferences">
            <CustomizationContainer />
          </Tab>
        </Tabs>
      </div>
      <p style={{ textAlign: "left", fontSize: "0.8em" }}>(c) Asal Nesar Noubari, Cem Nasit Sarica and Wolfgang Wörndl (Technical University of Munich)</p>
    </div>
  );
};

export default Preferences;
