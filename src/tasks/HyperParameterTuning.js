// HyperparameterTuning.js
import { AlgorithmComparison } from './AlgorithmComparison';
import useTravelRecommenderStore from '../store/travelRecommenderStore';
import testScenariosMultiComposite from '../data/testScenariosMultiComposite.json';

export class HyperparameterTuning {
    constructor(greedyAlgo, geneticAlgo, dynamicAlgo) {
        this.algorithmComparison = new AlgorithmComparison(greedyAlgo, geneticAlgo, dynamicAlgo);
        this.algorithms = {
            "Greedy": greedyAlgo,
            "Genetic": geneticAlgo,
            "Dynamic": dynamicAlgo
        };
        
        // Complete parameter spaces including penalty rates
        this.parameterSpaces = {
            Genetic: {
                populationSize: [20, 30, 50, 70],
                generations: [100, 200, 300],
                mutationRate: [0.01, 0.02, 0.05],
                tournamentSize: [2, 3, 4]
            },
            Dynamic: {
                dominance: {
                    alpha: [0.3, 0.5, 0.7]
                }
            },
            distanceDecay: {
                strategy: ["exponential", "linear", "quadratic"],
                scalingFunction: ["linear", "quadratic"],
                penalties: {
                    genetic: {
                        minPenaltyRate: [0.00001, 0.00002, 0.00004],
                        maxPenaltyRate: [0.00002, 0.00004, 0.00006]
                    },
                    dynamic: {
                        minPenaltyRate: [0, 0.00001, 0.00002],
                        maxPenaltyRate: [0.00004, 0.000055, 0.00007]
                    },
                    greedy: {
                        minPenaltyRate: [0.00001, 0.00005, 0.0001],
                        maxPenaltyRate: [0.005, 0.01, 0.015]
                    }
                }
            },
            weekAllocation: {
                maxWeeksPerRegionRatio: [0.3, 0.5, 0.7],
                lambdaPenalty: {
                    scaling: [0.05, 0.1, 0.2]
                },
                penaltyFunction: ["quadratic", "linear", "exponential"]
            }
        };
    }

    generateParameterCombinations(algorithmType) {
        if (!this.parameterSpaces[algorithmType]) {
            console.log(`No parameter space defined for ${algorithmType}`);
            return [{}];
        }

        const flattenObject = (obj, prefix = '') => {
            return Object.keys(obj).reduce((acc, key) => {
                const value = obj[key];
                const newKey = prefix ? `${prefix}.${key}` : key;
                
                if (Array.isArray(value)) {
                    acc[newKey] = value;
                } else if (typeof value === 'object' && value !== null) {
                    Object.assign(acc, flattenObject(value, newKey));
                }
                return acc;
            }, {});
        };

        const params = flattenObject(this.parameterSpaces[algorithmType]);
        if (Object.keys(params).length === 0) return [{}];

        let combinations = [{}];
        Object.entries(params).forEach(([key, values]) => {
            const newCombinations = [];
            combinations.forEach(combo => {
                values.forEach(value => {
                    const newCombo = {...combo};
                    const keyParts = key.split('.');
                    let current = newCombo;

                    for (let i = 0; i < keyParts.length - 1; i++) {
                        if (!current[keyParts[i]]) {
                            current[keyParts[i]] = {};
                        }
                        current = current[keyParts[i]];
                    }
                    current[keyParts[keyParts.length - 1]] = value;

                    newCombinations.push(newCombo);
                });
            });
            combinations = newCombinations;
        });

        return combinations;
    }

    transformParametersToStoreStructure(params, algorithmType) {
        const baseParams = useTravelRecommenderStore.getState().algorithmParameters;
        const transformed = { ...baseParams };

        // Transform algorithm-specific parameters
        if (algorithmType === 'Genetic') {
            transformed.genetic = {
                ...transformed.genetic,
                ...params
            };
        } else if (algorithmType === 'Dynamic') {
            transformed.dynamic = {
                ...transformed.dynamic,
                ...params
            };
        }

        // Transform distance decay parameters
        if (params.distanceDecay) {
            transformed.distanceDecay = {
                ...transformed.distanceDecay,
                ...params.distanceDecay,
                penalties: {
                    ...transformed.distanceDecay.penalties,
                    ...params.distanceDecay.penalties
                }
            };
        }

        // Transform week allocation parameters
        if (params.weekAllocation) {
            transformed.weekAllocation = {
                ...transformed.weekAllocation,
                ...params.weekAllocation,
                lambdaPenalty: {
                    ...transformed.weekAllocation.lambdaPenalty,
                    ...params.weekAllocation.lambdaPenalty
                }
            };
        }

        return transformed;
    }

