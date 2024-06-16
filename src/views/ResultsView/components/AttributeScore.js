import React from "react";
import { Row, Col } from "react-bootstrap";
import { BarChart } from "../../../components/BarChart";
import * as myConstant from "../../../data/constantData";
import {capitalize} from "lodash";

export const AttributeScore = ({ score, index, userPref }) => {
  return (
    <Row>
      <Col xs={4} className='d-flex align-items-center'>
        <h6 className='px-2 m-0 py-0' style={{ fontSize: '0.625rem' }}>{capitalize(score.name)}</h6>
      </Col>
      <Col xs={6} className='d-flex align-items-center'>
        <BarChart
          score={score}
          color={myConstant.COLORS[index % myConstant.COLORS.length]}
          benchmark={userPref}
          showBenchmark={true}
        />
      </Col>
      <Col xs={2}>
        <h6 className='px-2 m-0 py-0' style={{fontSize: '0.625rem'}}>
          {100 - Math.abs(score.value - userPref)}%
        </h6>
      </Col>
    </Row>
  );
};
