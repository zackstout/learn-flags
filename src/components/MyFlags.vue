<template>
  <div>
    <div v-for="region in subregionCountries" :key="region.name" class="region">
      <div>{{ region.name }}</div>
      <h4>Total: {{ region.countries.length }}</h4>

      <div class="countries-container">
        <div v-for="country in region.countries" :key="country.name">
          <div>{{ country.name }}</div>
          <div>{{ country.capital }}</div>
          <div>{{ country.population }}</div>
          <div>{{ country.alpha3Code }}</div>

          <div
            :style="{
              backgroundImage: 'url(' + country.flag + ')',
              backgroundColor: 'gray',
              width: '300px',
              height: '200px',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  components: {},
})
export default class LearnFlagsComponent extends Vue {
  @Prop() readonly subregionCountries: any[];
}
</script>

<style scoped></style>
