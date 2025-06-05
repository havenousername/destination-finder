// AlgorithmComparison.js
import haversine from 'haversine';
import testScenariosMultiComposite from "../data/testScenariosMultiComposite.json";

export class AlgorithmComparison {
    constructor(greedyAlgo, geneticAlgo, dynamicAlgo) {
        this.algorithms = {
            "Greedy": greedyAlgo,    // Capitalized to match your implementation
            "Genetic": geneticAlgo,
            "Dynamic": dynamicAlgo
        };
    }

    compareAlgorithms = (mapCountries, geneticParams, greedyParams, dynamicParams) => {
        const results = {};
        const algorithmParams = {
            "Greedy": greedyParams,
            "Genetic": geneticParams,
            "Dynamic": dynamicParams
        };

        // Run comparison for each scenario
        testScenariosMultiComposite.scenarios.forEach(scenario => {
            results[scenario.name] = {};
            
            // Test each algorithm
            for (const [algoName, algo] of Object.entries(this.algorithms)) {
                const startTime = performance.now();
                let algorithmResults = [];
                
                // Run algorithm with its optimized parameters
                algo(
                    mapCountries, 
                    scenario, 
                    (res) => { algorithmResults = res; },
                    algorithmParams[algoName] 
                );
                
                const endTime = performance.now();
                
                // Calculate metrics
                results[scenario.name][algoName] = {
                    ...this.calculateMetrics(algorithmResults),
                    computationTime: endTime - startTime
                };
            }
        });

        // Generate analysis
        const analysis = this.generateStatisticalAnalysis(results);

        return {
            detailedResults: results,
            analysis: analysis
        };
    };

    calculateMetrics = (algorithmResults) => {
        if (!algorithmResults || algorithmResults.length === 0) {
            return {
                averageTripCost: 0,
                numberOfRegions: 0,
                averageWeeksPerRegion: 0,
                totalDistance: 0,
                averageRegionScore: 0,
                geographicalDiversity: 0
            };
        }

        try {
            const totalCost = algorithmResults.reduce((sum, r) => sum + r.price, 0);
            const totalWeeks = algorithmResults.reduce((sum, r) => sum + r.allocatedWeeks, 0);
            const totalScore = algorithmResults.reduce((sum, r) => sum + r.scores.totalScore, 0);

            // Calculate total distance between consecutive regions
            let totalDistance = 0;
            for (let i = 0; i < algorithmResults.length - 1; i++) {
                const curr = algorithmResults[i];
                const next = algorithmResults[i + 1];
                // console.log(curr)
                // Get coordinates from the correct location in the object structure
                const currCoords = {
                    latitude: curr.latitude || curr.geometry?.centroid?.geometry?.coordinates[1],
                    longitude: curr.longitude || curr.geometry?.centroid?.geometry?.coordinates[0]
                };
                const nextCoords = {
                    latitude: next.latitude || next.geometry?.centroid?.geometry?.coordinates[1],
                    longitude: next.longitude || next.geometry?.centroid?.geometry?.coordinates[0]
                };

                const distance = haversine(currCoords, nextCoords);
                totalDistance += distance;
            }

            // Calculate geographical diversity
            const getCoords = (r) => ({
                lat: r.latitude || r.geometry?.centroid?.geometry?.coordinates[1],
                long: r.longitude || r.geometry?.centroid?.geometry?.coordinates[0]
            });

            const coords = algorithmResults.map(getCoords);
            const latitudes = coords.map(c => c.lat).filter(l => l != null);
            const longitudes = coords.map(c => c.long).filter(l => l != null);

            const latStd = this.calculateStandardDeviation(latitudes);
            const longStd = this.calculateStandardDeviation(longitudes);
            const geoDiversity = Math.sqrt(latStd * latStd + longStd * longStd);

            return {
                averageTripCost: totalCost / algorithmResults.length,
                numberOfRegions: algorithmResults.length,
                averageWeeksPerRegion: totalWeeks / algorithmResults.length,
                totalDistance: totalDistance,
                averageRegionScore: totalScore / algorithmResults.length,
                geographicalDiversity: geoDiversity
            };
        } catch (error) {
            console.error("Error calculating metrics:", error);
            return {
                averageTripCost: 0,
                numberOfRegions: 0,
                averageWeeksPerRegion: 0,
                totalDistance: 0,
                averageRegionScore: 0,
                geographicalDiversity: 0
            };
        }
    };

    generateStatisticalAnalysis = (results) => {
        const analysis = {
            algorithmComparison: {},
            averageMetrics: {}
        };

        const algorithms = ["Greedy", "Genetic", "Dynamic"];
        const metrics = [
            "averageTripCost", 
            "numberOfRegions", 
            "averageWeeksPerRegion", 
            "totalDistance", 
            "averageRegionScore", 
            "geographicalDiversity", 
            "computationTime"
        ];

        // Calculate average metrics
        algorithms.forEach(algo => {
            analysis.averageMetrics[algo] = {};
            metrics.forEach(metric => {
                const values = Object.values(results)
                    .map(scenario => scenario[algo]?.[metric])
                    .filter(value => value != null);
                
                if (values.length > 0) {
                    analysis.averageMetrics[algo][metric] = {
                        mean: this.calculateMean(values),
                        std: this.calculateStandardDeviation(values)
                    };
                }
            });
        });

        // Determine best algorithm for each metric
        metrics.forEach(metric => {
            analysis.algorithmComparison[metric] = algorithms
                .filter(algo => analysis.averageMetrics[algo]?.[metric])
                .sort((a, b) => {
                    return analysis.averageMetrics[b][metric].mean - 
                           analysis.averageMetrics[a][metric].mean;
                });
        });

        return analysis;
    };

    calculateMean = (values) => {
        if (!values || values.length === 0) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    };

    calculateStandardDeviation = (values) => {
        if (!values || values.length === 0) return 0;
        const mean = this.calculateMean(values);
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        return Math.sqrt(avgSquareDiff);
    };
}