import {create} from "zustand";
import {useToken} from "../components/AuthProvider/AuthProvider";
import {FavouritesApi} from "../api/favourites";
import {useAuthContext} from "../context/AuthContext";
import {useEffect, useState} from "react";
import {strapiHeader} from "../api/headers";


const favouritesState = create((set, get) => ({
  favourites: [],
  fetcher: {},
  initialized: false,
  error: false,

  /**
   * Setup the fetcher and get favourites
   * @param{String} userId
   * @returns {Promise<void>}
   */
  async fetch(userId) {
    try {
      const token = useToken.getState().token;
      const fetcher = new FavouritesApi(
        `${process.env.REACT_APP_BACKEND_URL}/favourites/${userId}`,
        { Authorization: `bearer ${token}`, ...strapiHeader() },
      )
      const data = await fetcher.getFavourites();
      set({ favourites: data, fetcher, initialized: true });
    } catch (e) {
      set({ error: true })
    }
  },

  async remove(country) {
    const items = get().favourites.filter(curr => curr.name !== country);
    const success = await get().fetcher.updateFavourite(items);
    if (success) {
      set({ favourites: items });
    }
  },
  /**
   *
   * @param{String} country
   * @param{Array[]} months
   * @returns {Promise<void>}
   */
  async add(country, months) {
    const item = { name: country, months: months?.join(',') };
    set((state) => ({ favourites: [...state.favourites, item ] }))
    const success = await get().fetcher.updateFavourite(get().favourites);
    if (!success) {
      set((state) => ({
        favourites: [...state.favourites.filter(i => i.country !== country) ]
      }))
    }
  }
}));

export const useLoadFavourites = () => {
  const state = favouritesState();
  const auth = useAuthContext();

  useEffect(() => {
    if (!auth.user || !auth.user.id) {
      return;
    }
    if (!state.initialized) {
      state.fetch(auth.user.id);
    }

  }, [auth, state.initialized]);


  return state;
}


/**
 * TODO: Replace whole logic with the backend implementation
 * Even though only backend pagination would be preferable there is
 * no inherit hazard from doing it on the frontend (max num_countries elements << 1000)
 */
export const useFavouritesPaginationFrontend = (pageSize = 8) => {
  const {favourites, error} = useLoadFavourites();
  const [paginator, setPaginator] = useState({
    page: 1,
    pageSize,
    pageCount: Math.ceil(favourites.length / pageSize),
    total: favourites.length,
  });
  const loading = favourites.length === 0;
  const loadMore = () => {
    if (paginator.page >= paginator.pageCount) {
      return;
    }
    setPaginator(paginator => ({...paginator, page: paginator.page + 1}));
  }

  const currentFavourites = favourites.slice(
    (paginator.page - 1) * paginator.pageSize,
    paginator.page * paginator.pageSize
  );

  const data = {
    data: currentFavourites,
    meta: { pagination: paginator }
  };

  return { data, loadMore, loading, error };
}