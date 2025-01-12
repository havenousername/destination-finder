
import {useEffect, useState} from "react";
import { AuthContext } from "../../context/AuthContext";
import { getToken } from "../../helpers";
import {create} from "zustand";

export const useToken = create((set) => ({
  token: getToken(),
  setToken: () => set({ token: getToken() })
}));

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const authToken = useToken().token;

  const fetchLoggedInUser = async (token) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/me`, {
        headers: { Authorization: `bearer ${token}` },
      });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }
      setUserData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUser = (user) => {
    setUserData(user);
  };

  useEffect(() => {
    if (authToken) {
      fetchLoggedInUser(authToken);
    }
  }, [authToken]);

  return (
    <AuthContext.Provider
      value={{ user: userData, setUser: handleUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;