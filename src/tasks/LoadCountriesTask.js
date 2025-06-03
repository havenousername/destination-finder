import mapData from "../data/regions.json";
import axios from 'axios';
import { getShortMonths } from "../helpers/months";
import * as turf from '@turf/turf';
import haversine from 'haversine';
import { AlgorithmComparison } from './AlgorithmComparison';
// import solver from 'javascript-lp-solver';


class LoadCountriesTask {
  allResults = [];
  allPrices = [];
  scoreCountries = [];
  mapCountries = mapData.features;
  #allTotalVisitors = {};
  #minVisitors = 0;
  #maxVisitors = 0;
  load = (setFileRetrieved) => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/regions?populate=*`)
      .then((response) => {
        setFileRetrieved(response.data.data?.map((region) => ({ ...region.attributes, id: region.id })));
      });
  };
  processCountries = (countryScores, userData, setCountries, setResults, recommendationType, algorithmUsed,algorithmParameters) => {

    for (let i = 0; i < this.mapCountries.length; i++) {
      const mapCountry = this.mapCountries[i];


      mapCountry.geometry.centroid = turf.centroid(mapCountry.geometry)
      const scoreCountry = countryScores.find(
        (c) => c.u_name === mapCountry.properties.u_name
      );
      if (scoreCountry != null) {
        this.allPrices.push(scoreCountry.costPerWeek);
        this.scoreCountries.push(scoreCountry);
      }

    }
    this.scoreCountries.forEach((country) => {
      this.#allTotalVisitors[country.id] = Object.values(country.visitorIndex)
        .reduce((acc, curr) => acc + curr, 0);
      if (this.#allTotalVisitors[country.id] < this.#minVisitors) {
        this.#minVisitors = this.#allTotalVisitors[country.id]
      }

      if (this.#allTotalVisitors[country.id] > this.#maxVisitors) {
        this.#maxVisitors = this.#allTotalVisitors[country.id]
      }
    });

    this.allPrices.sort((a, b) => a - b);
    for (const scoreCountry of this.scoreCountries) {
      const mapCountry = this.mapCountries.find(
        (c) => c.properties.u_name === scoreCountry.u_name
      );
      const peakSeasons = this.preprocessSeason(scoreCountry.peakSeason);
      // console.log(scoreCountry)
      const res = {
        id: scoreCountry.id,
        country: scoreCountry.ParentRegion.data.attributes.Region,
        region: scoreCountry.Region,
        uname: scoreCountry.u_name,
        price: scoreCountry.costPerWeek,
        budgetLevel: scoreCountry.budgetLevel,
        qualifications: {
          nature: this.calculateRecursiveScore(scoreCountry, countryScores, "nature"),
          architecture: this.calculateRecursiveScore(scoreCountry, countryScores, "architecture"),
          hiking: this.calculateRecursiveScore(scoreCountry, countryScores, "hiking"),
          wintersports: this.calculateRecursiveScore(scoreCountry, countryScores, "wintersports"),
          beach: this.calculateRecursiveScore(scoreCountry, countryScores, "beach"),
          culture: this.calculateRecursiveScore(scoreCountry, countryScores, "culture"),
          culinary: this.calculateRecursiveScore(scoreCountry, countryScores, "culinary"),
          entertainment: this.calculateRecursiveScore(scoreCountry, countryScores, "entertainment"),
          shopping: this.calculateRecursiveScore(scoreCountry, countryScores, "shopping"),
        },
        travelMonths: getShortMonths().map((shortMonth, idx) =>
          this.calculateWithPeakSeason(
            this.calculateRecursiveScore(scoreCountry, countryScores, shortMonth),
            peakSeasons.includes(shortMonth) && userData.Months[idx] === 100,
            userData.isPeakSeasonImportant
          )
        ),
        peakSeasons: peakSeasons,
        visitorIndex: scoreCountry.visitorIndex,
        totalVisitorIndex: this.#allTotalVisitors[scoreCountry.id],
        scores: {
          totalScore: 0,
          budgetScore: 0,
          travelMonthScore: 0,
          visitorScore: 0,
          presetTypeScore: 0,
          attr: {
            nature: {
              weight: userData.Attributes.Nature.weight,
              score: 0,
            },
            architecture: {
              weight: userData.Attributes.Architecture.weight,
              score: 0,
            },
            hiking: {
              weight: userData.Attributes.Hiking.weight,
              score: 0,
            },
            wintersports: {
              weight: userData.Attributes.Wintersports.weight,
              score: 0,
            },
            beach: {
              weight: userData.Attributes.Beach.weight,
              score: 0,
            },
            culture: {
              weight: userData.Attributes.Culture.weight,
              score: 0,
            },
            culinary: {
              weight: userData.Attributes.Culinary.weight,
              score: 0,
            },
            entertainment: {
              weight: userData.Attributes.Entertainment.weight,
              score: 0,
            },
            shopping: {
              weight: userData.Attributes.Shopping.weight,
              score: 0,
            },
          },
        },
      };

      const budgetScore = this.calculateBudgetScore(res.budgetLevel, userData);
      const visitorScore = userData.isVisitorIndexImportant
        ? this.calculateTravelVisitorScore(res.totalVisitorIndex, userData)
        : 0;

      // const peakSeasonScore = this.calculatePeakSeasonScore(res.peakSeasons, userData);

      const travelMonthScore = this.calculateTravelMonthScore(res.travelMonths, userData.Months);
      const isAffordable = !userData.isPriceImportant || budgetScore === 100;

      mapCountry.properties.country = scoreCountry.ParentRegion.data.attributes.Region;
      mapCountry.properties.name = scoreCountry.Region;
      res.scores.presetTypeScore = this.calculatePresetTypeScore(userData.PresetType, res.qualifications);
      // calculate the score for nature
      res.scores.attr.nature.score = this.calculateAttributeScore(
        res.qualifications.nature,
        userData.Attributes.Nature.score
      );
      res.scores.attr.architecture.score = this.calculateAttributeScore(
        res.qualifications.architecture,
        userData.Attributes.Architecture.score
      );
      res.scores.attr.hiking.score = this.calculateAttributeScore(
        res.qualifications.hiking,
        userData.Attributes.Hiking.score
      );
      res.scores.attr.wintersports.score = this.calculateAttributeScore(
        res.qualifications.wintersports,
        userData.Attributes.Wintersports.score
      );
      res.scores.attr.beach.score = this.calculateAttributeScore(
        res.qualifications.beach,
        userData.Attributes.Beach.score
      );
      res.scores.attr.culture.score = this.calculateAttributeScore(
        res.qualifications.culture,
        userData.Attributes.Culture.score
      );
      res.scores.attr.culinary.score = this.calculateAttributeScore(
        res.qualifications.culinary,
        userData.Attributes.Culinary.score
      );
      res.scores.attr.entertainment.score = this.calculateAttributeScore(
        res.qualifications.entertainment,
        userData.Attributes.Entertainment.score
      );
      res.scores.attr.shopping.score = this.calculateAttributeScore(
        res.qualifications.shopping,
        userData.Attributes.Shopping.score
      );

      let totalAttrScore;
      if (userData.PresetType.length === 0) {
        totalAttrScore = this.calculateAttributeScoreAverage(res.scores.attr);
      } else {
        totalAttrScore = { score: res.scores.presetTypeScore, weight: userData.PresetType.length };
      }
      let totalScore = 0;
      if (isAffordable) {
        const visitorWeight = userData.VisitorIndex.weight * userData.isVisitorIndexImportant;
        const budgetWeight = 1;
        const monthsWeight = 1;
        const allWeights = budgetWeight + monthsWeight + totalAttrScore.weight + visitorWeight;
        const allScores = totalAttrScore.score
          + budgetScore
          + travelMonthScore
          + visitorScore;

        totalScore = Number((allScores / allWeights).toFixed(2));
      }


      res.scores.budgetScore = budgetScore;
      res.scores.totalScore = totalScore;
      res.scores.totalAttrScore = totalAttrScore;
      res.scores.travelMonthScore = travelMonthScore;
      res.scores.visitorScore = visitorScore;


      mapCountry.properties.result = res;
      this.allResults.push(res);
    }
    this.mapCountries.sort(
      (a, b) =>
        b.properties.result.scores.totalScore -
        a.properties.result.scores.totalScore
    );
    setCountries(this.mapCountries);
    this.setTypeResults(this.allResults, userData, this.mapCountries, setResults, recommendationType, algorithmUsed, algorithmParameters)
  };
  calculateBudgetLevel = (costPerWeek) => {
    let index = this.allPrices.indexOf(costPerWeek);
    return Math.ceil((index + 1) / (this.allPrices.length / 10));
  };
  calculateRecursiveScore = (scoreCountry, countryScores, attribute) => {
    if (scoreCountry[attribute] === null) {
      let parent = countryScores.find((c) => c.Region === scoreCountry.ParentRegion.data.attributes.Region);
      if (!parent) return 0;
      return this.calculateRecursiveScore(parent, countryScores, attribute);
    }
    return scoreCountry[attribute];
  };
  calculateAttributeScore = (countryScore, userScore) => {
    return 100 - Math.abs(userScore - countryScore);
  };
  calculateAttributeScoreAverage = (attributes) => {
    let totalScore = 0;
    let totalWeight = 0;
    for (const attribute in attributes) {
      totalScore += attributes[attribute].score * attributes[attribute].weight;
      totalWeight += attributes[attribute].weight;
    }
    return { score: totalScore, weight: totalWeight };
  };
  calculatePresetTypeScore = (attributeNames, qualifications) => {
    let totalScore = 0;
    for (const attributeName of attributeNames) {
      totalScore += qualifications[attributeName.toLowerCase()];
    }
    return totalScore;
  };

  calculateWithPeakSeason = (score, isPeak, isPeakImportant) => {
    if (!isPeakImportant) {
      return score;
    }
    return isPeak ? 0 : score;
  }

  calculateTravelMonthScore = (countryTravelMonths, userTravelMonths) => {
    const scores = []
    for (let i = 0; i < countryTravelMonths.length; i++) {
      if (userTravelMonths[i] === 0) {
        scores.push(0);
      } else {
        scores.push(100 - Math.abs(userTravelMonths[i] - countryTravelMonths[i]));
      }
    }

    return scores.reduce((acc, curr) => acc + curr, 0) / scores.length;
  };

  /**
   *
   * @param isPeakSeason
   * @return {Array[string]}
   */
  preprocessSeason(isPeakSeason) {
    return Object.entries(isPeakSeason)
      .reduce((months, [month, isPeak]) => isPeak ? [...months, month] : months, []);
  }

  calculateTravelVisitorScore = (countryVisitorIndex, userData) => {
    const min = -this.#maxVisitors;
    const max = this.#minVisitors;
    const normalized = ((-countryVisitorIndex - min) * 100) / (max - min);
    if (userData.VisitorIndex.score <= normalized) {
      return 100;
    } else {
      return 0;
    }
  }


  calculateBudgetScore = (countryBudgetLevel, userData) => {
    if (userData.Budget >= countryBudgetLevel) {
      return 100;
    } else if (userData.Budget <= countryBudgetLevel - 20) {
      return 0;
    } else {
      return 100 - ((countryBudgetLevel - userData.Budget) * 100) / 20;
    }
  };
  setTypeResults = (results, userData, mapCountries, setResults, type, algorithmUsed, algorithmParameters) => {
    if (type === "single") {
      this.singleRecommendationAlgorithm(results, setResults)
    }
    else if (type === "composite") {
      // console.log(this.runAlgorithmComparison(mapCountries))
      if (algorithmUsed === "genetic") {
        this.geneticRecommendationAlgorithm(mapCountries, userData, setResults, algorithmParameters)
      }
      else if (algorithmUsed === "greedy") {
        this.greedyRecommendationAlgorithm(mapCountries, userData, setResults, algorithmParameters)
      }
      else {
        this.dynamicDPDominanceRecommendation(mapCountries, userData, setResults, algorithmParameters)
      }
    }
  }
  singleRecommendationAlgorithm = (results, setResults) => {
    results.sort((a, b) => b.scores.totalScore - a.scores.totalScore);
    results = this.allResults.filter((a) => a.scores.totalScore > 0);
    setResults(results.slice(0, 10));
  }
  runAlgorithmComparison = (mapCountries) => {
        const algorithmComparison = new AlgorithmComparison(
          this.greedyRecommendationAlgorithm,
          this.geneticRecommendationAlgorithm,
          this.dynamicDPDominanceRecommendation
        );
        return algorithmComparison.compareAlgorithms(mapCountries);
      };
  greedyRecommendationAlgorithm = (mapCountries, userData, setResults, algorithmParameters) => {

    mapCountries.sort((a, b) =>
      b.properties.result.scores.totalScore - a.properties.result.scores.totalScore
    );
    

    let budget;
    let numberOfWeeks = Math.round(1 + userData.Weeks / 5);
    if (userData.Budget === 0) {
      budget = 225 * numberOfWeeks; // low budget per week is 225
    } else if (userData.Budget === 50) {
      budget = 450 * numberOfWeeks; // mid budget per week is 450
    } else if (userData.Budget === 100) {
      budget = 900 * numberOfWeeks;  // mid budget per week is 900
    }

    const minPenaltyRate = algorithmParameters.distanceDecay.minPenaltyRate;   // very small
    const maxPenaltyRate = algorithmParameters.distanceDecay.maxPenaltyRate;   // a little more than min

    let penaltyRate = minPenaltyRate + (maxPenaltyRate - minPenaltyRate) * (userData.Distance / 100); //linear interpolation


    if (userData.isDistanceNotImportant) {
      penaltyRate = 0;
    }

    let selectedRegions = [];

    // Start by selecting the first region (assuming mapCountries is sorted by totalScore descending)
    budget -= mapCountries[0].properties.result.price;
    selectedRegions.push(mapCountries[0]);

    while (true) {
      // Filter candidates: not selected and price fits the remaining budget
      let candidates = mapCountries
        .filter(region =>
          !selectedRegions.includes(region) &&
          region.properties.result.price <= budget
        )
        .map(candidate => {
          // Calculate penalized score based on distance to all selected regions
          let score = candidate.properties.result.scores.totalScore;

          for (const selected of selectedRegions) {
            const dist = haversine(
              { latitude: selected.geometry.centroid.geometry.coordinates[1], longitude: selected.geometry.centroid.geometry.coordinates[0] },
              { latitude: candidate.geometry.centroid.geometry.coordinates[1], longitude: candidate.geometry.centroid.geometry.coordinates[0] }
            );

            const penaltyFactor = Math.exp(-penaltyRate * dist);
            score *= penaltyFactor;
          }

          candidate.properties.result.scores.penalizedScore = score;
          return candidate;
        })
        // Sort candidates by penalized score descending
        .sort((a, b) => b.properties.result.scores.penalizedScore - a.properties.result.scores.penalizedScore);

      if (candidates.length === 0) {
        // No more candidates fit the budget — stop
        break;
      }

      // Pick the best candidate
      const bestCandidate = candidates[0];

      // Deduct price and add to selectedRegions
      budget -= bestCandidate.properties.result.price;
      selectedRegions.push(bestCandidate);
    }

    const allocatedRegions = this.allocateWeeksILP(
      selectedRegions,
      numberOfWeeks,
      Math.ceil(numberOfWeeks * algorithmParameters.weekAllocation.maxWeeksPerRegionRatio), // Use ratio from store
      userData.weekAllocationDistribution * algorithmParameters.weekAllocation.lambdaPenalty.scaling
    );
    setResults(
      allocatedRegions.map(({ region, weeks }) => ({
        ...region.properties.result,
        allocatedWeeks: weeks
      })))

  }



  geneticRecommendationAlgorithm = (
    mapCountries,
    userData,
    setResults,
    algorithmParameters,
    populationSize = 20,
    generations = 200,
    mutationRate = 0.01  
  ) => {
    // Number of weeks user can allocate
    let numberOfWeeks = Math.round(1 + userData.Weeks / 5);

    // Budget per week tier
    let budgetPerWeek = userData.Budget === 0 ? 225 : userData.Budget === 50 ? 450 : 900;
    let totalBudget = budgetPerWeek * numberOfWeeks;

    // Penalty rate for distance importance
    const minPenaltyRate = algorithmParameters.distanceDecay.minPenaltyRate;   // very small
    const maxPenaltyRate = algorithmParameters.distanceDecay.maxPenaltyRate;   // a little more than min

    let penaltyRate = userData.isDistanceNotImportant
      ? 0
      : minPenaltyRate + (maxPenaltyRate - minPenaltyRate) * (userData.Distance / 100);


    // Max number of regions a chromosome can have (set to mapCountries length)
    const maxRegions = mapCountries.length;

    // Utility: Generate initial population with variable chromosome length (1 to maxRegions)
    function initializePopulation() {
      const population = [];
      for (let i = 0; i < populationSize; i++) {
        const chromosome = [];
        const usedIndices = new Set();

        // Random length between 1 and maxRegions (or limit to numberOfWeeks if desired)
        const length = Math.floor(Math.random() * maxRegions) + 1;

        while (chromosome.length < length) {
          const index = Math.floor(Math.random() * mapCountries.length);
          if (!usedIndices.has(index)) {
            usedIndices.add(index);
            chromosome.push(mapCountries[index]);
          }
        }
        population.push(chromosome);
      }
      return population;
    }

    // Utility: Compute penalty multiplying distance penalties between all pairs
    function computePenalty(chromosome) {
      let penalty = 1.0;
      for (let i = 0; i < chromosome.length; i++) {
        for (let j = i + 1; j < chromosome.length; j++) {
          const dist = haversine(
            {
              latitude: chromosome[i].geometry.centroid.geometry.coordinates[1],
              longitude: chromosome[i].geometry.centroid.geometry.coordinates[0],
            },
            {
              latitude: chromosome[j].geometry.centroid.geometry.coordinates[1],
              longitude: chromosome[j].geometry.centroid.geometry.coordinates[0],
            }
          );
          penalty *= Math.exp(-penaltyRate * dist);

        }
      }
      return penalty;
    }


    // Utility: Fitness score with dynamic chromosome length and budget check
    function computeFitness(chromosome) {
      let totalAttr = 0,
        budgetScore = 0,
        travelMonthScore = 0,
        visitorScore = 0,
        totalCost = 0;

      for (const region of chromosome) {
        const scores = region.properties.result.scores;
        totalAttr += (scores.totalAttrScore.score) / (scores.totalAttrScore.weight) || 0;
        budgetScore += scores.budgetScore || 0;
        travelMonthScore += scores.travelMonthScore || 0;
        visitorScore += scores.visitorScore || 0;
        totalCost += region.properties.result.price || 0;
      }

      if (totalCost > totalBudget) return -Infinity; // reject chromosomes over budget

      const penalty = computePenalty(chromosome);
      return (totalAttr + budgetScore + travelMonthScore + visitorScore) * penalty;
    }

    // Tournament selection same as before
    function tournamentSelection(population, fitnesses) {
      const candidates = [];
      const tournamentSize = 3;
      for (let i = 0; i < tournamentSize; i++) {
        const idx = Math.floor(Math.random() * population.length);
        candidates.push({ chromosome: population[idx], fitness: fitnesses[idx] });
      }
      candidates.sort((a, b) => b.fitness - a.fitness);
      return candidates[0].chromosome;
    }

    // Uniform crossover that merges parents genes without duplicates
    function crossover(parent1, parent2) {
      const child = [];
      const usedNames = new Set();

      // Combine genes from both parents (in random order)
      const combined = [...parent1, ...parent2].filter(
        (region, idx, self) =>
          !usedNames.has(region.properties.name) && (usedNames.add(region.properties.name) || true)
      );

      // Randomly decide chromosome length between 1 and combined length
      const length = Math.floor(Math.random() * combined.length) + 1;

      for (let i = 0; i < length; i++) {
        child.push(combined[i]);
      }

      return child;
    }

    // Mutation: with chance, replace one gene with a new random one (avoid duplicates)
    function mutate(chromosome) {
      if (Math.random() < mutationRate && chromosome.length > 0) {
        const idxToReplace = Math.floor(Math.random() * chromosome.length);
        let replacement;
        const existingNames = new Set(chromosome.map(r => r.properties.name));

        do {
          replacement = mapCountries[Math.floor(Math.random() * mapCountries.length)];
        } while (existingNames.has(replacement.properties.name));

        chromosome[idxToReplace] = replacement;
      }
      return chromosome;
    }

    // === Main GA Loop ===
    let population = initializePopulation();

    for (let gen = 0; gen < generations; gen++) {
      const fitnesses = population.map(computeFitness);

      const newPopulation = [];

      // Elitism: carry over best chromosome
      const eliteIndex = fitnesses.indexOf(Math.max(...fitnesses));
      newPopulation.push(population[eliteIndex]);

      // Fill the rest of the population
      while (newPopulation.length < populationSize) {
        const parent1 = tournamentSelection(population, fitnesses);
        const parent2 = tournamentSelection(population, fitnesses);
        let child = crossover(parent1, parent2);
        child = mutate(child);
        newPopulation.push(child);
      }

      population = newPopulation;
    }

    // Final best chromosome
    const finalFitnesses = population.map(computeFitness);
    const bestIndex = finalFitnesses.indexOf(Math.max(...finalFitnesses));
    const bestChromosome = population[bestIndex];

    // Allocate weeks with the existing ILP function
    const allocatedRegions = this.allocateWeeksILP(
      bestChromosome,
      numberOfWeeks,
      Math.ceil(numberOfWeeks * algorithmParameters.weekAllocation.maxWeeksPerRegionRatio), // Use ratio from store
      userData.weekAllocationDistribution * algorithmParameters.weekAllocation.lambdaPenalty.scaling
    );
    setResults(
      allocatedRegions.map(({ region, weeks }) => ({
        ...region.properties.result,
        allocatedWeeks: weeks,
      }))
    );
  };


  
  // Main function: Dynamic Programming Region Recommendation with Per-Attribute Distance Penalty
  
  dynamicDPDominanceRecommendation = (mapCountries, userData, setResults, algorithmParameters) => {
    // ---- Helper: Attribute Score Accessor (for weighted/unweighted attribute objects) ----
    function getAttributeScore(scoresObj, att) {
      const val = scoresObj[att];
      if (val && typeof val === 'object' && 'score' in val && 'weight' in val && val.weight !== 0) {
        return val.score / val.weight;
      }
      if (val && typeof val === 'object' && 'score' in val) {
        return val.score; // fallback
      }
      return val;
    }
  
    // ---- Helper: Strict Dominance Pruning ----
    function strictlyDominatedRegions(regionArray, attributes) {
      const dominatedIdx = new Set();
      for (let i = 0; i < regionArray.length; i++) {
        for (let j = 0; j < regionArray.length; j++) {
          if (i === j) continue;
          let all_le = true, one_strict_less = false;
          for (let k = 0; k < attributes.length; k++) {
            let ai = getAttributeScore(regionArray[i].properties.result.scores, attributes[k]);
            let aj = getAttributeScore(regionArray[j].properties.result.scores, attributes[k]);
            if (ai > aj) all_le = false;
            if (ai < aj) one_strict_less = true;
          }
          if (all_le && one_strict_less) {
            dominatedIdx.add(i);
            break;
          }
        }
      }
      return dominatedIdx;
    }
  
    // ---- Helper: Custom Dominance Score (EC, DD, CDS) ----
    function customDominanceScores(regionArray, attributes, alpha = 0.5) {
      // Excellence Count per attribute
      const ec = regionArray.map(_ => attributes.map(_ => 0));
      for (let a = 0; a < attributes.length; a++) {
        for (let i = 0; i < regionArray.length; i++) {
          for (let j = 0; j < regionArray.length; j++) {
            if (i === j) continue;
            let ai = getAttributeScore(regionArray[i].properties.result.scores, attributes[a]);
            let aj = getAttributeScore(regionArray[j].properties.result.scores, attributes[a]);
            if (ai > aj) ec[i][a]++;
          }
        }
        let maxCount = Math.max(...ec.map(row => row[a]));
        for (let i = 0; i < regionArray.length; i++) {
          if (maxCount !== 0) ec[i][a] /= maxCount;
        }
      }
      const ecPerf = ec.map(arr => arr.reduce((a, b) => a + b, 0) / arr.length);
  
      // Dominance Degree per attribute
      const dd = regionArray.map(_ => attributes.map(_ => 0));
      for (let a = 0; a < attributes.length; a++) {
        for (let i = 0; i < regionArray.length; i++) {
          for (let j = 0; j < regionArray.length; j++) {
            if (i === j) continue;
            let ai = getAttributeScore(regionArray[i].properties.result.scores, attributes[a]);
            let aj = getAttributeScore(regionArray[j].properties.result.scores, attributes[a]);
            if (ai > aj) dd[i][a] += (ai - aj);
          }
        }
        let maxDom = Math.max(...dd.map(row => row[a]));
        for (let i = 0; i < regionArray.length; i++) {
          if (maxDom !== 0) dd[i][a] /= maxDom;
        }
      }
      const ddPerf = dd.map(arr => arr.reduce((a, b) => a + b, 0) / arr.length);
  
      // Composite Score: weighted sum
      const composite = regionArray.map((_, i) => alpha * ecPerf[i] + (1 - alpha) * ddPerf[i]);
      return composite.map((score, idx) => ({ idx, score }))
        .sort((a, b) => b.score - a.score);
    }
  
    // ---- Parameters and Budget Calculation ----
    let numberOfWeeks = Math.round(1 + userData.Weeks / 5);
    let budget;
    if (userData.Budget === 0) {
      budget = 225 * numberOfWeeks;
    } else if (userData.Budget === 50) {
      budget = 450 * numberOfWeeks;
    } else if (userData.Budget === 100) {
      budget = 900 * numberOfWeeks;
    }
  
    // Penalty rate setup
    const minPenaltyRate = algorithmParameters.distanceDecay.minPenaltyRate;   // very small
    const maxPenaltyRate = algorithmParameters.distanceDecay.maxPenaltyRate;   // a little more than min

    let penaltyRate = minPenaltyRate + (maxPenaltyRate - minPenaltyRate) * Math.pow(userData.Distance / 10, 2);
    
    if (userData.isDistanceNotImportant) {
      penaltyRate = 0;
    }
  
    // Attributes used for dominance
    const attributes = ['budgetScore', 'totalAttrScore', 'travelMonthScore', 'visitorScore', 'penalizedScore'];
  
    // Initial sort by totalScore
    mapCountries.sort((a, b) =>
      b.properties.result.scores.totalScore - a.properties.result.scores.totalScore
    );
  
    // ---- Iterative Selection ----
    let selectedRegions = [];
    let availableRegions = [...mapCountries];
    let currentBudget = budget;
  
    // Select region with highest totalScore and remove from pool
    selectedRegions.push(availableRegions[0]);
    currentBudget -= availableRegions[0].properties.result.price;
    availableRegions.splice(0, 1);
  
    while (true) {
      // Remove strictly dominated regions
      let dominated = strictlyDominatedRegions(availableRegions, attributes);
      let filteredRegions = availableRegions.filter((_, idx) => !dominated.has(idx));
      if (filteredRegions.length === 0) break;
  
      // Affordable only
      let affordable = filteredRegions.filter(r => r.properties.result.price <= currentBudget);
      if (affordable.length === 0) break;
  
      // ---- Penalty application: apply to EACH ATTRIBUTE ----
      affordable.forEach(candidate => {
        // Compute total penalty factor based on all selected regions
        let totalPenalty = 1.0;
        for (const selected of selectedRegions) {
          const candidateCoord = {
            latitude: candidate.geometry.centroid.geometry.coordinates[1],
            longitude: candidate.geometry.centroid.geometry.coordinates[0]
          };
          const selectedCoord = {
            latitude: selected.geometry.centroid.geometry.coordinates[1],
            longitude: selected.geometry.centroid.geometry.coordinates[0]
          };
          const dist = haversine(selectedCoord, candidateCoord);
          totalPenalty *= Math.exp(-penaltyRate * dist);
          
        }
        // For each attribute, apply penalty
        for (const attr of attributes) {
          let originalScore = candidate.properties.result.scores[attr];
          if (typeof originalScore !== 'number') continue;
          candidate.properties.result.scores[attr] = originalScore * totalPenalty;
          // console.log(originalScore * totalPenalty)
        }
      });
  
      // ---- Custom Dominance: compute composite score if enough candidates ----
      let candidates;
      if (affordable.length >= 2) {
        let dominanceRanking = customDominanceScores(affordable, attributes);
        const best = dominanceRanking[0].idx;
        candidates = [affordable[best]];
      } else {
        candidates = affordable;
      }
      if (candidates.length === 0) break;
      let toAdd = candidates[0];
  
      // Update budget/selection/pool
      currentBudget -= toAdd.properties.result.price;
      selectedRegions.push(toAdd);
      availableRegions = availableRegions.filter(r => r !== toAdd);
    }
  
    // ---- Week Distribution Optimization ----
    // This uses an ILP-based allocation method (provided by you)
    // Adjust the arguments as per your allocation function requirements
    const allocatedRegions = this.allocateWeeksILP(
      selectedRegions,
      numberOfWeeks,
      Math.ceil(numberOfWeeks * algorithmParameters.weekAllocation.maxWeeksPerRegionRatio), // Use ratio from store
      userData.weekAllocationDistribution * algorithmParameters.weekAllocation.lambdaPenalty.scaling,
      algorithmParameters.weekAllocation.penaltyFunction
    );
  
    // ---- Set Final Results ----
    setResults(
      allocatedRegions.map(({ region, weeks }) => ({
        ...region.properties.result,
        allocatedWeeks: weeks
      }))
    );
  }

  allocateWeeksILP = (regions, totalWeeks, maxWeeksPerRegion, lambdaPenalty, penaltyFunction) => {
    const model = {
        optimize: 'totalScore',
        opType: 'max',
        constraints: {
            weeks: { max: totalWeeks }
        },
        variables: {},
        ints: {}
    };
    const mu = totalWeeks / regions.length;

    // Add variables: each variable means "region i gets w weeks"
    regions.forEach((region, i) => {
        for (let w = 1; w <= maxWeeksPerRegion; w++) {
            const varName = `r${i}_w${w}`;
            
            // Calculate penalty term based on penalty function
            let penalty;
            switch(penaltyFunction) {
                case "quadratic":
                    penalty = lambdaPenalty * Math.pow(w - mu, 2);
                    break;
                case "linear":
                    penalty = lambdaPenalty * Math.abs(w - mu);
                    break;
                case "cubic":
                    penalty = lambdaPenalty * Math.pow(w - mu, 3);
                    break;
                default:
                    penalty = lambdaPenalty * Math.pow(w - mu, 2); // default to quadratic
            }

            // Adjusted totalScore subtracts penalty
            const adjustedScore = region.properties.result.scores.totalScore * w - penalty;

            model.variables[varName] = {
                totalScore: adjustedScore,
                weeks: w
            };
            model.ints[varName] = 1;
        }
    });

    // Constraint: Each region can have only one week allocation (binary sum = 1)
    regions.forEach((_, i) => {
        const constraintName = `only_one_week_r${i}`;
        model.constraints[constraintName] = { max: 1 };
        for (let w = 1; w <= maxWeeksPerRegion; w++) {
            const varName = `r${i}_w${w}`;
            model.variables[varName][constraintName] = 1;
        }
    });

    // Solve ILP
    const results = window.solver.Solve(model);

    // Extract allocation from solution
    const allocation = [];
    regions.forEach((region, i) => {
        for (let w = 1; w <= maxWeeksPerRegion; w++) {
            const varName = `r${i}_w${w}`;
            if (results[varName] === 1) {
                allocation.push({ region, weeks: w });
            }
        }
    });

    return allocation;
};


}

export default LoadCountriesTask;



  // dynamicDPDominanceRecommendation = (mapCountries, userData, setResults) => {

  //   // --- Attribute Score Accessor (score/weight for objects) ---
  //   function getAttributeScore(scoresObj, att) {
  //     const val = scoresObj[att];
  //     if (val && typeof val === 'object' && 'score' in val && 'weight' in val && val.weight !== 0) {
  //       return val.score / val.weight;
  //     }
  //     if (val && typeof val === 'object' && 'score' in val) {
  //       return val.score; // fallback
  //     }
  //     return val;
  //   }
    
  //   // --- Helper: Strict Dominance Pruning ---
  //   function strictlyDominatedRegions(regionArray, attributes) {
  //     const dominatedIdx = new Set();
  //     for (let i = 0; i < regionArray.length; i++) {
  //       for (let j = 0; j < regionArray.length; j++) {
  //         if (i === j) continue;
  //         let all_le = true, one_strict_less = false;
  //         for (let k = 0; k < attributes.length; k++) {
  //           let ai = getAttributeScore(regionArray[i].properties.result.scores, attributes[k]);
  //           let aj = getAttributeScore(regionArray[j].properties.result.scores, attributes[k]);
  //           if (ai > aj) all_le = false;
  //           if (ai < aj) one_strict_less = true;
  //         }
  //         if (all_le && one_strict_less) {
  //           dominatedIdx.add(i);
  //           break;
  //         }
  //       }
  //     }
  //     return dominatedIdx;
  //   }

  //   // --- Helper: Custom Dominance Calculation ---
  //   function customDominanceScores(regionArray, attributes, alpha = 0.5) {
  //     // Step 1: Excellence Count Calculation
  //     const ec = regionArray.map(_ => attributes.map(_ => 0));
  //     for (let a = 0; a < attributes.length; a++) {
  //       for (let i = 0; i < regionArray.length; i++) {
  //         for (let j = 0; j < regionArray.length; j++) {
  //           if (i === j) continue;
  //           let ai = getAttributeScore(regionArray[i].properties.result.scores, attributes[a]);
  //           let aj = getAttributeScore(regionArray[j].properties.result.scores, attributes[a]);
  //           if (ai > aj) ec[i][a]++;
  //         }
  //       }
  //       let maxCount = Math.max(...ec.map(row => row[a]));
  //       for (let i = 0; i < regionArray.length; i++) {
  //         if (maxCount !== 0) ec[i][a] /= maxCount;
  //       }
  //     }
  //     // EC performance per region (average over attributes)
  //     const ecPerf = ec.map(arr => arr.reduce((a, b) => a + b, 0) / arr.length);

  //     // Step 2: Dominance Degree Calculation
  //     const dd = regionArray.map(_ => attributes.map(_ => 0));
  //     for (let a = 0; a < attributes.length; a++) {
  //       for (let i = 0; i < regionArray.length; i++) {
  //         for (let j = 0; j < regionArray.length; j++) {
  //           if (i === j) continue;
  //           let ai = getAttributeScore(regionArray[i].properties.result.scores, attributes[a]);
  //           let aj = getAttributeScore(regionArray[j].properties.result.scores, attributes[a]);
  //           if (ai > aj) dd[i][a] += (ai - aj);
  //         }
  //       }
  //       let maxDom = Math.max(...dd.map(row => row[a]));
  //       for (let i = 0; i < regionArray.length; i++) {
  //         if (maxDom !== 0) dd[i][a] /= maxDom;
  //       }
  //     }
  //     // DD performance per region
  //     const ddPerf = dd.map(arr => arr.reduce((a, b) => a + b, 0) / arr.length);

  //     // Step 3: Composite Score
  //     const composite = regionArray.map((_, i) => alpha * ecPerf[i] + (1 - alpha) * ddPerf[i]);

  //     // Return [regionIdx, compositeScore] pairs sorted
  //     return composite.map((score, idx) => ({ idx, score }))
  //       .sort((a, b) => b.score - a.score);
  //   }
  //   // --- Setup and User Budget ---
  //   let budget;
  //   let numberOfWeeks = Math.round(1 + userData.Weeks / 5);
  //   if (userData.Budget === 0) {
  //     budget = 225 * numberOfWeeks;
  //   } else if (userData.Budget === 50) {
  //     budget = 450 * numberOfWeeks;
  //   } else if (userData.Budget === 100) {
  //     budget = 900 * numberOfWeeks;
  //   }


  //   const minPenaltyRate = 0.00001;   // very small
  //   const maxPenaltyRate = 0.00004;   // a little more than min

  //   let penaltyRate = minPenaltyRate + (maxPenaltyRate - minPenaltyRate) * (userData.Distance / 100);
  //   if (userData.isDistanceNotImportant) {
  //     penaltyRate = 0;
  //   }

  //   // --- Scoring Setup ---
  //   const attributes = ['budgetScore', 'totalAttrScore', 'travelMonthScore', 'visitorScore', 'penalizedScore'];
  //   // Sort by totalScore as first guess
  //   mapCountries.sort((a, b) =>
  //     b.properties.result.scores.totalScore - a.properties.result.scores.totalScore
  //   );


  //   // --- Iterated Selection ---
  //   let selectedRegions = [];
  //   let availableRegions = [...mapCountries];
  //   let currentBudget = budget;

  //   // Select region with highest initial totalScore and remove it from pool
  //   selectedRegions.push(availableRegions[0]);
  //   currentBudget -= availableRegions[0].properties.result.price;
  //   availableRegions.splice(0, 1);

  //   // DP loop: keep selecting until budget is over or no more candidates
  //   while (true) {
  //     // Remove dominated regions from pool
  //     let dominated = strictlyDominatedRegions(availableRegions, attributes);
  //     let filteredRegions = availableRegions.filter((_, idx) => !dominated.has(idx));

  //     if (filteredRegions.length === 0) break;


  //     // Filter candidates by those that are affordable
  //     let affordable = filteredRegions.filter(r => r.properties.result.price <= currentBudget);
  //     // console.log(affordable)
  //     if (affordable.length === 0) break;

  //     // Calculate penalized score for distance
  //     affordable.forEach(candidate => {
  //       let penalizedScore = candidate.properties.result.scores.totalScore;
  //       for (const selected of selectedRegions) {
  //         const candidateCoord = {
  //           latitude: candidate.geometry.centroid.geometry.coordinates[1],
  //           longitude: candidate.geometry.centroid.geometry.coordinates[0]
  //         };
  //         const selectedCoord = {
  //           latitude: selected.geometry.centroid.geometry.coordinates[1],
  //           longitude: selected.geometry.centroid.geometry.coordinates[0]
  //         };
  //         const dist = haversine(selectedCoord, candidateCoord);
  //         const penaltyFactor = Math.exp(-penaltyRate * dist);
  //         // console.log(penaltyFactor)
  //         penalizedScore *= penaltyFactor;
  //       }
  //       candidate.properties.result.scores.penalizedScore = penalizedScore;
  //     });

  //     // Apply custom dominance strategy if more than two left and not all strictly dominated
  //     let candidates;
  //     if (affordable.length >= 2) {
  //       let dominanceRanking = customDominanceScores(affordable, attributes);
  //       // Pick the region with the highest composite score
  //       const best = dominanceRanking[0].idx;
  //       candidates = [affordable[best]];
  //     } else {
  //       candidates = affordable;
  //     }

  //     if (candidates.length === 0) break;
  //     let toAdd = candidates[0]; // select the top candidate

  //     // Deduct price, add to selected, remove from available
  //     currentBudget -= toAdd.properties.result.price;
  //     selectedRegions.push(toAdd);
  //     availableRegions = availableRegions.filter(r => r !== toAdd);
  //   }
  //   // --- Week Distribution: Use your allocateWeeksILP from before ---
  //   const allocatedRegions = this.allocateWeeksILP(
  //     selectedRegions,
  //     numberOfWeeks,
  //     Math.ceil(numberOfWeeks / 2),
  //     userData.weekAllocationDistribution / 10
  //   );

  //   setResults(
  //     allocatedRegions.map(({ region, weeks }) => ({
  //       ...region.properties.result,
  //       allocatedWeeks: weeks
  //     }))
  //   );
  // }
