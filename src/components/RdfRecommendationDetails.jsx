import React, {useEffect, useMemo, useState} from "react";
import {Row} from "react-bootstrap";
import {COLORS_MAP} from "../data/constantData";
import searchGoogleImages from "../api/searchGoogle";
import {getFetchPoiById} from "../api/rdf/useRegions";
import Card from "react-bootstrap/Card";
import {capitalize} from "lodash";
import {QuestionCircleOutlined} from "@ant-design/icons";
import Image from 'react-bootstrap/Image';
import {splitPascalCase} from "../helpers/textHelpers";
import {Cell, Pie, PieChart} from "recharts";
import * as myConstant from "../data/constantData";

const iconMap = {
  MOUNTAIN: 'EnvironmentOutlined',
  LAKE: 'WaterWaveOutlined',
  PARK: 'PushpinOutlined',
  FOREST: 'TreeOutlined',
  NATURAL_RESERVE: 'FieldOutlined',
  CANYON: 'EnvironmentOutlined',
  HISTORIC_DISTRICT: 'BankOutlined',
  UNESCO_SITE: 'TrophyOutlined',
  CATHEDRAL: 'BankOutlined',
  CASTLE: 'BankOutlined',
  HIKING_TRAIL: 'CompassOutlined',
  CLIMBING_AREA: 'RiseOutlined',
  CLIMBING_ROUTE: 'RiseOutlined',
  LOOKOUT_POINT: 'EyeOutlined',
  SNOWBOARDING: 'SnowflakeOutlined',
  SKIING: 'SnowflakeOutlined',
  SKI_JUMPING: 'DownOutlined',
  SLEDDING: 'DownOutlined',
  SKI_RESORT: 'SnowflakeOutlined',
  ICE_CLIMBING: 'RiseOutlined',
  SNOW_PARK: 'SnowflakeOutlined',
  DIVING_SPOT: 'WaterWaveOutlined',
  SCUBA_DIVING: 'WaterWaveOutlined',
  SURF_SPOT: 'WaterWaveOutlined',
  MARINA: 'AnchorOutlined',
  WATER_PARK: 'WaterWaveOutlined',
  AMUSEMENT_PARK: 'SmileOutlined',
  THEME_PARK: 'SmileOutlined',
  KART_RACING_TRACK: 'CarOutlined',
  SHOOTING_RANGE: 'AimOutlined',
  ARCADE: 'PlaySquareOutlined',
  ESCAPE_ROOM: 'LockOutlined',
  FESTIVAL_VENUE: 'StarOutlined',
  ICE_CREAM_SHOP: 'ShopOutlined',
  BOWLING_ALLEY: 'TrophyOutlined',
  BEER_GARDEN: 'ShopOutlined',
  BREWERY: 'ShopOutlined',
  RESTAURANT: 'ShopOutlined',
  STREET_FOOD_VENUE: 'ShopOutlined',
  FOOD_MARKET: 'ShopOutlined',
  SHOPPING_MALL: 'ShoppingCartOutlined',
  SOUVENIR_SHOP: 'ShoppingCartOutlined',
  MARKET: 'ShoppingCartOutlined',
  BEACH: 'WaterWaveOutlined',
  MUSEUM: 'BankOutlined',
  ART_GALLERY: 'PictureOutlined',
};


