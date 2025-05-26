import React, {useState, useEffect} from "react";
import { Form, Row, Col } from "react-bootstrap";
import {get, set} from "lodash";
import "../styles/App.css";
import useTravelRecommenderStore from "../store/travelRecommenderStore";
import styles from "../views/PreferencesView/components/SlideRange.module.css";
import {useDebounceCallback} from "usehooks-ts";

const RangedInput = ({userDataKey, title, step = 1, stepsText = ['Low', 'Medium', 'High']}) => {
  const { userData, setUserData } = useTravelRecommenderStore();
  const [value, setValue] = useState(get(userData, userDataKey));
  const onChangeInput = (e) => {
    setValue(e.target.valueAsNumber);
  }

  const setUserDataDelayed = useDebounceCallback((value) => {
    const newUserData = set(userData, userDataKey, value);
    setUserData({...newUserData});
  }, 100);

  useEffect(() => {
    if (value != get(userData, userDataKey)) {
      setUserDataDelayed(value);
    }
  }, [value]);

  return (
    <Form>
      <p style={{ textAlign: "left" }}>{title}</p>
      <Row>
        <Col>
          <p style={{ opacity: "0.7", fontSize: "0.625rem", textAlign: 'start' }}>{ stepsText[0] }</p>
        </Col>
        <Col>
          <p style={{ opacity: "0.7", fontSize: "0.625rem" }}>{ stepsText[1] }</p>
        </Col>
        <Col>
          <p style={{ opacity: "0.7", fontSize: "0.625rem", textAlign: 'end' }}>{ stepsText[2] }</p>
        </Col>
      </Row>
      <Row>
        <input
          style={{
            padding: "0px",
            margin: "0px",
            '--slider-color': '255, 255, 255',
            '--slider-progress': `${value}%`,
          }}
          min={0}
          max={100}
          step={step}
          type="range"
          value={value}
          className={styles.slideRange}
          onChange={onChangeInput}
        />
      </Row>
    </Form>
  );
};

export default RangedInput;
