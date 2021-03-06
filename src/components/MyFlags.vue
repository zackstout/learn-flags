<template>
  <div style="font-size:1rem; padding:2rem; position:relative;">
    <div class="details-toggle">
      <div style="display:flex;">
        <div>Show details:</div>
        <input type="checkbox" v-model="showDetails" />
      </div>
      <div style="display:flex;">
        <div>Show names:</div>
        <input type="checkbox" v-model="showNames" />
      </div>
      <div style="display:flex;">
        <div>Flag size:</div>
        <input type="range" min="5" max="25" v-model="flagSize" />
      </div>
    </div>

    <div v-for="region in regions" :key="region.name" class="region" :id="stubInner(region.name)">
      <div style="font-size:3.5rem; font-weight:bold;">{{ region.name }}</div>

      <button @click="takeQuiz(region.name)" style="width:8rem; background:purple;">
        Review Region
      </button>

      <div
        :id="stubInner(subregion)"
        v-for="subregion in sortSubregions(region.subregions)"
        :key="subregion"
        class="subregion"
      >
        <div style="font-size:2.3rem; font-weight:bold;">{{ subregion }}</div>

        <div v-if="getUnlockedCountries(subregion).length > 0">
          <div style="display:flex; flex-direction:column;">
            <div style="display:flex;align-items:center">
              <span style="margin-right:0.5rem;">
                Total unlocked: {{ totalUnlocked(subregion) }} / {{ getCountries(subregion).length }}
              </span>
              <span v-if="!hasLockedCountries(subregion)"
                ><svg height="25" width="23" fill="gold" data-rating="1">
                  <polygon
                    points="9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78"
                    style="fill-rule:nonzero;"
                  /></svg
              ></span>
            </div>

            <div>Total reviews: {{ numSuccesses(getCountries(subregion)) }} / {{ totalReviews(subregion) }}</div>

            <div style="display:flex; align-items:center;" v-if="hasLockedCountries(subregion)">
              <button
                :disabled="unlockFlagsDisabled(subregion).value"
                @click="unlockFlags(subregion)"
                style="background-color: rgb(59, 130, 246); width:8rem; margin: 0.5rem 0;"
              >
                Unlock Flags
              </button>
              <div style="color:gray; margin-left:1rem; font-style:italic;">
                {{ unlockFlagsDisabled(subregion).message }}
              </div>
            </div>

            <button @click="takeQuiz(subregion)" style="width:8rem; margin: 0.5rem 0 2rem 0;">
              Review
            </button>
          </div>

          <div class="countries-container">
            <div
              v-for="country in sortCountries(getCountries(subregion))"
              :key="country.name"
              class="country"
              @mouseover="setHoveredAlpha3(country.alpha3Code)"
              @mouseleave="setHoveredAlpha3('')"
            >
              <div v-if="showNames" style="font-weight:bold; font-size:1.2rem; max-width:10rem;">
                {{ unstubInner(country.name) }}
              </div>
              <div v-if="showDetails">
                <div>
                  <div v-if="country.isUnlocked">
                    <span style="font-weight:bold;">Capital:</span>&emsp;<span>{{ country.capital }}</span>
                  </div>
                  <div v-else>???</div>
                </div>

                <!-- <div>
                <div v-if="country.isUnlocked">
                  <span style="font-weight:bold;">Population:</span>&emsp;<span>{{
                    numberWithCommas(country.population)
                  }}</span>
                </div>
                <div v-else>???</div>
              </div> -->

                <!-- <div>
                <div v-if="country.isUnlocked">
                  <span style="font-weight:bold;">Alpha3:</span>&emsp;<span>{{ country.code3 }}</span>
                </div>
                <div v-else>???</div>
              </div> -->

                <div>
                  <div v-if="country.isUnlocked">
                    <span style="font-weight:bold;">Language:</span>&emsp;<span>{{ getLanguagesRender(country) }}</span>
                  </div>
                  <div v-else>???</div>
                </div>

                <div>
                  <div v-if="country.isUnlocked" style="">
                    <span style="font-weight:bold;">Neighbors:</span>&emsp;<span>{{ getBordersRender(country) }}</span>
                  </div>
                  <div v-else>???</div>
                </div>

                <div>
                  <div v-if="country.isUnlocked">
                    <span style="font-weight:bold;">Score:</span>&emsp;<span
                      >{{ country.numCorrect }} / {{ country.numAttempts }}</span
                    >
                  </div>
                  <div v-else>???</div>
                </div>
              </div>

              <div
                class="flag-img"
                :style="{
                  backgroundImage: country.isUnlocked ? getBgImage(country) : '',
                  width: flagSize + 'vw',
                  height: flagSize + 'vh',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  marginTop: '10px',
                  backgroundColor: country.isUnlocked ? '' : 'gray',
                }"
              ></div>
            </div>
          </div>

          <!-- <div>
            <svg width="600" height="400">
              <path
                v-for="(geom, i) in allGeoms"
                :key="i"
                :d="getPath(geom, subregion).d"
                :fill="getPath(geom, subregion).fill"
              />
            </svg>
          </div> -->
        </div>
        <div v-else>
          <!-- <span>Subregion locked.</span> -->

          <div v-if="unlockSubregionDisabled(subregion)" style="font-style:italic; color:gray; ">
            You must complete all open subregions in this region to unlock another.
          </div>
          <button
            :disabled="unlockSubregionDisabled(subregion)"
            style="margin-left:1rem; background-color:darkorange; margin:0.5rem 0;"
            @click="unlockFlags(subregion)"
          >
            Unlock subregion
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { getRandom, unstub, stub } from "@/App.vue";
import { ref, set } from "firebase/database";
import { Getter, Mutation, State } from "vuex-class";
import { Country, QuizQuestionIndices } from "@/interfaces";
import * as d3 from "d3";

