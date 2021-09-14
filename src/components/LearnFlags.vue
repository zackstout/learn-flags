<template>
  <div class="learn">
    <h1>New flags unlocked!</h1>

    <div>Flag {{ countryIndex + 1 }} of {{ countries.length }}</div>

    <div class="carets">
      <div class="caret" @click="decrement">&#12296;</div>
      <div class="caret" style="transform:rotate(180deg); margin-left:2rem;" @click="increment">&#12296;</div>
    </div>

    <div class="country">
      <div>
        <h1>{{ currentCountry.name }}</h1>
        <h4>Region: {{ currentCountry.region }}</h4>
        <h5>Subregion: {{ currentCountry.subregion }}</h5>
        <h5>Capital: {{ currentCountry.capital }}</h5>
        <h5>Population: {{ numberWithCommas(currentCountry.population) }}</h5>
      </div>
      <div class="flag" :style="{ backgroundImage: 'url(' + currentCountry.flag + ')' }"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

interface Country {
  name: string;
  flag: string;
}

// TODO: Should be "take quiz" immediately from this view button.

@Component({
  components: {},
})
export default class LearnFlagsComponent extends Vue {
  @Prop({ default: true }) readonly flagFirst: boolean;
  @Prop() readonly countries: Country[];

  countryIndex = 0;

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  get currentCountry() {
    // console.log("curr....", this.countries);
    return this.countries ? this.countries[this.countryIndex] : {};
  }

  increment() {
    if (this.countryIndex === this.countries.length - 1) {
      this.countryIndex = 0;
    } else {
      this.countryIndex += 1;
    }
  }

  decrement() {
    if (this.countryIndex === 0) {
      this.countryIndex = this.countries.length - 1;
    } else {
      this.countryIndex -= 1;
    }
  }
}
</script>

<style scoped>
.country {
  display: flex;
  justify-content: space-around;
}

.flag {
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 60vw;
  height: 50vh;
}

.carets {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  user-select: none;
}

.caret {
  cursor: pointer;
  padding: 1rem;
  text-align: center;
}
.caret:hover {
  background: gray;
  color: white;
}
</style>
