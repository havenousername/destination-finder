// http://localhost:1337/api/users/me
import {useToken} from "../components/AuthProvider/AuthProvider";
import useAxios from "axios-hooks";
import authenticationHeader from "./headers";
import {useAuthContext} from "../context/AuthContext";

const useUpdateMeWithGroups = () => {
  const { user } = useAuthContext();
  const visitsUrl = `${process.env.REACT_APP_BACKEND_URL}/groups/${user.id}`;
  const token = useToken.getState().token;

  const [{ data, loading, error }, executePutGroups] = useAxios({
    url: visitsUrl,
    method: "PUT",
    ...authenticationHeader(token)
  },
  { manual: true });


  return {
    data,
    executePutGroups,
    loading,
    error
  };
};

export default useUpdateMeWithGroups;