const fillWithRandomIndices = (arr, targetLen, poolLen, cannotInclude?) => {
  while (arr.length < targetLen) {
    const r = getRandom(0, poolLen);
    if (!arr.includes(r) && (cannotInclude ? r !== cannotInclude : true)) {
      arr.push(r);
    }
  }
};

const generateQuizIndices = (pool: any[], maxNum: number, pickedIndices = []): QuizQuestionIndices[] => {
  const unlockedCountries = pool.filter((c) => c.isUnlocked);

  let indices = [];
  if (pickedIndices.length > 0) {
    indices = pickedIndices;
  } else {
    const targetLen = Math.min(unlockedCountries.length, maxNum);
    fillWithRandomIndices(indices, targetLen, unlockedCountries.length);
  }

  const result = indices.map((i, j) => {
    let wrongAnswerIndices = [i];

    if (unlockedCountries.length < 4) {
      wrongAnswerIndices = indices.slice(0);
      //   wrongAnswerIndices.splice(j, 1);
    } else {
      // huh...not sure why was passing 3 as tgt length...
      fillWithRandomIndices(wrongAnswerIndices, 4, unlockedCountries.length, i);
    }

    const answerIndices = wrongAnswerIndices.map((i) => {
      const country = unlockedCountries[i];
      return pool.findIndex((x) => x.name === country.name);
    });

    const c = unlockedCountries[i];
    const countryIndex = pool.findIndex((x) => x.name === c.name);

    return {
      countryIndex: countryIndex,
      answerIndices: answerIndices,
      subregion: c.subregion,
    };

    // TODO: scramble them
  });

  return result;
};

export const REGIONS = [
  {
    name: "Asia",
    subregions: ["Central Asia", "Western Asia", "South-Eastern Asia", "Eastern Asia", "Southern Asia"],
  },
  {
    name: "Europe",
    subregions: ["Western Europe", "Northern Europe", "Eastern Europe", "Southern Europe"],
  },
  {
    name: "Americas",
    subregions: ["Caribbean", "Central America", "South America", "North America"],
  },
  {
    name: "Africa",
    subregions: ["Middle Africa", "Western Africa", "Northern Africa", "Eastern Africa", "Southern Africa"],
  },
  {
    name: "Oceania",
    subregions: ["Australia and New Zealand", "Micronesia", "Melanesia", "Polynesia", ""],
  },
];

// Definitely tinker -- a lot of subregions have less than 15 flags
const UNLOCK_COUNTRIES_RULES = {
  NUMBER_REVIEWS: [0, 6, 15, 25, 40, 60, 80, 100, 120, 160, 200],
  LEVEL_OF_COMPETENCE: [0, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6],
};

export const NEW_FLAGS_AMOUNT = 3;

@Component({
  components: {},
})
export default class MyFlagsComponent extends Vue {
  @Getter subregionCountries: any[];
  @Prop() db: any;
  @Mutation setQuizIndices: (indices: QuizQuestionIndices[]) => void;
  @Mutation setQuizPool: (countries: any[]) => void;

  @Mutation setHoveredAlpha3: (x: string) => void;
  @State hoveredAlpha3: string;

  showDetails = true;
  showNames = true;
  flagSize = 10;

  regions = REGIONS;
  countriesForMap = [];

  worldMapData = null;

  get allGeoms() {
    if (!this.worldMapData) return [];
    // @ts-ignore
    return topojson.object(this.worldMapData, this.worldMapData.objects.countries).geometries;
  }

