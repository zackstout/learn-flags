<template>
  <div id="app">
    <div v-for="region in regions" :key="region" class="region">
      <div>{{ region }}</div>
      <div>Total countries: {{ getRegionCountries(region).length }}</div>

      <div v-for="(country, i) in getRegionCountries(region)" :key="i">
        {{ country.name }}
        <img :src="getImgSrc(country)" />
      </div>

      <hr />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "./components/HelloWorld.vue";
import * as countryData from "./countries.json";
import * as d3 from "d3";

const REGIONS = ["Asia", "Americas", "Europe", "Oceania", "Africa"];

@Component({
  components: {
    HelloWorld,
  },
})
export default class App extends Vue {
  countries: any[] = [];
  regions = REGIONS;
  regionsData = {};

  csvData = [];

  // what?! so many aspect ratios: https://en.wikipedia.org/wiki/List_of_aspect_ratios_of_national_flags

  getImgSrc(country: any) {
    const code = country.alpha3.toLowerCase();
    // webpack thing
    console.log("img", code);
    return require(`./images/svg/${code}.svg`);
  }

  getRegionCountries(region: string) {
    //  REGIONS.forEach((region) => {
    const res = this.csvData
      .filter((x) => x.Continent === region)
      .map((x) => {
        return this.countries.find((c) => c.name === x.Name);
        // console.log(this.countries.find((c) => c.name === x.Name));
        // return Object.assign(
        //   {},
        //   x,
        //   this.countries.find((c) => c.name === x.Name)
        // );
      });
    // });

    return res;
  }

  mounted() {
    // @ts-ignore
    console.log("count", countryData.default);
    // @ts-ignore
    this.countries = countryData.default;

    const csvData: any[] = [];
    d3.csv("./info.csv", null, (data: any) => {
      csvData.push(data);
      // console.log("data", data);
    });

    setTimeout(() => {
      this.csvData = csvData;
      console.log("csv", csvData);

      // REGIONS.forEach((region) => {
      //   this.regionsData[region] = csvData
      //     .filter((x) => x.Continent === region)
      //     .map((x) => {
      //       return this.countries.find((c) => c.name === x.Name);
      //       // console.log(this.countries.find((c) => c.name === x.Name));
      //       // return Object.assign(
      //       //   {},
      //       //   x,
      //       //   this.countries.find((c) => c.name === x.Name)
      //       // );
      //     });
      // });

      // console.log("regions data...", this.regionsData);

      // REGIONS.forEach((r) => console.log(this.regionsData[r]));

      // ====================================

      // const unmatched = [];
      // this.countries.forEach((country) => {
      //   if (country.name.includes("Czech")) console.log(country.name);
      //   if (csvData.find((x) => x.Name === country.name) === undefined) {
      //     unmatched.push(country.name);
      //   }
      // });

      // const unmatched2 = [];
      // csvData.forEach((country) => {
      //   if (this.countries.find((x) => x.name === country.Name) === undefined) {
      //     unmatched2.push(country.Name);
      //   }
      // });

      // console.log("unmatched", unmatched, unmatched2);
    }, 1000);
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
  margin-bottom: 5rem;

  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 50vh;
}
</style>
