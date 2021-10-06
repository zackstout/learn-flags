<template>
  <div id="app">
    <!-- <div class="welcome" v-html="welcomeHtml"></div> -->

    <MyFlags :subregionCountries="subregionCountries" @newFlags="handleNewFlags" :db="db" />

    <LearnFlags :countries="newFlags" v-if="newFlags.length > 0" />

    <Quiz :flagFirst="true" :db="db" v-if="quiz && quiz.length > 0" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

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

import * as data from "./countries.json";
import * as data2 from "./countries2.json";

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

      // console.log("snapshot", data); // only called on first answer click....

      this.setDatabaseCountries(
        Object.keys(data).map((name) => {
          // console.log(data[name].numAttempts);
          return { name, ...data[name] };
        })
      );

      // this.setupMap();
    });

    // TODO:  Just store this data in a file yourself

    // Transform data for markup to consume:
    const allSubregions = {};

    // const brokenUrl = "https://restcountries.eu/rest/v2/";
    // const url = "https://github.com/stefangabos/world_countries/blob/master/data/en/countries.json";

    console.log("countries..", data, "countries2", data2);

    data2.forEach((country) => {
      if (!allSubregions.hasOwnProperty(country.subregion)) {
        allSubregions[country.subregion] = [];
      }
      const c = {
        ...country,
        ...{
          name: country.name.common,
          capital: country.capital[0],
          code3: country.cca3,
        },
      };
      allSubregions[country.subregion].push(c);
    });

    this.setSubregions(
      Object.keys(allSubregions).map((name) => {
        return { name, values: allSubregions[name] };
      })
    );

    //   // ==================
    //   // TESTING:
    //   // const quiz = generateQuiz(this.subregionCountries[0].countries.slice(0, 3), 5);
    //   // this.quizQuestions = quiz;
    //   // this.newFlags = this.subregionCountries[0].countries;
    // });
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
