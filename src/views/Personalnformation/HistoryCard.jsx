import useTravelRecommenderStore from "../../store/travelRecommenderStore";
import Card from "react-bootstrap/Card";
import styles from "./VisitedHistory.module.css";
import {Col, Row} from "react-bootstrap";
import GoToMapCountryButton from "../../components/GoToMapCountry";
import {toImageUrl} from "../../tasks/toImageUrl";
import AppCarousel from "../../components/AppCarousel";
import {useIntersectionObserver} from "usehooks-ts";
import {memo, useEffect, useState} from "react";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {useAppModal} from "../../components/AppModal";
import HandleVisit from "../../components/Modals/HandleVisit";
import {message} from "antd";

const HistoryCard = ({
 historyEntity,
 isLast = false,
 loadMoreEntities,
 onDelete,
 id
}) => {
  const modal = useAppModal();
  const { countries } = useTravelRecommenderStore();
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.5,
  });
  const [entity, setEntity] = useState(historyEntity);

  const onEdit = () => {
    if (!historyEntity.region?.data) {
      message.error('Cannot edit history entity without region');
      return;
    }
    modal.setComponent(
      <HandleVisit
          oldVisit={{...entity, id }}
          country={{ region: historyEntity.region.data.attributes.Region }}
          setOldVisit={visit => {
            Object.keys(visit).forEach(key => {
              if (key === 'photos' || key === 'region') {
                return
              }
              setEntity(oldVisit =>
                ({...oldVisit, [key]: visit[key] }))
            })
          }}
      />
    )
    modal.setIsOpen(true);
  }

  useEffect(() => {
    if (isIntersecting && isLast) {
      loadMoreEntities()
    }
  }, [isIntersecting]);

  const currentRegion = countries?.find(country => country.properties.result.region === entity.region.data?.attributes.Region);
  const regionInfo = {
    region: currentRegion?.properties.result.region,
    score: currentRegion?.properties.result.scores.totalScore
  };
  const currentImages = entity.images.data?.map(image => toImageUrl(image.attributes)) ??
    [require('../../images/default-image.jpg')];

  return (
    <Card className={'rounded-4'} ref={ref}>
      <div
        className={`px-4 position-absolute z-3 text-white d-flex justify-content-between w-100 ${styles.historyRegion}`}
      >
        <h5 className='fa-sm'>{regionInfo.region}</h5>
        <h5 className='fa-sm'>Score: {Math.floor(regionInfo.score)}/100</h5>
      </div>
      <AppCarousel images={currentImages} />
      <Card.Body>
        <Row>
          <Col className={'col-6'}>
            <h5 style={{ fontSize: '0.8rem' }}>Arrival: {new Date(+entity.arrived).toLocaleDateString()}</h5>
          </Col>
          <Col className={'col-6'}>
            <h5 style={{ fontSize: '0.8rem' }} className='text-lg-end m-0'>Review: {entity.review}/5</h5>
          </Col>
        </Row>
        <Row >
          <Col className={'col-6'}>
            <h5 style={{ fontSize: '0.8rem' }}>Departure: {new Date(+entity.departed).toLocaleDateString()}</h5>
          </Col>
          <Col className={'col-6 d-flex justify-content-end'}>
            <GoToMapCountryButton
              regionId={currentRegion?.properties?.result.id}
              showText={false}
            />
            <button className="btn text-white" onClick={() => onEdit(id)}>
              <EditOutlined/>
            </button>
            <button className="btn text-white" onClick={() => onDelete(id)}>
              {<DeleteOutlined/>}
            </button>
          </Col>
        </Row>
        <Card.Title className='fs-6'>
          {entity.title}
        </Card.Title>
        <Card.Text className={`${styles.description} fa-xs mb-1`}>
          {entity.description}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default memo(HistoryCard);