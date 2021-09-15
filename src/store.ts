import Vuex from 'vuex';
import Vue from 'vue';

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
                        return Object.assign({}, country, c);
                    }),
                };
            });

            return x;
        },

        // TODO: must account for region-level quiizzes..
        // and likely more (level-based quizzes...)

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
});

export { store };