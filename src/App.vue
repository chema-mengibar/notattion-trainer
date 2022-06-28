<script>

 import Navigation from './components/navigation.vue'

export default {
  inject: ['$services'],
  data: ()=>( {
      t: {},
  }),
  created(){
    this.t = this.$services.localeService.D();
  },
  computed() {

  },
  components: {
 Navigation
  },
}

</script>

<style lang="scss">
 
@import "./App.scss";

</style>

<template>
    <Navigation />
    <router-view />

</template>