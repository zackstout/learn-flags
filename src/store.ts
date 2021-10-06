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
        quizIndices: [],
        quizPool: [],
        hoveredAlpha3: ""
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

        // TODO: must account for region-level quizzes..
        // and likely more (level-based quizzes...)

        quiz(state): QuizQuestion[] {
            // Just repeat code for getting subregion countries...Ugly
            if (state.subregions.length === 0 || state.databaseCountries.length === 0) return [];

            // TODO: can't this  take in getters, and use getters.subregionCountries???
            // const subregionCountries = state.subregions.map((subregion) => {
            //     return {
            //         name: subregion.name,
            //         countries: subregion.values.map((country) => {
            //             let c = state.databaseCountries.find((c) => unstub(c.name) === country.name);
            //             return Object.assign({}, country, c);
            //         }),
            //     };
            // });

            const pool = state.quizPool;

            return state.quizIndices.map((quizIndices: QuizQuestionIndices) => {
                // const subregion = subregionCountries.find(x => x.name === quizIndices.subregion);
                return {
                    // country: subregion.countries[quizIndices.countryIndex],
                    // answers: quizIndices.answerIndices.map(i => subregion.countries[i])
                    country: pool[quizIndices.countryIndex],
                    answers: quizIndices.answerIndices.map(i => pool[i])
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
        },
        setQuizPool(state, countries: any[]) {
            state.quizPool = countries;
        },
        setHoveredAlpha3(state, code: string) {
            state.hoveredAlpha3 = code;
            // console.log(code);
        }
    },
});

export { store };