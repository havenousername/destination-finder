// AlgorithmComparison.js
import haversine from 'haversine';
import testScenariosMultiComposite from "../data/testScenariosMultiComposite.json";

export class AlgorithmComparison {
  constructor(greedyAlgo, geneticAlgo, dynamicAlgo) {
    this.algorithms = {
      "Greedy": greedyAlgo,
      "Genetic": geneticAlgo,
      "Dynamic": dynamicAlgo
    };
  }

  compareAlgorithms = (mapCountries) => {
    const results = {};
    
    // Run comparison for each scenario from the JSON file
    testScenariosMultiComposite.scenarios.forEach(scenario => {
      results[scenario.name] = {};
      
      // Test each algorithm with the current scenario
      for (const [algoName, algo] of Object.entries(this.algorithms)) {
        const startTime = performance.now();
        let algorithmResults = [];
        
        // Run the algorithm
        algo(mapCountries, scenario, (res) => {
          algorithmResults = res;
        });
        
        const endTime = performance.now();
        
        // Calculate and store metrics for this algorithm
        results[scenario.name][algoName] = {
          ...this.calculateMetrics(algorithmResults),
          computationTime: endTime - startTime
        };
      }
    });

    // Generate statistical analysis of the results
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

    const totalCost = algorithmResults.reduce((sum, r) => sum + r.price, 0);
    const totalWeeks = algorithmResults.reduce((sum, r) => sum + r.allocatedWeeks, 0);
    const totalScore = algorithmResults.reduce((sum, r) => sum + r.scores.totalScore, 0);

    // Calculate total distance between consecutive regions
    let totalDistance = 0;
    for (let i = 0; i < algorithmResults.length - 1; i++) {
      const curr = algorithmResults[i];
      const next = algorithmResults[i + 1];
      const distance = haversine(
        { latitude: curr.latitude, longitude: curr.longitude },
        { latitude: next.latitude, longitude: next.longitude }
      );
      totalDistance += distance;
    }

    // Calculate geographical diversity using standard deviation
    const latitudes = algorithmResults.map(r => r.latitude);
    const longitudes = algorithmResults.map(r => r.longitude);
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

    // Calculate average metrics for each algorithm
    algorithms.forEach(algo => {
      analysis.averageMetrics[algo] = {};
      metrics.forEach(metric => {
        const values = Object.values(results).map(scenario => scenario[algo][metric]);
        analysis.averageMetrics[algo][metric] = {
          mean: this.calculateMean(values),
          std: this.calculateStandardDeviation(values)
        };
      });
    });

    // Determine best algorithm for each metric
    metrics.forEach(metric => {
      analysis.algorithmComparison[metric] = algorithms.sort((a, b) => {
        return analysis.averageMetrics[b][metric].mean - 
               analysis.averageMetrics[a][metric].mean;
      });
    });

    return analysis;
  };

  calculateMean = (values) => {
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  calculateStandardDeviation = (values) => {
    const mean = this.calculateMean(values);
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  };
}