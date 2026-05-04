import {create} from "zustand";

const useRegionStore = create((set, getState) => ({
  fromRegionType: {},
  toRegionType: null,
  chosenRegion: null,
  tileMaps: [],
  recommendedMaps: [],
  selectedScope: null,
  recommendations: [],
  lastRecommendationType: null,

  setLastRecommendationType: (recommendationType) => ({ lastRecommendationType: recommendationType }),
  setRecommendations: (recommendations) => {
    set({ recommendations })
  },
  setFromRegionType: (fromRegionType) => set({ fromRegionType }),
  setToRegionType: (toRegionType) => set({ toRegionType }),
  setChosenRegion: (chosenRegion) => set({ chosenRegion }),
  setTileMaps: (tileMaps) => set({ tileMaps }),
  setSelectedScope: (selectedScope) => set({ selectedScope }),
  setRecommendedMaps: (recommendedMaps) => set({ recommendedMaps }),
}));


export default useRegionStore;