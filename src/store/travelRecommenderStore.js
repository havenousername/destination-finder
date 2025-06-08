import { create } from 'zustand'

const useTravelRecommenderStore = create((set, getState) => ({
    countries: [],
    version: 'v2',
    userData: {
        isPriceImportant: false,
        Budget: 50,
        Distance:50,
        isDistanceNotImportant: false,
        weekAllocationDistribution: 50,
        Weeks:50,
        Months: Array(12).fill(0),
        PresetType: [],
        isPeakSeasonImportant: false,
        /**
         * Decide whether to use visited
         * index for scoring regions
         */
        isVisitorIndexImportant: true,
        /**
         * Scaled between 0-100 targeted percentage
         * of people visiting the country, acts in a
         * similar way to the `userData.Budget`
         * @type {{ weight: number, score: number }}
         */
        VisitorIndex: {
            // importance of the visitorIndex in the overall algorithm calculation
            weight: 1,
            // how much crowded the place should be according to the user
            score: 50,
        },
        Attributes: {
            Nature: {
                weight: 1,
                score: 0,
            },
            Architecture: {
                weight: 1,
                score: 0,
            },
            Hiking: {
                weight: 1,
                score: 0,
            },
            Wintersports: {
                weight: 1,
                score: 0,
            },
            Watersports: {
                weight: 1,
                score: 0,
            },
            Beach: {
                weight: 1,
                score: 0,
            },
            Culture: {
                weight: 1,
                score: 0,
            },
            Culinary: {
                weight: 1,
                score: 0,
            },
            Entertainment: {
                weight: 1,
                score: 0,
            },
            Shopping: {
                weight: 1,
                score: 0,
            },
        },
    },
    results: [],
    recommendationType: 'single',
    algorithmUsed: "greedy",
    refresh: true,
    setRefresh: () => set(state => ({ refresh: !state.refresh })),
    setAlgorithmUsed: (algorithm) => set({ algorithmUsed: algorithm }),
    setRecommendationType: (type) => set({ recommendationType: type }),
    setCountries: (newCountries) => set({ countries: newCountries }),
    setUserData: (newUserData) => {
        set({ userData: newUserData })
    },
    setResults: (newResults) => set({ results: newResults }),
    setVersion: (version) => {
        if (version === 'v1') {
            return set({ version })
        } else {
            return set({ version: 'v2', refresh: true, results: [], countries: [] })
        }
    },
    isRdfVersion: () =>  getState().version === 'v2',
}));

export default useTravelRecommenderStore;
