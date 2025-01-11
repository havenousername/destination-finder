import {useToken} from "../../components/AuthProvider/AuthProvider";
import useAxios from "axios-hooks";
import authenticationHeader from "../headers";
import useApiEvent from "../../hooks/useApiEvent";


const useEditHistory = () => {
  const visitsUrl = `${process.env.REACT_APP_BACKEND_URL}/visits`;
  const token = useToken.getState().token;
  const apiEvents = useApiEvent();

  const [{data, loading, error}, execute] = useAxios({
    url: visitsUrl,
    ...authenticationHeader(token),
    method: 'PUT',
  }, { manual: true, autoCancel: false });

  const editVisit = (id, data) => {
    const { photos: _, region: _1, ...objectData } = Object.fromEntries(data.entries());
    apiEvents.setApiEvent('visits/edit');
    return execute({
      url: `${process.env.REACT_APP_BACKEND_URL}/visits/${id}`,
      data: { data: objectData  }
    });
  };


  return { loading, data, error, editVisit }
};

export default useEditHistory;