const RdfRecommendationDetails = ({recommendation, isActive}) => {

  const [fetchedChildren, setFetchedChildren] = useState([]);
  const [country, setCountry] = React.useState(recommendation.region.name);

  const diverseChildren = useMemo(() => {
    const children = recommendation.region.children ?? [];

    if (children.length <= 10) {
      const uniqueMap = new Map();
      children.forEach((item) => {
        uniqueMap.set(item.value0.localName, item);
      });
      return [...uniqueMap.values()];
    }
    const map = new Map();

    // Group items by feature (value1.localName)
    children.forEach(item => {
      const key = item.value1.localName;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });

    const totalSize = () => Array.from(map.values()).reduce((sum, group) => sum + group.length, 0);

    // Trim each group down to balance if total is > 10
    let currentSize = totalSize();
    while (currentSize > 10) {
      let changed = false;
      const optimalPerGroup = Math.ceil(currentSize / map.size);

      for (const [_, group] of map.entries()) {
        if (group.length > optimalPerGroup) {
          group.pop();
          changed = true;
        }
      }

      if (!changed) break;
      currentSize = totalSize();
    }

    // Collect all items into a flat array
    const result = Array.from(map.values()).flat();
    // Fisher–Yates Shuffle
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    const uniqueMap = new Map();
    result.forEach((item) => {
      uniqueMap.set(item.value0.localName, item);
    });
    return [...uniqueMap.values()];
  }, [recommendation.region.children]);

  useEffect(() => {
    if (recommendation.region.name !== country) {
      setCountry(recommendation.region.name);
      setFetchedChildren([]);
    }
  }, [recommendation.region.name]);

  useEffect(() => {
    if (isActive && fetchedChildren.length === 0) {
      for (const child of diverseChildren) {
        const id = child.value0.localName;
        getFetchPoiById(id).then(async (poi) => {
          const json = await poi.json();
          setFetchedChildren((children) => [...children, json]);
        })
      }
    }
  }, [isActive, recommendation.region.children]);


  const donutState = Object.freeze({
    innerRadius: 10,
    outerRadius: 25,
  });

  const pieChartData = recommendation.explanation.forFeatures.map((feature) => {
    return {
      name: feature,
      value: recommendation.region.children.filter(child =>
        child.value1.localName.toLowerCase() === feature).length,
    };
  });


  return (
    <Row className="white-theme">
      <div className="d-flex position-relative my-2">
        <h6 style={{fontSize: '0.7rem', fontWeight: 'bold'}}>
          {splitPascalCase(recommendation?.region.parentRegion.localName)}
        </h6>
        <div
          className="position-absolute d-flex flex-row-reverse align-items-center"
          style={{ right: '4px', top: '-15px' }}
        >
          <PieChart
            width={(donutState.outerRadius + 10) * 2}
            height={(donutState.outerRadius + 10) * 2}
          >
            <Pie
              data={pieChartData}
              innerRadius={donutState.innerRadius}
              outerRadius={donutState.outerRadius}
              fill="#8884d8"
              paddingAngle={0}
              dataKey="value"
              isAnimationActive={false}
            >
              {recommendation.explanation.forFeatures?.map((entry, index) => {
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={myConstant.COLORS_MAP[entry]}
                  />
                )
              })}
            </Pie>
          </PieChart>
          <span style={{ fontSize: '0.66rem', maxWidth: '7rem' }}>
            {pieChartData.map(data => `${data.value} ${capitalize(data.name)}`).join(", ") + " POI's"}
          </span>
        </div>
      </div>
      <div className="d-flex">
        <h6 style={{fontSize: '0.85rem', fontWeight: 'bold'}}>
          {recommendation?.region.name}
        </h6>
      </div>
      <p className={'mt-1'} style={{fontSize: "x-small"}}>
        {recommendation?.region.name} {' has the following Points of Interest that make it good for '}
        {recommendation.explanation.forFeatures.map(i => capitalize(i)).join(", ")}
      </p>
      <div className="d-flex flex-column gap-3 justify-content-center align-items-center text-start">
        {fetchedChildren
          .sort((a, b) => +a.percentageScore > +b.percentageScore ? -1 : 1)
          .map((child, index) => {
            const feature = capitalize(child.feature?.regionFeature.toLowerCase() ?? 'Unknown');
            const poi = child.name;
            const color = COLORS_MAP[feature.toLowerCase()] ?? 'gray';
            const IconComponent = child.featureSpecificType &&
            iconMap[child.featureSpecificType] ?
              require('@ant-design/icons')[iconMap[child.featureSpecificType]] :
              require('@ant-design/icons')['QuestionCircleOutlined'];

            const image = child.images?.value1 === String(null)
              ? child.images?.value0 : child.images?.value1;
            return (
              <Card key={index} style={{marginBottom: '10px', width: '100%'}}>
                <Card.Body style={{padding: '10px'}}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        marginBottom: '0.3rem',
                        maxWidth: '11rem'
                      }}
                    >
                      Name: <span style={{fontWeight: 400}}>{poi}</span>
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        borderRadius: '50%',
                        border: '1px solid white',
                        padding: '3px',
                      }}
                    >
                      {child.percentageScore}
                    </div>

                    {/* Optional Image */}
                    {image && image !== 'null' && (
                      <Image
                        src={image}
                        style={{
                          width: '100%',
                          height: '7rem',
                          objectFit: 'cover',
                          padding: 0
                        }}
                        thumbnail
                      />
                    )}

                    <div className="d-flex align-items-center gap-2" style={{fontSize: '0.7rem'}}>
                      <span style={{fontWeight: 'bold'}}>Feature:</span>
                      {!!IconComponent ? (
                        <IconComponent style={{fontSize: '14px', color}}/>
                      ) : (
                        <QuestionCircleOutlined/>
                      )}
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: color,
                          borderRadius: '50%',
                          border: '1px solid white',
                          display: 'inline-block',
                        }}
                      />
                      <span>{feature}</span>
                    </div>

                    <div className="d-flex align-items-center gap-2" style={{fontSize: '0.7rem'}}>
                      <span style={{fontWeight: 'bold'}}>Website:</span>
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'inline-block',
                          maxWidth: '180px',
                        }}
                        title={child.officialWebsite || 'No website'}
                      >
                      {child.officialWebsite || 'No website'}
                    </span>
                    </div>

                    <div className="d-flex align-items-center gap-2" style={{fontSize: '0.7rem'}}>
                      <span style={{fontWeight: 'bold'}}>Wikidata:</span>
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'inline-block',
                          maxWidth: '180px',
                          color: 'white',
                        }}
                        title={child.source.namespace + child.source.localName}
                      >
                      <a
                        style={{
                          color: 'white',
                          textDecoration: 'none',
                        }}
                        href={child.source.namespace + child.source.localName}
                        target="_blank"
                      >
                        {child.source.namespace + child.source.localName}
                      </a>
                    </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
      </div>

    </Row>
  )
    ;
};

export default RdfRecommendationDetails;