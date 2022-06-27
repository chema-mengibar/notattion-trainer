<script>
export default {
  name: "Home",
  inject: ["$services"],
  data: () => ({
    t: {},
    lastName: "",
  }),
  methods: {},
  created() {
    const _ = this;

    _.t = this.$services.localeService.D();
  },
  mounted() {
    document.body.style.overflow = "auto";
  },
  components: {},
};
</script>

<style  lang="scss">
@import "../styles/media";


</style>

<template>
  <div class="wrapper">
      Config
  </div>
</template>