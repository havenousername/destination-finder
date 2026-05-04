import {useEffect, useState} from "react";
import useAxios from "axios-hooks";
import {LinkedList} from "../../helpers/linkedList";
import loading from "../../views/GeneralView/Loading";


const useRegions = () => {
  const [{response, error}, refersh] = useAxios({
    url: `${process.env.REACT_APP_RDF_BACKEND_API}/region`,
    params: {}
  });


  return [response, refersh];
}

export const useSimplifiedRegions = () => {
  const [{response, loading, error}, refersh] = useAxios({
    url: `${process.env.REACT_APP_RDF_BACKEND_API}/region/simplified`,
    params: {}
  }, { manual: true });

  const getRegionByType = (type) => {
    refersh({
      params: {
        regionType: type,
      }
    }).catch(e => console.error(e));
  }


  return { fetchLightRegionByType: getRegionByType, response, error, loading };
}


export const useRegionTypes = () => {
  const [{response, error}, refersh] = useAxios({
    url: `${process.env.REACT_APP_RDF_BACKEND_API}/region/hierarchy`,
    params: {}
  });

  const regionTypes = LinkedList.fromArray(response?.data ?? []);

  return {types:  regionTypes};
}

export const useGetRegion = () => {
  const [{response, error}, refersh] = useAxios({
    url: `${process.env.REACT_APP_RDF_BACKEND_API}`,
    params: {}
  }, { manual: true });

  const fetchRegion = (id) => {
    refersh({
      url: `${process.env.REACT_APP_RDF_BACKEND_API}/region/${id}`,
    });
  }

  return { fetchRegion, response, error, loading };
}

export const getFetchPoiById = (id) => {
  return fetch(`${process.env.REACT_APP_RDF_BACKEND_API}/region/poi/${id}`,{
    method: "GET",
  });
}


export const useGetJsonMap = () => {
  const [{response, error}, refersh] = useAxios({
    url: `${process.env.REACT_APP_RDF_BACKEND}/`,
    params: {}
  }, { manual: true });

  const fetchJsonMap = (type, id) => {
    return refersh({
      url: `${process.env.REACT_APP_RDF_BACKEND}/maps/${type}/${id}.json`,
    });
  }

  const fetchJsonMapManually = (type, id) => {
    return fetch(`${process.env.REACT_APP_RDF_BACKEND}/maps/${type}/${id}.json`,{
      method: "GET",
    });
  }

  return { fetchJsonMap, response, error, loading, fetchJsonMapManually };
}

export default useRegions;