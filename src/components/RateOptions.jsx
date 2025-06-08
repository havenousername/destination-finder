import {Form, Row, FormCheck} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import useTravelRecommenderStore from "../store/travelRecommenderStore";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";


const RateOptions = ({attrName, sliderColor}) => {
  const options = [0, 25, 50, 75, 100]
  const attributeLabels = [
    "😐", "🙂", "😌", "😃", "🤩"
  ];

  const onChange = (value) => {
    setUserData({
      ...userData,
      Attributes: {
        ...userData.Attributes,
        [attrName]: {
          ...userData.Attributes[attrName],
          score: value,
        },
      },
    });

  };

  const {userData, setUserData} = useTravelRecommenderStore();
  const [sliderProgress, setSliderProgress] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      onChange(sliderProgress);
    }, 100)
  }, []);

  const breakpoints = useBreakpoint();
  const isXl = !!breakpoints.xl && !breakpoints.xxl;
  return (
    <Row>
      <Row xs={1} md={1} xl={2} className='d-flex'>
        <h6 className='m-0' style={{ fontSize:  '0.8rem', textAlign: "left" }}>{attrName}</h6>
      </Row>
      <Row className="m-0">
        <Form className="d-flex gap-2">
          {options.map((option, index) => (
            <Form.Check
              inline
              value={sliderProgress}
              label={`${attributeLabels[index]}`}
              title={attributeLabels[option]}
              key={index}
              checked={option === sliderProgress}
              name="group1"
              type='radio'
            >
              <FormCheck.Input
                checked={option === sliderProgress}
                type="radio"
                style={{
                  accentColor: sliderColor,
                  backgroundColor: option === sliderProgress ? sliderColor : "white",
                }}
                name={attrName}
                onChange={() => {
                  onChange(option);
                  setSliderProgress(option);
                }}
              />
              <FormCheck.Label>{`${attributeLabels[index]}`}</FormCheck.Label>
            </Form.Check>
          ))}
        </Form>
      </Row>
    </Row>
  );
};

export default RateOptions;