import {useToken} from "../components/AuthProvider/AuthProvider";
import useAxios from "axios-hooks";
import authenticationHeader from "./headers";
import useApiEvent from "../hooks/useApiEvent";
import {useEffect} from "react";


 const useLoadStatistics = () => {
  const token = useToken.getState().token;
  const [response, refetch] = useAxios({
     url: `${process.env.REACT_APP_BACKEND_URL}/users/me?populate=statistics.recommendations`,
     ...authenticationHeader(token)
   });
  const apiEvents = useApiEvent();

   useEffect(() => {
     // console.log(apiEvents.apiEvent);
     if (apiEvents.apiEvent) {
       refetch();
     }
   }, [apiEvents.apiEvent]);

  return [response, refetch]
};

 export default useLoadStatistics;