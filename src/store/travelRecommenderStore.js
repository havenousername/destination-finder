import { create } from 'zustand'

const useTravelRecommenderStore = create((set, getState) => ({
    countries: [],
    version: 'v2',
    userData: {
        isPriceImportant: false,
        Budget: 50,
        Distance: 50,
        isDistanceNotImportant: false,
        weekAllocationDistribution: 50,
        Weeks: 50,
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
                weight: 0,
                score: 0,
            },
            Architecture: {
                weight: 0,
                score: 0,
            },
            Hiking: {
                weight: 0,
                score: 0,
            },
            Wintersports: {
                weight: 0,
                score: 0,
            },
            Watersports: {
                weight: 0,
                score: 0,
            },
            Beach: {
                weight: 0,
                score: 0,
            },
            Culture: {
                weight: 0,
                score: 0,
            },
            Culinary: {
                weight: 0,
                score: 0,
            },
            Entertainment: {
                weight: 0,
                score: 0,
            },
            Shopping: {
                weight: 0,
                score: 0,
            },
        },
    },

    // Algorithm Parameters moved to root level
    algorithmParameters: {
        // Shared configurations
        weekAllocation: {
            maxWeeksPerRegionRatio: 0.5,
            lambdaPenalty: {
                percentage: true,
                range: {
                    min: 0,
                    max: 100
                },
                scaling: 0.1,
                description: "Percentage-based penalty (0-100%) scaled by 0.1 to control distribution uniformity"
            },
            penaltyFunction: "quadratic",
            description: {
                maxWeeksPerRegionRatio: "Maximum weeks per region as ratio of total weeks",
                lambdaPenalty: "Penalty weight for deviation from mean distribution",
                penaltyFunction: "Type of penalty function for deviation from mean"
            }
        },

        distanceDecay: {
            strategy: "exponential",
            scalingFunction: "linear",
            penalties: {
                genetic: {
                    minPenaltyRate: 0.00001,
                    maxPenaltyRate: 0.00004,
                    description: "Lower penalties due to multiplicative accumulation in genetic algorithm"
                },
                greedy: {
                    minPenaltyRate: 0.00001,
                    maxPenaltyRate: 0.01,
                    description: "Higher penalties as they're applied individually in greedy algorithm"
                },
                dynamic: {
                    minPenaltyRate: 0,
                    maxPenaltyRate: 0.000055,
                    description: "Moderate penalties for balanced approach in dynamic algorithm"
                }
            },
            description: {
                strategy: "Method used to decay distance penalties (exponential/linear/quadratic)",
                scalingFunction: "How user distance preference is scaled",
                penalties: "Algorithm-specific penalty ranges for distance calculations"
            }
        },

        // Algorithm-specific parameters
        genetic: {
            populationSize: 20,
            generations: 200,
            mutationRate: 0.01,
            tournamentSize: 3,
            description: {
                populationSize: "Number of chromosomes in each generation",
                generations: "Number of evolution iterations",
                mutationRate: "Probability of mutation occurring",
                tournamentSize: "Number of candidates in tournament selection"
            }
        },

        greedy: {
        // No additional parameters needed
        },

        dynamic: {
            dominance: {
                alpha: 0.5,
                attributes: ['budgetScore', 'totalAttrScore', 'travelMonthScore',
                    'visitorScore', 'penalizedScore'],
                normalization: "maxNorm",
                description: {
                    alpha: "Weight between Excellence Count and Dominance Degree",
                    attributes: "Attributes used for dominance comparison",
                    normalization: "Method used to normalize scores"
                }
            }
        }
    },

    results: [],
    recommendationType: 'single',
    algorithmUsed: "greedy",
    refresh: true,

    // Actions
    setRefresh: () => set(state => ({ refresh: !state.refresh })),
    setAlgorithmUsed: (algorithm) => set({ algorithmUsed: algorithm }),
    setRecommendationType: (type) => set({ recommendationType: type }),
    setCountries: (newCountries) => set({ countries: newCountries }),
    setUserData: (newUserData) => set({ userData: newUserData }),
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