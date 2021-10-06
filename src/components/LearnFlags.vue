<template>
  <div>
    <div class="modal"></div>
    <div class="modal-inner" ref="inner">
      <h1>New flags unlocked!</h1>

      <div>Flag {{ countryIndex + 1 }} of {{ countries.length }}</div>

      <div class="carets">
        <div class="caret" @click="decrement">&#12296;</div>
        <div class="caret" style="transform:rotate(180deg); margin-left:2rem;" @click="increment">&#12296;</div>
      </div>

      <div>
        <div style="font-weight:bold; text-align:center; font-size:4rem; margin-bottom:1rem;">
          {{ unstubInner(currentCountry.name) }}
        </div>

        <div class="country">
          <div style="font-size:3rem;">
            <div><span style="font-weight:bold;">Subregion:</span> {{ currentCountry.subregion }}</div>
            <div><span style="font-weight:bold;">Capital:</span> {{ currentCountry.capital }}</div>
            <div>
              <span style="font-weight:bold;">Area:</span> {{ numberWithCommas(currentCountry.area) }} mi<sup>2</sup>
            </div>
            <div><span style="font-weight:bold;">Borders:</span> {{ getBordersRender(currentCountry) }}</div>
            <div><span style="font-weight:bold;">Languages:</span> {{ getLanguagesRender(currentCountry) }}</div>

            <!-- <h5>Population: {{ numberWithCommas(currentCountry.population) }}</h5> -->
          </div>
          <div class="flag" :style="{ backgroundImage: getBgImage(currentCountry) }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { unstub } from "@/App.vue";
import { Getter } from "vuex-class";

interface Country {
  name: string;
  flag: string;
}

// TODO: Should be "take quiz" immediately from this view button.
// TODO: Should immediately mark all as "unlocked" once this mounts (or just before passing to this modal?)
// That way, when this modal closes, they will show up as unlocked.

@Component({
  components: {},
})
export default class LearnFlagsComponent extends Vue {
  @Prop({ default: true }) readonly flagFirst: boolean;
  @Prop() readonly countries: Country[];
  @Getter subregionCountries: any[];

  countryIndex = 0;

  unstubInner(x) {
    return x ? unstub(x) : "";
  }

  getBgImage(country) {
    return "url(" + require(`@/images/svg/${country.code3.toLowerCase()}.svg`) + ")";
  }

  mounted() {
    (this.$refs.inner as HTMLElement).addEventListener("mousedown", (ev: any) => ev.stopPropagation());

    // console.log("sub..", this.subregionCountries);
  }

  numberWithCommas(x) {
    return x && x.toString() ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
  }

  get currentCountry() {
    // console.log("curr....", this.countries);
    return this.countries.length > 0 ? this.countries[this.countryIndex] : {};
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
.country {
  display: flex;
  justify-content: space-around;
}

.flag {
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 50vw;
  height: 50vh;
  filter: drop-shadow(2px 2px 3px black);
  margin-left: 2rem;
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
