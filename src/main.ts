import Vue from 'vue';
import Vuex from 'vuex';
import App from './App.vue';
//@ts-ignore
import { unstub } from "@/App.vue";
import { QuizQuestion, QuizQuestionIndices } from "@/interfaces";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    databaseCountries: [],
    subregions: [],
    quizIndices: []
  },
  getters: {
    subregionCountries(state) {
      if (state.subregions.length === 0 || state.databaseCountries.length === 0) return [];
      const x = state.subregions.map((subregion) => {
        return {
          name: subregion.name,
          countries: subregion.values.map((country) => {
            let c = state.databaseCountries.find((c) => unstub(c.name) === country.name);

            // Try to get around "no reactivity if adding props" issue -- justuse vuex state
            // if (!c) {
            //   c = {
            //     isUnlocked: false,
            //     numAttempts: 0,
            //     numCorrect: 0,
            //     lastReviewed: false,
            //   };
            // }
            return Object.assign({}, country, c);
          }),
        };
      });
      // console.log("get...", x);

      return x;
    },
    quiz(state): QuizQuestion[] {
      // Just repeat code for getting subregion countries...Ugly
      if (state.subregions.length === 0 || state.databaseCountries.length === 0) return [];
      const subregionCountries = state.subregions.map((subregion) => {
        return {
          name: subregion.name,
          countries: subregion.values.map((country) => {
            let c = state.databaseCountries.find((c) => unstub(c.name) === country.name);
            return Object.assign({}, country, c);
          }),
        };
      });

      return state.quizIndices.map((quizIndices: QuizQuestionIndices) => {
        const subregion = subregionCountries.find(x => x.name === quizIndices.subregion);
        return {
          country: subregion.countries[quizIndices.countryIndex],
          answers: quizIndices.answerIndices.map(i => subregion.countries[i])
        }
      });
    }
  },
  mutations: {
    setDatabaseCountries(state, countries) {
      // console.log("set db", countries);
      state.databaseCountries = countries;
    },
    setSubregions(state, subregions) {
      // console.log("set sub", subregions);
      state.subregions = subregions;
    },
    setQuizIndices(state, questionIndices: QuizQuestionIndices[]) {
      state.quizIndices = questionIndices;
    }
  },
})

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  store
}).$mount('#app');
