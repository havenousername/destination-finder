import mapData from "../data/regions.json";
import axios from 'axios';
import { getShortMonths } from "../helpers/months";
import * as turf from '@turf/turf';
import haversine from 'haversine';


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
  processCountries = (countryScores, userData, setCountries, setResults) => {
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
    this.setTypeResults(this.allResults, this.mapCountries, setResults, "SingleRecommendation")
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
  setTypeResults = (results, mapCountries, setResults, type) => {

    if (type === "SingleRecommendation") {
      this.singleRecommendationAlgorithm(results, setResults)
    }
    this.greedyRecommendationAlgorithm(mapCountries, results)

    //  console.log(mapCountries)
    // const start = { latitude: 28.59459476916798 , longitude: 16.48617513428431 }; //16.48617513428431, 28.59459476916798 Libya
    // const end = { latitude: 34.140400485429936, longitude: 9.853497104541143 }; //9.853497104541143, 34.140400485429936 Tunisia
    // const distance = haversine(start, end); // by default in kilometers
    // console.log(distance);
  }
  singleRecommendationAlgorithm = (results, setResults) => {
    results.sort((a, b) => b.scores.totalScore - a.scores.totalScore);
    results = this.allResults.filter((a) => a.scores.totalScore > 0);
    setResults(results.slice(0, 10));
  }

  greedyRecommendationAlgorithm = (mapCountries, results) => {
    // mapCountries.sort((a,b) => a-b)

    // const budgetLevel = 160
    for (let i = 0; i < mapCountries.length; i++) {
      //  console.log(mapCountries[i].properties.result.scores)
      //  console.log(mapCountries[i].properties.result)
      mapCountries[i].properties.result.scores.scoreToCostRatio = mapCountries[i].properties.result.scores.totalScore / mapCountries[i].properties.result.price
    }
    mapCountries.sort((a, b) =>
      b.properties.result.scores.scoreToCostRatio - a.properties.result.scores.scoreToCostRatio
    );
    // const budgetLabel = country.budgetLevel < 40 ? "Low" : country.budgetLevel < 80 ? "Medium" : "High";

    //  mapCountries.sort((a, b) => 
    //   b.properties.result.scores.totalScore - a.properties.result.scores.totalScore
    // );
    //one month trip(900 per month) middle 1800 high 3600
    //when u have low budget penality late is high for distance and the other way around when u have high budget
          // let budget = 1800
          // let selectedRegions = []
          // const penaltyRate = 0.000025; //0.00006 - 0.000025
          // budget = budget - mapCountries[0].properties.result.price
          // selectedRegions.push(mapCountries[0])
          // let candidates = mapCountries.filter(region => !selectedRegions.includes(region)).map(candidate => {
          //   let score = candidate.properties.result.scores.totalScore;

          //   for (const selected of selectedRegions) {
          //     const dist = haversine(
          //       { latitude: selected.geometry.centroid.geometry.coordinates[1] , longitude: selected.geometry.centroid.geometry.coordinates[0] }, // { lat, lon }
          //       { latitude: candidate.geometry.centroid.geometry.coordinates[1] , longitude: candidate.geometry.centroid.geometry.coordinates[0] }
          //     );

          //     // if(candidate.properties.name === "Finland"){
          //     //   console.log(score)
          //     //   const penaltyFactor = Math.exp(-penaltyRate * dist);
          //     //   score *= penaltyFactor;
          //     //   console.log(dist)
          //     //   console.log(penaltyFactor* score)
          //     // }

          //     const penaltyFactor = Math.exp(-penaltyRate * dist);
          //     score *= penaltyFactor;        
          //   }

          //   candidate.properties.result.scores.penalizedScore = score;
          //   return candidate;
          // })
          // .sort((a,b) => b.properties.result.scores.penalizedScore - a.properties.result.scores.penalizedScore);


          
          let budget = 3600;
          let selectedRegions = [];
          const penaltyRate = 0.00001;
          
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
          
    console.log(selectedRegions)
    // const distance = haversine(start, end); // by default in kilometers



    // console.log(selectedRegion)
    // console.log(mapCountries)
    // console.log(candidates)

  }

}

export default LoadCountriesTask;
