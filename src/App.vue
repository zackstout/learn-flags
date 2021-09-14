<template>
  <div id="app">
    <MyFlags
      :subregionCountries="subregionCountries"
      @newFlags="handleNewFlags"
      @quizQuestions="handleQuizQuestions"
      :db="db"
    />

    <LearnFlags :countries="newFlags" v-if="newFlags.length > 0" />

    <Quiz :questions="quizQuestions" :flagFirst="true" :db="db" v-if="quizQuestions.length > 0" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as d3 from "d3";
import * as axios from "axios";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import Quiz from "@/components/Quiz.vue";
import LearnFlags from "@/components/LearnFlags.vue";
import MyFlags from "@/components/MyFlags.vue";

// what?! so many aspect ratios: https://en.wikipedia.org/wiki/List_of_aspect_ratios_of_national_flags

/*
= Should be "learning phase" for a flag (group).
= Shouldn't be able to learn more than 3 new ones without having to review them before getting more.
= This is main principle: force to review before move on to new.

1. Unlock system for subregions

2. Unlock system for countries
-after have reviewed all? But..you have to immediately "review" upon test. Does review mean retest?
-put a day-limit on. Can only unlock x per day (>>>> so data needs unlockedDate, i think ****)
- eh, not needed...just growing requirements of how many reviews must do?

3. Learn new flags view
-tap/slide through carousel
-then click "take quiz/test"
-they are...scoped to a particular subregion, drawn from Locked countries in there

4. Quiz generation system
-Can be either review-level (has seen x times), OR subregion level (most likely), OR just all/fixed number of random reviews
-Can be either FLAG-FIRST, or COUNTRY-FIRST..
-..maybe random? random by quiz or by question?
-start with "by subregion"

5. Quiz answer generation system
*** -Try to pull at least a few from ones user has seen ***
-Stretch: try to trick with similar by color/design
-Probably just pull from same region (to start)

6. Design "unlocked flags" view
- show checkmark/"x" history of attempts for each
- show some kind of larger stats for region (maybe a different view though...)
- show all info from API

NOTE: To start can just focus on subregions, don't worry about grouping into larger regions.

7. a MAP!
- could be sick

quiz options...
- all of level x (i.e i've seen it x times)
- all of subregion
- all! (either all all, or random of certain number)

Some fun message that you can unlock new flags. :)


TODOS:
- [x] Add regions, put subregions under them in MyFlags
- [x] Put "learn flags" and "test" behind buttons, and in modals
- [x-ish] Wire up tracking of answers
- [x] Build out view of MyFlags (flag cards, gray out locked countries and subregions and regions)
- [x] test quiz generation logic for subregions and regions
- [x] add logic for "can unlock new flags" and "can unlock new regions" (latter should be very easy)
- [ ] need "today" logic
- [x] add messaging/feedback for "can't unlock yet" 
- [ ] (expose more quiz buttons for each? only show one at time?)
- [ ] clarify quiz params.. flagfirst, pool (easy...), number? Just choose at random?
- [ ] would like it to LOOK/FEEL good!
- [ ] just setup vuex state


Quiz stuff:

// NOTE: this may need  to take in MORE than just pool (of quiz questions), to generate  answers
// Maybe to start...Just pull from all countries/flags?
// OOOOH but then it's too easy, because if quiz is scoped to Subregion....they can eliminate too many....
// If possible only pull in ones you've seen???

// Just returns array of arrays of answers. Each question is just that array of answers.
// The "isCorrect" one will let you build the markup for the quiz question.
// This structure should let either a flag-first OR a country-first quiz consume this..

// "Pool" will be e.g. all once-seen countries,
// or all subregion countries that are unlocked, or region countries that are unlocked
// maxNum will almost always be 5 (??)
// "Pool" represents possible ANSWERS
// The list of questions will come from there, AS WELL AS ALL POSSIBLE ANSWERS

// Issue: what about when we know what quiz is on - e.g. just unlocked - but possible answers are more?
// Optional parameter: list of "pre-picked" questions, I guess

// One wrinkle: add to pool if countryFirst (because random flags are good and cool)
*/

// ==================================================

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

  // If this has membres, we should be showing quiz modal
  quizQuestions: any[] = [];

  // If this has members, we should be showing LearnFlags modal
  newFlags = [];

  handleNewFlags(flags) {
    this.newFlags = flags;
  }

  handleQuizQuestions(questions) {
    // console.log("emit", questions);
    this.quizQuestions = questions;
  }
  // - [ ] TODO: subregion could be a class, with all methods on there

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

  // [x] Should merge together databaseCountries (info from DB) with allSubregions, which is API data
  // [x] Should return array  of subregions, each of which has name and countries, which have merged data
  // [x] Huh...not sure why change to databaseCountries doesn't trigger change here...Change to array?

  // Is nesting messing up reactivity?
  // Not seeing isUnlocked come through....
  // Ahhhh adding new props does not trigger changes
  get subregionCountries() {
    return this.allSubregions.map((subregion) => {
      return {
        name: subregion.name,
        countries: subregion.values.map((country) => {
          let c = this.databaseCountries.find((c) => unstub(c.name) === country.name);

          // Try to get around "no reactivity if adding props" issue -- justuse vuex state
          if (!c) {
            c = {
              isUnlocked: false,
              numAttempts: 0,
              numCorrect: 0,
              lastReviewed: false,
            };
          }
          return Object.assign({}, country, c);
        }),
      };
    });
  }

  mounted() {
    initializeApp(firebaseConfig);
    const db = getDatabase();
    this.db = db;

    document.addEventListener("mousedown", () => {
      this.newFlags = [];
      this.quizQuestions = [];
    });

    onValue(ref(db, "countries"), (snapshot) => {
      const data = snapshot.val();

      console.log("snapshot"); // only called on first answer click....

      // This *should* "just work" ... and cause subregionCountries to update
      // I think this is causing "only respond to first answer click" issue....
      // No, this just stops being called....
      // And the reason is that the data in firebase is not actually updating. Makes sense.
      // So issue could be here....it's not actually reacting to first real change to DB.

      // - [ ] TODO: It MIGHT fix things if we have a row in database for each country..
      this.databaseCountries = Object.keys(data).map((name) => {
        // console.log(data[name].numAttempts);
        return { name, ...data[name] };
      });
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

      this.allSubregions = Object.keys(allSubregions).map((name) => {
        return { name, values: allSubregions[name] };
      });

      // ==================
      // TESTING:
      // const quiz = generateQuiz(this.subregionCountries[0].countries.slice(0, 3), 5);
      // this.quizQuestions = quiz;
      // this.newFlags = this.subregionCountries[0].countries;
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
  font-size: 2rem;
  padding: 1rem;
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
  width: 100%;
  height: 100%;
  position: fixed;
  top: 10vh;
  left: 10vw;
  height: 80vh;
  width: 80vw;
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
</style>
