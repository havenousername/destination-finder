import { Col } from "react-bootstrap";
import { useFavouritesPaginationFrontend } from "../../hooks/useLoadFavourites";
import styles from "./RightPersonal.module.css";
import useTravelRecommenderStore from "../../store/travelRecommenderStore";
import useLoadMeWithGroups from "../../api/useLoadMeWithGroups";
import useLoadStatistics from "../../api/useLoadStatistics";
import GoToMapCountryButton from "../../components/GoToMapCountry";
import { useState, useRef, useEffect } from "react";
import GroupRow from "../../components/GroupRow";

const FavouriteRow = ({ score, region, id }) => {
  return (
    <div className={styles.elementRow}>
      <Col xs={5} md={4} xl={6} className='d-flex flex-column'>
        {score && <h6 className='fa-xs lh-1 fw-bold'>Score {Math.floor(score)}/100</h6>}
        <h5 className={`fs-6 fw-bold ${styles.groupRegions}`}>{region}</h5>
      </Col>
      <Col className={'d-flex justify-content-end align-items-center'}>
        <GoToMapCountryButton regionId={id} />
      </Col>
    </div>
  )
};

const RightPersonal = () => {
  const { data: favourites } = useFavouritesPaginationFrontend();
  const { countries } = useTravelRecommenderStore();
  const scrollRef = useRef();
  const inputRef = useRef();

  const regions = countries.reduce((acc, country) => ({
    ...acc,
    [country.properties.result.uname]: {
      name: country.properties.name,
      score: country.properties.result.scores.totalScore,
      id: country.properties.result?.id
    },
  }
  ), {});

  const { data: groupsData, loading: groupsLoading } = useLoadMeWithGroups();
  const [{ data: statsData, loading: statsLoading }] = useLoadStatistics();
  const [newGroupCreation, setNewGroupCreation] = useState(false);


  useEffect(() => {
    if (newGroupCreation) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      scrollRef.current?.addEventListener('scrollend', () => {
        inputRef.current.focus();
      }, { once: true })
    }
  }, [newGroupCreation])

  const [groups, setGroups] = useState([]);

  const suggestions = statsData?.statistics?.recommendations ?? [];

  useEffect(() => {
    if (!groupsLoading && groupsData) {
      setGroups(groupsData?.groups ?? []);
    }
  }, [groupsData]);

  if (groupsLoading || statsLoading) {
    return null;
  }
  return (
    <div className='p-3 d-flex flex-column gap-4'>
      {suggestions?.length > 0 && (
        <Col>
          <h5 className='fs-6 fw-bold pb-2'>Personal Recommendations</h5>
          <div className={styles.favouritesHeight}>
            <div className={'d-flex pe-2 flex-column gap-3'}>
              {suggestions.map(suggestion => (
                <FavouriteRow
                  key={suggestion.id}
                  region={regions[suggestion.u_name].name}
                  score={regions[suggestion.u_name].score}
                  id={regions[suggestion.u_name].id}
                />
              ))}
            </div>
          </div>
        </Col>
      )}
      <Col>
        <h5 className='fs-6 fw-bold pb-2'>Favourite Regions</h5>
        <div className={styles.favouritesHeight}>
          <div className={'d-flex pe-2 flex-column gap-3'}>
            {favourites.data.map(favourite => (
              <FavouriteRow
                key={favourite.id}
                region={regions[favourite.name].name}
                score={regions[favourite.name].score}
                id={regions[favourite.name].id}
              />
            ))}
          </div>
        </div>
      </Col>
      <Col>
        <div style={{ justifyContent: "space-between", display: "flex" }}>
          <h5 className='fs-6 fw-bold pb-2'>Travel collections</h5>
          <span onClick={() => {
            setNewGroupCreation(true);
          }
          }
            style={{ cursor: "pointer", fontSize: "15px", marginRight: "25px" }}>Add new collection</span>
        </div>
        <div ref={scrollRef} className={styles.groupsHeight}>
          <div className={'d-flex pe-2  flex-column gap-3'}>
            {groups.map((group, idx) => (
              <GroupRow
                key={idx}
                id={group.id}
                arrayPosition={idx}
                name={group.name}
                description={group.description}
                groups={groups}
                regions={group.regions}
                onCreate={false}
                setGroups={setGroups}
              />
            ))}
            {groups.length === 0 && !newGroupCreation && (
              <div className='w-full'>
                <h6>No travel collections yet</h6>
              </div>
            )}
            {newGroupCreation && <div style={{display: "block"}}>
            <GroupRow
                inputRef={inputRef}
                setGroups={setGroups}
                groups={groups}
                setCreateNewGroup={setNewGroupCreation}
                onCreate={newGroupCreation} />
            </div>}
          </div>
        </div>
      </Col>
    </div>
  );
};

export default RightPersonal;