import {setToken} from "../helpers";
import {message} from "antd";
import {useNavigate} from "react-router-dom";
import {useAuthContext} from "../context/AuthContext";
import {useState} from "react";
import {useToken} from "../components/AuthProvider/AuthProvider";
import {strapiHeader} from "./headers";


const useLoadUser = (signUp) => {
  const navigate = useNavigate();
  const { setUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const token = useToken();
  const path = signUp ? 'auth/local/register' : 'auth/local';

  const onLoad = async (values) => {
    setIsLoading(true);
    try {
      const value = !signUp
        ? {
            identifier: values.email,
            password: values.password,
          }
        : values;
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...strapiHeader(),
        },
        body: JSON.stringify(value),
      });

      const data = await response.json();
      if (data?.error) {
        throw data?.error;
      } else {
        // set the token
        setToken(data.jwt);
        token.setToken();

        // set the user
        setUser(data.user);

        message.success(`Welcome back ${data.user.username}!`);
        navigate('/', {replace:true})
      }
    } catch (error) {
      console.error(error);
      setError(error?.message ?? "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, setError, onLoad };
};


export default useLoadUser;