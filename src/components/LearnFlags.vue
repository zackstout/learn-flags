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

      <div class="country">
        <div>
          <h1>{{ unstubInner(currentCountry.name) }}</h1>
          <h4>Region: {{ currentCountry.region }}</h4>
          <h5>Subregion: {{ currentCountry.subregion }}</h5>
          <h5>Capital: {{ currentCountry.capital }}</h5>
          <!-- <h5>Population: {{ numberWithCommas(currentCountry.population) }}</h5> -->
        </div>
        <div class="flag" :style="{ backgroundImage: getBgImage(currentCountry) }"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { unstub } from "@/App.vue";

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

  countryIndex = 0;

  unstubInner(x) {
    return x ? unstub(x) : "";
  }

  getBgImage(country) {
    return "url(" + require(`@/images/svg/${country.code3.toLowerCase()}.svg`) + ")";
  }

  mounted() {
    (this.$refs.inner as HTMLElement).addEventListener("mousedown", (ev: any) => ev.stopPropagation());
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
