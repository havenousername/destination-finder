import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import LoadCountriesTask from "./tasks/LoadCountriesTask";
import Loading from "./views/GeneralView/Loading";
import useTravelRecommenderStore from "./store/travelRecommenderStore";
import AppRoutes from "./Routes";
import {useAuthContext} from "./context/AuthContext";
import {useLoadFavourites} from "./hooks/useLoadFavourites";
import * as turf from '@turf/turf';
import useRegions from "./api/rdf/useRegions";

const App = () => {
  const [fileRetrieved, setFileRetrieved] = useState([]);
  const {
    countries,
    setCountries,
    setResults,
    userData,
    recommendationType,
    algorithmUsed,
    refresh,
    version,
  } = useTravelRecommenderStore();
  const isRdfVersion = useTravelRecommenderStore(state => state.isRdfVersion());
  const hierarchicalRegions = useRegions();


  const load = () => {
    const loadCountriesTask = new LoadCountriesTask();
    loadCountriesTask.load(setFileRetrieved);
  };


  const calculateScores = () => {
    if (fileRetrieved?.length > 0) {
      const loadCountriesTask = new LoadCountriesTask();
      loadCountriesTask.processCountries(
        fileRetrieved,
        userData,
        setCountries,
        setResults,
        recommendationType,
        algorithmUsed
      );
    }
  };

  useEffect(load, []);
  useEffect(() => {
      calculateScores();
  }, [userData, fileRetrieved, setCountries, setResults, recommendationType, algorithmUsed, refresh, isRdfVersion]);

  const auth = useAuthContext();
  const { fetch } = useLoadFavourites();

  useEffect(() => {
    if (auth.user?.id) {
      // console.log(auth.user);
      fetch(auth.user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user]);

  return (
    <div style={{ height: "100vh" }}>
        {countries.length === 0 && !isRdfVersion ? (
          <Loading />
        ) : (
          <AppRoutes/>
        )}
    </div>
  );
};

export default App;
