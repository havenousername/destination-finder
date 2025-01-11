import {useEffect, useState} from "react";
import useAxios from "axios-hooks";
import authenticationHeader from "../headers";
import {useToken} from "../../components/AuthProvider/AuthProvider";

// http://localhost:1337/api/visits?pagination[page]=1&pagination[pageSize]=10&populate=*&filters[user][id][$eq]=1
const useLoadHistory = ({
  initialPage = 1,
  pageSize = 8,
  userId,
  regionId,
}) => {
  const visitsUrl = `${process.env.REACT_APP_BACKEND_URL}/visits`;
  const token = useToken.getState().token;

  const getParams = (obj = undefined) => {
    const region = obj?.region ?? regionId
    const params = new URLSearchParams();
    params.append('pagination[page]', String(obj?.page ?? 1));
    params.append('pagination[pageSize]', String(pageSize));
    params.append('populate', 'images,region');
    params.append('filters[user][id][$eq]', userId);
    if (region) {
      params.append('filters[region][id][$eq]', region);
    }
    return params;
  }

  const [{ data, loading, error }, reFetch] = useAxios({
    url: visitsUrl,
    ...authenticationHeader(token),
    params: getParams(),
  },
    { useCache: false, autoCancel: false, manual: !userId }
  );
  const [entities, setEntities] = useState({ data: [], meta: {} });

  useEffect(() => {
    if (!loading && data) {
      setEntities({
        data: [...entities.data, ...data.data.filter(el => !entities  || !entities?.data.find(en => en.id === el.id))],
        meta: data.meta
      });
    }
  }, [data, loading]);

  const loadMore = () => {
    const page = (entities.meta?.pagination?.page ?? 0) + 1;
    if (entities.meta?.pagination && page >= entities.meta.pagination?.pageCount) {
      return;
    }
    reFetch({
      params: getParams({ page }),
      ...authenticationHeader(token),
    });
  }

  const getDataForTheRegion = (region) => {
    reFetch({
      params: getParams({ region }),
      ...authenticationHeader(token),
    });
  }


  return { data: entities, loading, error, loadMore, getDataForTheRegion  };
};

export default useLoadHistory;