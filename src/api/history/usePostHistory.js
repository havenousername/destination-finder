import useAxios from "axios-hooks";
import authenticationHeader from "../headers";
import {useToken} from "../../components/AuthProvider/AuthProvider";
import {useAuthContext} from "../../context/AuthContext";
import useApiEvent from "../../hooks/useApiEvent";


const usePostHistory = () => {
  const visitsUrl = `${process.env.REACT_APP_BACKEND_URL}/visits`;
  const token = useToken.getState().token;
  const auth = useAuthContext();

  const apiEvents = useApiEvent();

  const [{data, loading, error}, execute] = useAxios({
    url: visitsUrl,
    headers: {
      ...authenticationHeader(token).headers,
      'Content-Type': 'multipart/form-data'
    },
    method: 'POST',
  }, { manual: true, autoCancel: false });

  /**
   *
   * @param {Map} visit - visit map object
   * @param {Array} fileKeys - string of keys which correspond to being files
   */
  const createNewVisit = (visit, fileKeys) => {
    const data = {};
    const formData = new FormData();

    visit.forEach((value, key) => {
      if (fileKeys.includes(key)) {
        value.forEach((file, idx) => {
          formData.append('files.images', file, file.name);
        })
      } else {
        data[key] = value;
      }
    });

    data.user = auth.user.id;
    data.region = data.region.id;
    formData.append('data', JSON.stringify(data));

    apiEvents.setApiEvent('visits/create')

    return execute({
      method: 'POST',
      data: formData
    })
  }


  return { data, loading, error, createNewVisit };
}


export default usePostHistory;