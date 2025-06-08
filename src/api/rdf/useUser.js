
import {generateAnonymous, hasAnonymous} from "./generateAnonymUser";
import useTravelRecommenderStore from "../../store/travelRecommenderStore";


export const useRdfUser = () => {
  const { userData } = useTravelRecommenderStore();

  const createUser = async  () => {
    const userId = generateAnonymous();
    const name = navigator.userAgent;
    const features = Object.keys(userData.Attributes)
      .reduce((object,key) => ({
        ...object,
        [key.toLowerCase()]:
          [
            userData.Attributes[key].score,
            userData.Attributes[key].weight === 1]
      }), {});

    features['Safety'] = [0, true];
    const email = `${userId}@${userId}.com`;
    const data = await fetch(`${process.env.REACT_APP_RDF_BACKEND_API}/user`, {
      method: "POST",
      body: JSON.stringify({
        email,
        name: name,
        username: name,
        id: userId,
        features: features,
      }),
      headers: {
        'Content-Type': "application/json",
      }
    });

    return await data.json();
  }

  const updateUserPreference = async () => {
    const userId = generateAnonymous();
    const features = Object.keys(userData.Attributes)
      .reduce((object,key) => ({
        ...object,
        [key.toLowerCase()]:
          [
            userData.Attributes[key].score,
            userData.Attributes[key].weight === 1]
      }), {});

    features['Safety'] = [0, true];

    const data = await fetch(`${process.env.REACT_APP_RDF_BACKEND_API}/user/preference`, {
      method: "PUT",
      body: JSON.stringify({
        userId,
        features
      }),
      headers: {
        'Content-Type': "application/json",
      }
    });

    return await data.json();
  }

  const updateUserPreferences = async  () => {
    let response = {};
     if (!hasAnonymous()) {
       response = await createUser();
     } else {
        response = await updateUserPreference();
     }

     console.log(response);
     return response;
  }

  return { createUser, updateUserPreferences };
}