  getBgImage(country) {
    return "url(" + require(`@/images/svg/${country.code3.toLowerCase()}.svg`) + ")";
  }

  mounted() {
    d3.json("countriesForMap.json").then((data) => {
      // console.log("all countries", data);
      this.countriesForMap = data;
    });

    d3.json("world-110m2.json").then((data) => {
      this.worldMapData = data;
      console.log("world map data", data);
    });
  }

  numberWithCommas(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  stubInner(x: string) {
    return stub(x);
  }

  unstubInner(x: string) {
    return unstub(x);
  }

  takeQuiz(region: string) {
    const pool = this.getCountries(region);
    const quiz = generateQuizIndices(pool, 5);
    // console.log("new quiz", quiz);
    this.setQuizIndices(quiz);
    this.setQuizPool(pool);
  }

  unlockFlags(subregion: string) {
    // console.log("Unlock!", subregion);
    const lockedCountries = this.getCountries(subregion).filter((c) => !c.isUnlocked);
    let indices = [];
    if (lockedCountries.length < NEW_FLAGS_AMOUNT) {
      indices = lockedCountries.map((c, i) => i);
    } else {
      while (indices.length < NEW_FLAGS_AMOUNT) {
        const r = getRandom(0, lockedCountries.length);
        if (!indices.includes(r)) indices.push(r);
      }
    }
    const newFlags = indices.map((i) => lockedCountries[i]);

    newFlags.forEach((country) => {
      const info = {
        isUnlocked: true,
        lastReviewed: country.lastReviewed ?? "",
        numAttempts: country.numAttempts ?? 0,
        numCorrect: country.numCorrect ?? 0,
      };

      // THIS WORKED
      const name = stub(country.name);
      set(ref(this.db, `countries/${name}`), info);
    });

    this.$emit("newFlags", newFlags);
  }

  // ======================================================================
  // RULES/LOGIC FOR UNLOCKING FLAGS
  // ======================================================================

  // Should return a message  and a boolean  "value"
  // Message should be EITHER
  // (1) must review all within previous day (third)
  // (2) must review 75% to level X (second)
  // (3) must have X successful reviews (prob first)
  unlockFlagsDisabled(subregion: string) {
    const countries = this.getCountries(subregion);

    if (!this.hasEnoughSuccesses(countries)) {
      return {
        message: `You need ${this.numNeededSuccesses(
          countries
        )} successful reviews in this subregion. You have accrued a scanty ${this.numSuccesses(countries)}.`,
        value: true,
      };
    }
    if (!countries.every((c) => this.hasBeenReviewedWithinDay(c))) {
      return {
        message: "You need to review all of this subregion's countries within the last 24 hours.",
        value: true,
      };
    }
    if (!this.hasBeenReviewedToLevel(countries, this.levelNeeded(countries))) {
      return {
        message: `You need to review 75% of this subregion's countries to level ${this.levelNeeded(countries)}.`,
        value: true,
      };
    }

    return {
      message: "",
      value: false,
    };
  }

  // TODO
  hasBeenReviewedWithinDay(country) {
    return true;
  }

  getRuleIndex(countries) {
    const numUnlocked = countries.filter((c) => c.isUnlocked).length;
    const ruleIndex = Math.floor(numUnlocked / NEW_FLAGS_AMOUNT);
    return ruleIndex;
  }

  numNeededSuccesses(countries) {
    const ruleIndex = this.getRuleIndex(countries);
    return UNLOCK_COUNTRIES_RULES.NUMBER_REVIEWS[ruleIndex];
  }

  numSuccesses(countries) {
    return countries.reduce((acc, country) => acc + (country.numCorrect ?? 0), 0);
  }

  hasEnoughSuccesses(countries) {
    return this.numSuccesses(countries) >= this.numNeededSuccesses(countries);
  }

  levelNeeded(countries) {
    const ruleIndex = this.getRuleIndex(countries);
    return UNLOCK_COUNTRIES_RULES.LEVEL_OF_COMPETENCE[ruleIndex];
  }

  hasBeenReviewedToLevel(countries, level) {
    const total = countries.filter((c) => c.isUnlocked).length;
    const amountReviewedToLevel = countries.filter((c) => c.numCorrect >= level).length;
    // console.log(amountReviewedToLevel, total);
    return amountReviewedToLevel / total >= 0.75;
  }

  // ======================================================================

  // Only let user unlock new subregion in region
  // IF every subregion in the region that has any unlocked countries has ALL unlocked countries
  // How to determine whether they can start a new continent? Maybe just let them? That's current behavior
  // i.e. It's disabled if it's  not the case that every subregion in the region with some unlocked has every locked.
  // i.e. Disabled if there exists a subregion in the region with countries unlocked but Not All countries unlocked.
  unlockSubregionDisabled(subregion: string) {
    const region = REGIONS.find((r) => r.subregions.includes(subregion));
    return !region.subregions
      .map((subregion) => this.getCountries(subregion))
      .filter((countries) => countries.some((c) => c.isUnlocked))
      .every((countries) => countries.every((c) => c.isUnlocked));
  }

  getCountries(region: string) {
    if (this.subregionCountries.length === 0) return [];

    const regionFound = REGIONS.find((x) => x.name === region);
    if (regionFound) {
      // We actually have a REGION
      return (regionFound.subregions as string[]).reduce((acc, subregion) => {
        return acc.concat(this.getCountries(subregion));
      }, []);
    }

    return this.subregionCountries.find((c) => c.name === region).countries;
  }

  getUnlockedCountries(subregion: string) {
    return this.getCountries(subregion).filter((c) => c.isUnlocked);
  }

  hasLockedCountries(subregion: string) {
    return !this.getCountries(subregion).every((c) => c.isUnlocked);
  }

  // -[x] TODO: sort so that subregions with unlocked flags are always on top
  // No idea why this triggers infinite loop error...because no slice!
  sortSubregions(subregions) {
    return subregions.slice(0).sort((a, b) => {
      return this.getUnlockedCountries(b).length - this.getUnlockedCountries(a).length;
    });
  }

  sortCountries(countries) {
    return countries.slice(0).sort((a, b) => {
      return a.isUnlocked && b.isUnlocked ? 0 : a.isUnlocked ? -1 : 1;
    });
  }

  totalReviews(subregion: string) {
    const countries = this.getCountries(subregion);
    return countries.reduce((acc, country) => acc + (country.numAttempts ?? 0), 0);
  }

  totalUnlocked(subregion: string) {
    const countries = this.getCountries(subregion);
    return countries.filter((country) => country.isUnlocked).length;
  }

  // ================================

  get path() {
    // NOTE: only need once
    var projection = d3
      .geoMercator()
      .scale(80)
      .center([150, 35]);
    var path = d3.geoPath().projection(projection);
    return path;
  }

  getPath(geom: any, subregion: string) {
    const { id } = geom;

    const country = this.countriesForMap.find((c) => parseInt(c.uni) === id);
    const alpha3 = country ? country.iso3 : "";

    const countryData = this.subregionCountries
      .reduce((acc, val) => {
        return acc.concat(val.countries || []);
      }, [])
      .find((x) => x.alpha3Code === alpha3);

    let fill = "gray";

    if (countryData && countryData.subregion === subregion) {
      // console.log("this", this.hoveredAlpha3, "alp", alpha3);

      fill = "blue";
      if (countryData.isUnlocked) {
        fill = "gold";
      }

      // Kinda works, but is very slow:
      // if (this.hoveredAlpha3 === alpha3) {
      //   fill = "red";
      // }
    }

    return {
      fill,
      d: this.path(geom),
    };
  }

  get allCountries() {
    return this.subregionCountries.reduce((acc, val) => [...acc, ...val.countries], []);
  }

  getLanguagesRender(country) {
    return Object.values(country.languages).reduce((acc, val) => {
      return acc ? `${acc}, ${val}` : val;
    }, "");
  }

  getBordersRender(country) {
    if (country.borders.length === 0) return "None";
    return country.borders.reduce((acc, code) => {
      const c = this.allCountries.find((x) => x.code3 === code);
      return `${acc ? acc + " " : ""}${c.flag}`;
    }, "");
  }
}
</script>

<style scoped>
.region {
  padding-bottom: 4rem;
  border-bottom: 3px solid black;
}

.subregion {
  margin-left: 2rem;
  padding: 2rem 0;
}

.countries-container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  font-size: 0.8rem;
  margin-left: 2rem;
  /* flex-direction: column; */
}

.country {
  margin: 0 1rem 1rem 0;
  /* max-width: 15vw; */
  padding: 1rem;
  border-radius: 0.3rem;
}

.country:hover {
  background: rgba(180, 180, 180, 0.15);
}

.flag-img {
  /* opacity: 0.9; */
  filter: drop-shadow(2px 2px 3px black);
}

.flag-img:hover {
  opacity: 1;
}

.details-toggle {
  position: fixed;
  top: 0rem;
  right: 0rem;
  display: flex;
  flex-direction: column;
  background: rgb(240, 236, 236);
  padding: 1rem;
  border-radius: 0.5rem;
  z-index: 1000;
}
</style>
