import useAxios from "axios-hooks";
import authenticationHeader from "../headers";
import {useToken} from "../../components/AuthProvider/AuthProvider";
import {useAuthContext} from "../../context/AuthContext";
import {useEffect, useState} from "react";
import {useRemoveFile, useUploadFile} from "../useFile";

const useUpdateUser = () => {
  const { user } = useAuthContext();
  const [url, setUrl] = useState(`${process.env.REACT_APP_BACKEND_URL}/users/${user?.id}`);
  const token = useToken.getState().token;
  const [{ loading, error }, execute] = useAxios({
    url,
    method: 'PUT',
    ...authenticationHeader(token)
  }, { manual: true });
  const { uploadFile } = useUploadFile();
  const { removeFile } = useRemoveFile();

  const uploadImageToField = async (file, personalInfo, field = 'coverPhoto') => {
    try{
      if (personalInfo[field]) {
        try {
          await removeFile(personalInfo[field].id);
        } catch (e) {
          console.warn(`Could not remove image with id ${personalInfo[field].id}`)
        }
      }
      const response = await uploadFile(file);
      const id = response.data[0].id;
      return await execute({data: {[field]: id}});
    }
    catch(e){
      return new Error("Image upload failed");
    }
  };

  useEffect(() => {
    if (user?.id) {
      setUrl(`${process.env.REACT_APP_BACKEND_URL}/users/${user.id}`);
    }
  }, [user]);

  const update = (personalInfo) => {
    return execute({
      data: personalInfo,
    });
  }

  return { loading, error, uploadImageToField, update };
};

export default useUpdateUser;