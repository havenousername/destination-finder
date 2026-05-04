import React, {useEffect, useState} from "react";
import useTravelRecommenderStore from "../store/travelRecommenderStore";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

const RateOptions = ({attrName, sliderColor}) => {
  const options = [-1, 0, 25, 50, 75, 100]
  const attributeLabels = [
    "Don't consider 🙈",
    "Anything is good 😐",
    "Some quality 🙂",
    "Average quality 😌",
    "Good quality 😃",
    "Give me the best 🤩"
  ];
  const [selectedAttribute, setSelectedAttribute] = useState(attributeLabels[0]);

  const onChange = (value) => {
    setUserData({
      ...userData,
      Attributes: {
        ...userData.Attributes,
        [attrName]: {
          ...userData.Attributes[attrName],
          score: value === -1 ? 0 : value,
          weight: value === -1 ? 0 : 1,
        },
      },
    });

  };

  const selectAttributeLabel = (optionIndex) => {
    setSelectedAttribute(attributeLabels[optionIndex]);
  }

  const {userData, setUserData} = useTravelRecommenderStore();
  const [sliderProgress, setSliderProgress] = useState(options[0]);

  useEffect(() => {
    setTimeout(() => {
      onChange(sliderProgress);
    }, 100)
  }, []);

  return (
    <div className={`d-flex`}>
      <div style={{minWidth: '6rem'}} className="d-flex flex-column justify-content-center">
        <span className='m-0' style={{fontSize: '0.85rem', textAlign: "left", fontWeight: "bold"}}>{attrName}</span>
        <span className='m-0' style={{fontSize: '0.75rem', textAlign: "left"}}>
          Target: { sliderProgress === -1 ? 'None' : '>=' + sliderProgress }
        </span>
      </div>
      <div className={'preference-option flex-grow-1'}>
        <DropdownButton
          id="dropdown-search-area"
          title={selectedAttribute}
          style={{
            '--bg-color-preference': sliderColor,
          }}
        >
            {options.map((option, index) =>
              <Dropdown.Item
                key={index}
                className={'dropdown-item-preference'}
                style={{
                  minWidth: "12rem",
                  width: "100%",
                }}
                onClick={() => {
                  onChange(option);
                  setSliderProgress(option);
                  selectAttributeLabel(index)
                }}
                as="button">
                {`${attributeLabels[index]}`}
              </Dropdown.Item>)}
          </DropdownButton>
        </div>
    </div>
  );
};

export default RateOptions;