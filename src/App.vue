<template>
  <div id="app">
    <!-- <div v-for="region in regions" :key="region" class="region">
      <h1>{{ region }}</h1>

      <div v-for="(subregion, j) in getSubregions(region)" :key="j">
        <h2>{{ subregion }}</h2>
        <h4>Total countries: {{ getSubregionCountries(region, subregion).length }}</h4>

        <div class="countries-container">
          <div v-for="country in getSubregionCountries(region, subregion)" :key="country.name">
            {{ country.name }}
            <img :src="getImgSrc(country)" />
          </div>
        </div>
      </div>

      <hr />
    </div> -->

    <div v-for="region in allSubregions" :key="region.name" class="region">
      <div>{{ region.name }}</div>
      <h4>Total: {{ region.values.length }}</h4>

      <div class="countries-container">
        <div v-for="country in region.values" :key="country.name">
          <div>{{ country.name }}</div>
          <div>{{ country.capital }}</div>
          <div>{{ country.population }}</div>
          <div>{{ country.alpha3Code }}</div>

          <img :src="country.flag" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as countryData from "./countries.json";
import * as d3 from "d3";
import * as axios from "axios";

// hahahhahaha wasted all that time doing data input
// of course
// All countries data here: https://restcountries.eu/rest/v2/
// of course even has flags hahaha
// and pop, lat/long, capital, region, subregion, languages, borders (with alpha3 code), currencies

// OOoooohho but a lot of their flags don't work -- so we did gain SOMETHING
// No nvm hhaaha

// what?! so many aspect ratios: https://en.wikipedia.org/wiki/List_of_aspect_ratios_of_national_flags

/*
= Should be "learning phase" for a flag (group). 

= Shouldn't be able to learn more than 3 new ones without having to review them before getting more.

= This is main principle: force to review before move on to new.

= DEFINITELY want to bring in maps with d3 -- highlight relevant regions/country/countries

Asia: 
Central - 5
East - 8
West -17
South-9
Southeast-11

Americas:
South-14
Central-7
Caribbean-31

Europe:
East-10
West-12
South-14
North-13

Oceania - 31

Africa:
Central-9
East-21
West-17
South-5
North-6


*/

const REGIONS = ["Asia", "Americas", "Europe", "Oceania", "Africa"];
const SUBREGIONS = {
  Asia: ["Central", "East", "West", "South", "Southeast"],
  Americas: ["South America", "Central America", "Caribbean"],
  Africa: ["Central", "East", "West", "South", "North"],
  Europe: ["East", "West", "South", "North"],
};

@Component({
  components: {},
})
export default class App extends Vue {
  countries: any[] = [];
  allSubregions = [];
  // regions = REGIONS;
  // regionsData = {}; // Key of "Asia", value of object with keys subregions, values are arrays of countries

  // csvData = [];

  // getSubregions(region: string) {
  //   return (SUBREGIONS[region] || []).concat("Other");
  // }

  // getImgSrc(country: any) {
  //   const code = country.alpha3.toLowerCase();
  //   // webpack thing
  //   return require(`./images/svg/${code}.svg`);
  // }

  // getSubregionCountries(region: string, subregion: string) {
  //   // [x] NOTE: Wrong -- still puttinng  middle east in Africa and asia
  //   const res = this.csvData
  //     .filter((x) => x.Continent === region)
  //     .filter((x) => {
  //       if (subregion === "Other") {
  //         const otherSubregionsInRegion = SUBREGIONS[region] || [];
  //         return !otherSubregionsInRegion.includes(x.Specific);
  //       }
  //       return x.Specific === subregion;
  //     })
  //     .map((x) => {
  //       return this.countries.find((c) => c.name === x.Name);
  //     });

  //   return res;
  // }

  mounted() {
    // @ts-ignore
    // console.log("count", countryData.default);
    // // @ts-ignore
    // this.countries = countryData.default;

    // const csvData: any[] = [];
    // d3.csv("./info.csv", null, (data: any) => {
    //   csvData.push(data);
    //   // console.log("data", data);
    // });

    // setTimeout(() => {
    //   this.csvData = csvData;
    //   console.log("csv", csvData);
    // }, 1000);

    const allSubregions = {};
    //@ts-ignore
    axios.get("https://restcountries.eu/rest/v2/").then((res) => {
      console.log("axios", res.data);

      res.data.forEach((row) => {
        if (!allSubregions.hasOwnProperty(row.subregion)) {
          allSubregions[row.subregion] = [];
        }
        allSubregions[row.subregion].push(row);
      });

      console.log("all", allSubregions);

      this.countries = res.data;
      this.allSubregions = Object.keys(allSubregions).map((name) => {
        return { name, values: allSubregions[name] };
      });
    });
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  font-size: 2rem;
}

img {
  max-height: 3.5rem;
}

.region {
  margin: 3rem 0;
}

.countries-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  max-height: 50vh;
  margin: 2rem 0;
}
</style>