    evaluateParameters(mapCountries, algorithmType, params) {
        try {
            // Transform parameters to store structure
            const testParams = this.transformParametersToStoreStructure(params, algorithmType);

            let totalScore = 0;
            let validScenarios = 0;
            
            testScenariosMultiComposite.scenarios.forEach(scenario => {
                try {
                    let results = [];
                    const startTime = performance.now();
                    
                    this.algorithms[algorithmType](
                        mapCountries,
                        scenario,
                        (res) => { results = res; },
                        testParams
                    );

                    const endTime = performance.now();
                    const metrics = this.algorithmComparison.calculateMetrics(results);
                    metrics.computationTime = endTime - startTime;
                    
                    const score = this.calculateCompositeScore(metrics, scenario);
                    if (!isNaN(score)) {
                        totalScore += score;
                        validScenarios++;
                    }
                } catch (error) {
                    console.error(`Error evaluating scenario for ${algorithmType}:`, error);
                }
            });

            return validScenarios > 0 ? totalScore / validScenarios : 0;
        } catch (error) {
            console.error(`Error in evaluateParameters for ${algorithmType}:`, error);
            return 0;
        }
    }

    calculateCompositeScore(metrics, scenario) {
        if (!metrics) return 0;
        
        const safeDiv = (a, b) => (b && b !== 0) ? a / b : 0;
        
        return (
            (metrics.averageRegionScore || 0) * 0.3 +
            safeDiv(1, metrics.totalDistance || 1) * 0.2 +
            (metrics.geographicalDiversity || 0) * 0.2 +
            safeDiv(1, metrics.computationTime || 1) * 0.1 +
            (scenario.Budget === 0 ? safeDiv(1, metrics.averageTripCost || 1) : 1) * 0.2
        );
    }

    findBestParameters(mapCountries) {
        const results = {
            Genetic: [],
            Dynamic: [],
            Greedy: []
        };

        Object.keys(results).forEach(algorithmType => {
            console.log(`Tuning ${algorithmType} algorithm...`);
            
            const combinations = this.generateParameterCombinations(algorithmType);
            console.log(`Generated ${combinations.length} parameter combinations for ${algorithmType}`);
            
            combinations.forEach((params, index) => {
                console.log(`Testing combination ${index + 1}/${combinations.length} for ${algorithmType}`);
                const score = this.evaluateParameters(mapCountries, algorithmType, params);
                results[algorithmType].push({ parameters: params, score });
            });

            results[algorithmType].sort((a, b) => b.score - a.score);
        });

        // Transform best parameters to store structure before returning
        return {
            bestParameters: {
                Genetic: this.transformParametersToStoreStructure(
                    results.Genetic[0]?.parameters || {}, 
                    'Genetic'
                ),
                Dynamic: this.transformParametersToStoreStructure(
                    results.Dynamic[0]?.parameters || {}, 
                    'Dynamic'
                ),
                Greedy: this.transformParametersToStoreStructure(
                    results.Greedy[0]?.parameters || {}, 
                    'Greedy'
                )
            },
            allResults: results
        };
    }

    generateTuningReport(results) {
        return {
            bestParameters: results.bestParameters,
            parameterSensitivity: this.analyzeParameterSensitivity(results.allResults),
            statisticalSummary: this.generateStatisticalSummary(results.allResults)
        };
    }

    analyzeParameterSensitivity(results) {
        const sensitivity = {};
        
        for (const algorithmType of Object.keys(results)) {
            sensitivity[algorithmType] = {};
            
            const params = Object.keys(this.parameterSpaces[algorithmType] || {});
            
            params.forEach(param => {
                const values = results[algorithmType].map(r => ({
                    value: r.parameters[param],
                    score: r.score
                }));
                
                sensitivity[algorithmType][param] = {
                    variance: this.calculateVariance(values.map(v => v.score)),
                    range: {
                        min: Math.min(...values.map(v => v.score)),
                        max: Math.max(...values.map(v => v.score))
                    }
                };
            });
        }
        
        return sensitivity;
    }

    calculateVariance(values) {
        if (!values || values.length === 0) return 0;
        const mean = values.reduce((a, b) => a + b) / values.length;
        return values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    }

    generateStatisticalSummary(results) {
        const summary = {};
        
        for (const algorithmType of Object.keys(results)) {
            const scores = results[algorithmType].map(r => r.score);
            
            summary[algorithmType] = {
                mean: scores.reduce((a, b) => a + b) / scores.length,
                std: Math.sqrt(this.calculateVariance(scores)),
                min: Math.min(...scores),
                max: Math.max(...scores),
                median: scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)]
            };
        }
        
        return summary;
    }
}