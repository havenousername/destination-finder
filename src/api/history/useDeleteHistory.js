import {useToken} from "../../components/AuthProvider/AuthProvider";
import useAxios from "axios-hooks";
import authenticationHeader from "../headers";
import {useMemo, useState} from "react";
import useApiEvent from "../../hooks/useApiEvent";


const useDeleteHistory = () => {
  const visitsUrl = `${process.env.REACT_APP_BACKEND_URL}/visits`;
  const token = useToken.getState().token;
  const apiEvents = useApiEvent();

  const [{data, loading, error}, execute] = useAxios({
    url: visitsUrl,
    headers: {
      ...authenticationHeader(token).headers,
    },
    method: 'DELETE',
  }, { manual: true, autoCancel: false });
  const [lastDeleted, setLastDeleted] = useState();

  const deleteVisit = (id) => {
    setLastDeleted(() => id);
    apiEvents.setApiEvent('visits/remove');
    return execute({
      url: `${process.env.REACT_APP_BACKEND_URL}/visits/${id}`,
    })
  };

  const checkLastDeleted = useMemo(() => {
    return lastDeleted === data?.data?.id && !!lastDeleted;
  }, [data, lastDeleted]);

  return { data, loading, error, deleteVisit, lastDeleted, checkLastDeleted };
};

export default useDeleteHistory;