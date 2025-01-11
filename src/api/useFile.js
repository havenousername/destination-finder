import {useToken} from "../components/AuthProvider/AuthProvider";
import useAxios from "axios-hooks";
import authenticationHeader from "./headers";

export const useUploadFile = () => {
  const token = useToken.getState().token;
  const [{ loading, error, data }, execute] = useAxios({
    url: `${process.env.REACT_APP_BACKEND_URL}/upload`,
    method: 'POST',
    ...authenticationHeader(token)
  }, { manual: true });

  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('files', file);
    return execute({
      data: formData
    }).catch(e => console.error(e));
  }

  return { uploadFile, loading, error, data };
};

export const useRemoveFile = () => {
  const token = useToken.getState().token;
  const [, execute] = useAxios({
    method: 'DELETE',
    ...authenticationHeader(token)
  }, { manual: true });

  const removeFile = async (id) => {
    return execute({
      url: `${process.env.REACT_APP_BACKEND_URL}/upload/files/${id}`
    })
  }

  return { removeFile }
}