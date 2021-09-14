<template>
  <div>
    <div v-for="region in regions" :key="region.name" class="region">
      <h2>{{ region.name }}</h2>

      <div v-for="subregion in sortSubregions(region.subregions)" :key="subregion" class="subregion">
        <h3>{{ subregion }}</h3>

        <!-- <h4>Total: {{ subregion.countries.length }}</h4> -->

        <div v-if="getUnlockedCountries(subregion).length > 0">
          <div>
            <button :disabled="unlockFlagsDisabled(subregion).value" @click="unlockFlags(subregion)">
              Unlock flags
            </button>
            <div style="color:red;">{{ unlockFlagsDisabled(subregion).message }}</div>

            <button @click="takeQuiz(subregion)">
              Review
            </button>
          </div>

          <div class="countries-container">
            <div v-for="country in getCountries(subregion)" :key="country.name" class="country">
              <div style="font-weight:bold;">{{ unstubInner(country.name) }}</div>
              <div>{{ country.isUnlocked ? country.capital : "???" }}</div>
              <div>{{ country.isUnlocked ? numberWithCommas(country.population) : "???" }}</div>
              <div>{{ country.numCorrect }} / {{ country.numAttempts }}</div>
              <!-- <div>{{ country.isUnlocked ? country.alpha3Code : "???" }}</div> -->

              <div
                :style="{
                  backgroundImage: 'url(' + country.flag + ')',
                  backgroundColor: 'gray',
                  width: '300px',
                  height: '200px',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  opacity: country.isUnlocked ? '1' : '0.2', // or just gray out entirely? placeholder?
                }"
              ></div>
            </div>
          </div>
        </div>
        <div v-else>
          <span>Subregion locked.</span>
          <button
            :disabled="unlockSubregionDisabled(subregion)"
            style="margin-left:1rem;"
            @click="unlockSubregion(subregion)"
          >
            Unlock subregion
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { getRandom, unstub, stub } from "@/App.vue";
import { ref, set } from "firebase/database";

const generateQuiz = (pool: any[], maxNum: number, pickedIndices = []) => {
  let indices = [];
  if (pickedIndices.length > 0) {
    indices = pickedIndices;
  } else {
    const targetLen = Math.min(pool.length, maxNum);
    while (indices.length < targetLen) {
      const r = getRandom(0, pool.length);
      if (!indices.includes(r)) {
        indices.push(r);
      }
    }
  }

  const result = indices.map((i, j) => {
    const c = pool[i];
    const answers = [Object.assign({}, c, { isCorrect: true })];
    let wrongAnswerIndices = [];

    if (pool.length < 4) {
      wrongAnswerIndices = indices.slice(0);
      wrongAnswerIndices.splice(j, 1);
    } else {
      while (wrongAnswerIndices.length < 3) {
        const x = getRandom(0, pool.length);
        if (!wrongAnswerIndices.includes(x) && x !== i) {
          wrongAnswerIndices.push(x);
        }
      }
    }

    // add 3 wrong answers
    wrongAnswerIndices.forEach((k) => {
      const c = pool[k];
      const wrongAnswer = Object.assign({}, c, { isCorrect: false });
      answers.push(wrongAnswer);
    });

    return answers; // TODO: scramble them
  });

  return result;
};

const REGIONS = [
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
    subregions: ["Caribbean", "Central America", "South America", "Northern America"],
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

// Must have reviewed X number in past however long duration?

// Must NOT  have any that have  NOT been reviwed for some duration?

// You'll want to tinker with  this.....because MAIN GOAL FOR THIS APP
// is to ensure that I am forced to review things thoroughly before going on to grab more to learn.
// The POINT is gatekeeping and game-ifying the whole "unlocking new flags" process.
// FORCING review first.

// First element in NUMBER_REVIEWS means have 0-2 unlocked, need 0 successes
// Second means have 3-5 unlocked, need 6 successes to unlock more

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
  @Prop() readonly subregionCountries: any[];
  @Prop() db: any;
  regions = REGIONS;

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  unstubInner(x) {
    return unstub(x);
  }

  takeQuiz(subregion: string) {
    const unlockedCountries = this.getCountries(subregion).filter((c) => c.isUnlocked);
    const quiz = generateQuiz(unlockedCountries, 5);
    this.$emit("quizQuestions", quiz);
  }

  unlockSubregion(subregion: string) {
    this.unlockFlags(subregion);
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
        lastReviewed: country.lastReviewed,
        numAttempts: country.numAttempts,
        numCorrect: country.numCorrect,
      };

      // THIS WORKED
      const name = stub(country.name);
      set(ref(this.db, `countries/${name}`), info);
    });

    this.$emit("newFlags", newFlags);
  }

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
        )} successful reviews in this subregion. You have accrued ${this.numSuccesses(countries)}.`,
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
    return countries.reduce((acc, country) => acc + country.numCorrect, 0);
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

  // Only let user unlock new subregion in region
  // IF every subregion in the region that has any unlocked countries has ALL unlocked countries
  // How to determine whether they can start a new continent? Maybe just let them? That's current behavior
  unlockSubregionDisabled(subregion: string) {
    const region = REGIONS.find((r) => r.subregions.includes(subregion));
    return !region.subregions
      .map((subregion) => this.getCountries(subregion))
      .filter((countries) => countries.some((c) => c.isUnlocked))
      .every((countries) => countries.every((c) => c.isUnlocked));
  }

  getCountries(subregion: string) {
    if (this.subregionCountries.length === 0) return [];
    return this.subregionCountries.find((c) => c.name === subregion).countries;
  }

  getUnlockedCountries(subregion: string) {
    return this.getCountries(subregion).filter((c) => c.isUnlocked);
  }

  // -[x] TODO: sort so that subregions with unlocked flags are always on top
  // No idea why this triggers infinite loop error...because no slice!
  sortSubregions(subregions) {
    return subregions.slice(0).sort((a: any, b: any) => {
      return this.getUnlockedCountries(b).length - this.getUnlockedCountries(a).length;
    });
  }

  //   getMostRecentlyReviewedCountries() {}

  //   // Only need this for case user unlocks but doesn't review......which we do care about because we say "unlocked"
  //   getMostRecentlyUnlockedCountries() {}

  //   getCountriesWithMissesInSubregion(subregion: string) {
  //     // Good for populating quiz of "try again" flags
  //   }

  //   getTotalSuccessesInSubregion(subregion: string) {
  //     // Should sum how many times each country/flag in the subregion has been successfully reviewed
  //   }

  //   getTotalReviewsInSubregion(subregion: string) {
  //     // Should sum how many times each country/flag in the subregion has been reviewed
  //   }
}
</script>

<style scoped>
.subregion:hover {
  /* background: lightgray; */
}

.subregion {
  /* display: flex; */
}

.region {
  padding-bottom: 4rem;
  border-bottom: 3px solid black;
}

.countries-container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  /* flex-direction: column; */
}

.country {
  margin: 2rem;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
