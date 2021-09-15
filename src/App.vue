<template>
  <div id="app">
    <div class="welcome" v-html="welcomeHtml"></div>

    <MyFlags :subregionCountries="subregionCountries" @newFlags="handleNewFlags" :db="db" />

    <LearnFlags :countries="newFlags" v-if="newFlags.length > 0" />

    <Quiz :flagFirst="true" :db="db" v-if="quiz && quiz.length > 0" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

import * as d3 from "d3";

import * as axios from "axios";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import Quiz from "@/components/Quiz.vue";
import LearnFlags from "@/components/LearnFlags.vue";
import MyFlags from "@/components/MyFlags.vue";
import { Getter, Mutation, State } from "vuex-class";
import { QuizQuestion, QuizQuestionIndices } from "./interfaces";

// ==================================================

const WELCOME_HTML = `<ul><li>Welcome! It looks like you have not yet begun learning the <b>Flags</b> of the world with us. Today is a wonderful day to begin!</li>

<li>There are five <b>Regions</b>: Asia, Africa, Europe, Americas, and Oceania. Each is comprised of <b>Subregions</b>.</li>

<li>You are always free to unlock the first <b>Subregion</b> of a <b>Region</b>.</li>

<li>After doing so, you will be asked to <u>complete tasks</u> before you can unlock more <b>Flags</b> within that <b>Subregion</b>, or more <b>Subregions</b> within that <b>Region.</b></li>

<li><u>Review <b>Flags</b> to gain XP points and advance!</u> Good luck and have fun!</li></ul>`;

const firebaseConfig = {
  apiKey: "AIzaSyBDhXVtVZwURQEtUPsdleJp6XEUulRZC-Y",
  authDomain: "flags-79ae1.firebaseapp.com",
  projectId: "flags-79ae1",
  storageBucket: "flags-79ae1.appspot.com",
  messagingSenderId: "918730653461",
  appId: "1:918730653461:web:a1347aef7e5b1bdc6bb31c",
};

export const stub = (str) => {
  return str.replace(/\s/g, "_").replace(/\./g, "%");
};

export const unstub = (str) => {
  return str.replace(/_/g, " ").replace(/%/g, ".");
};

// DOESN'T INCLUDE MAX
export const getRandom = (min, max) => {
  return min + Math.floor(Math.random() * (max - min));
};

@Component({
  components: {
    Quiz,
    LearnFlags,
    MyFlags,
  },
})
export default class App extends Vue {
  allSubregions = [];
  db: any = null;
  databaseCountries: any = [];
  @Getter quiz: QuizQuestion[];

  countriesForMap = [];

  welcomeHtml = WELCOME_HTML;

  @Getter subregionCountries: any[];
  @Mutation setDatabaseCountries: (x: any) => void;
  @Mutation setSubregions: (x: any) => void;
  @Mutation setQuizIndices: (indices: QuizQuestionIndices[]) => void;

  // If this has members, we should be showing LearnFlags modal
  newFlags = [];

  handleNewFlags(flags) {
    this.newFlags = flags;
  }

  initData(row) {
    // Ok great this was just needed to setup the DB, seems to work:
    // =============
    const stubbedName = stub(row.name);

    set(ref(this.db, `countries/${stubbedName}`), {
      lastReviewed: false,
      isUnlocked: false,
      numAttempts: 0,
      numCorrect: 0,
    });
  }

  mounted() {
    initializeApp(firebaseConfig);
    const db = getDatabase();
    this.db = db;

    // Click outside modals to close:
    document.addEventListener("mousedown", () => {
      this.newFlags = [];
      // this.quizQuestions = [];
      this.setQuizIndices([]);
    });

    onValue(ref(db, "countries"), (snapshot) => {
      const data = snapshot.val();

      console.log("snapshot"); // only called on first answer click....

      this.setDatabaseCountries(
        Object.keys(data).map((name) => {
          // console.log(data[name].numAttempts);
          return { name, ...data[name] };
        })
      );

      this.setupMap();
    });

    // Transform data for markup to consume:
    const allSubregions = {};
    //@ts-ignore
    axios.get("https://restcountries.eu/rest/v2/").then((res) => {
      res.data.forEach((row) => {
        if (!allSubregions.hasOwnProperty(row.subregion)) {
          allSubregions[row.subregion] = [];
        }
        allSubregions[row.subregion].push(row);

        // Only needed once to init database:
        // this.initData(row);
      });

      // this.allSubregions = Object.keys(allSubregions).map((name) => {
      //   return { name, values: allSubregions[name] };
      // });
      this.setSubregions(
        Object.keys(allSubregions).map((name) => {
          return { name, values: allSubregions[name] };
        })
      );

      // console.log(
      //   "sub",
      //   Object.keys(allSubregions).map((name) => {
      //     return { name, values: allSubregions[name] };
      //   })
      // );

      // ==================
      // TESTING:
      // const quiz = generateQuiz(this.subregionCountries[0].countries.slice(0, 3), 5);
      // this.quizQuestions = quiz;
      // this.newFlags = this.subregionCountries[0].countries;
    });
  }

  setupMap() {
    d3.json("allCountries2.json").then((data) => {
      console.log("all countries", data);
      this.countriesForMap = data;
      // console.log("all countries", this, this.countriesForMap);
    });

    var width = 1200;
    var height = 1000;

    var projection = d3.geoMercator().scale(150);

    var svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    var path = d3.geoPath().projection(projection);
    var g = svg.append("g");

    d3.json("world-110m2.json").then((data) => {
      console.log("world map data", data);

      //@ts-ignore
      const geoms = topojson.object(data, data.objects.countries).geometries;

      g.selectAll("path")
        .data(geoms)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", (d) => {
          const country = this.countriesForMap.find((c) => parseInt(c.uni) === d.id);
          const alpha3 = country ? country.iso3 : "";
          const targets = this.subregionCountries[0].countries;
          return targets.map((country) => country.alpha3Code).includes(alpha3) ? "blue" : "gray";
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
  color: #2c3e50;
  font-size: 2rem;
  /* padding: 2rem; */
}

img {
  max-height: 3.5rem;
}
/* 
.region {
  margin: 3rem 0;
}

.countries-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  max-height: 50vh;
  margin: 2rem 0;
} */

button {
  font-size: 0.8rem;
  padding: 0.4rem;
  /* margin: 0.5rem 0; */
  border-radius: 0.2rem;
  appearance: none;
  background: rgb(16, 185, 129);
  color: white;
  cursor: pointer;
  border: none;
}

button:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

button:hover {
  opacity: 0.9;
}

.modal {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0%;
  left: 0%;
  opacity: 50%;
  background: gray;
  z-index: 40;
}

.modal-inner {
  /* width: 100%;
  height: 100%; */
  position: fixed;
  top: 5vh;
  left: 5vw;
  height: 90vh;
  width: 90vw;
  border-radius: 2%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  opacity: 100%;
  background: white;
  padding: 2rem;
  z-index: 50;
}

.welcome {
  font-style: italic;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
}

.welcome li {
  margin: 1rem 0;
}

/* path {
  stroke: white;
  stroke-width: 0.5px;
  fill: black;
} */
</style>
