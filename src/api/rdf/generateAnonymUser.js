import { v4 } from "uuid";



export const generateAnonymous = () => {
  const username = window.localStorage.getItem("rdf-session-token");
  if (!username) {
    const user = v4();
    window.localStorage.setItem("rdf-session-token", user.toString());
    return user;
  }
  return username.toString().replaceAll(/"/g, "");
}


export const hasAnonymous = () => {
  return !!window.localStorage.getItem("rdf-session-token");
}

export const addAnonymousToHeaders = (headers) => {
  generateAnonymous();
  return {
    ...headers,
    'X-Anonymous-Token': window.localStorage.getItem("rdf-session-token"),
  }
}