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

        quiz(state): QuizQuestion[] {
            if (state.subregions.length === 0 || state.databaseCountries.length === 0) return [];

            const pool = state.quizPool;

            return state.quizIndices.map((quizIndices: QuizQuestionIndices) => {
                return {
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
        }
    },
});

export { store };