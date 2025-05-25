import { create } from 'zustand'

const useTravelRecommenderStore = create((set) => ({
    countries: [],
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
                score: 50,
            },
            Architecture: {
                weight: 1,
                score: 50,
            },
            Hiking: {
                weight: 1,
                score: 50,
            },
            Wintersports: {
                weight: 1,
                score: 50,
            },
            Beach: {
                weight: 1,
                score: 50,
            },
            Culture: {
                weight: 1,
                score: 50,
            },
            Culinary: {
                weight: 1,
                score: 50,
            },
            Entertainment: {
                weight: 1,
                score: 50,
            },
            Shopping: {
                weight: 1,
                score: 50,
            },
        },
    },
    results: [],
    recommendationType: 'single',
    setRecommendationType: (type) => set({ recommendationType: type }),
    setCountries: (newCountries) => set({ countries: newCountries }),
    setUserData: (newUserData) => {
        set({ userData: newUserData })
    },
    setResults: (newResults) => set({ results: newResults }),
}));

export default useTravelRecommenderStore;
