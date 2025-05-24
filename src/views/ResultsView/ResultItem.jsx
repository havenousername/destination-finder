import Accordion from "react-bootstrap/Accordion";
import FavouriteTag from "../../components/FavouriteTag";
import ResultInfo from "./components/ResultInfo";
import React from "react";


const ResultItem = ({ accordElem, index, activeIndex, isComposite, setActiveIndex, item }) => {
  const onClick = () => {
    if (index === activeIndex) {
      setActiveIndex(-1);
    } else {
      setActiveIndex(index);
      accordElem.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }
  return (
    <Accordion.Item  eventKey={index}>
      <Accordion.Header
        onClick={onClick}
      >
        <div className={'d-flex w-100 gap-2'}>
          <FavouriteTag country={item.uname} />
           {!isComposite && <span>{index + 1}.</span>}<span> {item.region}</span>
        </div>
      </Accordion.Header>
      <Accordion.Body>
        <ResultInfo
          country={item}
          label={index + 1}
        />
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default ResultItem;