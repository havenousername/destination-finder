// http://localhost:1337/api/users/me?populate[groups][populate][0]=regions
import {useToken} from "../components/AuthProvider/AuthProvider";
import useAxios from "axios-hooks";
import authenticationHeader from "./headers";
import {useAuthContext} from "../context/AuthContext";
import {useEffect, useState} from "react";

const useLoadMeWithGroups = () => {
  const url = `${process.env.REACT_APP_BACKEND_URL}/users/me`;
  const token = useToken.getState().token;
  const { user } = useAuthContext();
  const getParams = () => {
    const params = new URLSearchParams();
    params.append('populate', 'statistics.groups');
    params.append('populate', 'statistics.groups.regions');
    return params;
  }

  const [axiosOptions] = useState({
    useCache:false,
    autoCancel:false,
    manual: !user?.id
  });

  const [{ data, loading, error },fetch] = useAxios({
    url,
    params: getParams(),
    method: 'GET',
    ...authenticationHeader(token)
  }, axiosOptions);
  const [groupedData, setGroupedData] = useState({});

  const preparedFetch = () => {
    return fetch({
      params: getParams(),
      method: 'GET',
      ...authenticationHeader(token)
    });
  }

  useEffect(() => {
    if (user?.id && axiosOptions.manual) {
      preparedFetch();
    }
  }, [user]);

  useEffect(() => {
    if (data) {
      setGroupedData(() => ({...data, groups: data?.statistics?.groups ?? []}))
    }
  }, [data]);


  return { data: groupedData, fetch: preparedFetch, loading, error };
};


export default useLoadMeWithGroups;