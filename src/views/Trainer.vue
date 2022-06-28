<script>

import Lesson from '../components/lesson.vue'

export default {
  name: "Trainer",
  inject: ["$services"],
  data: () => ({
    t: {},
    lastName: "",
  }),
  methods: {
    build(){
      this.$services.trainerService.build();
    },
    solve(){
      this.$services.trainerService.solve();
    }
  },
  created() {
    const _ = this;

    _.t = this.$services.localeService.D();

    
  },
  mounted() {
    document.body.style.overflow = "auto";
    this.build()
  },
  components: {
    Lesson
  },
};
</script>

<style  lang="scss">
@import "../styles/media";

.trainer-board{
  display:flex;
  flex-direction:row;

  flex:1;
}

.left, .right{
  max-width:50px;
  flex:1;
  display:flex;
  background-color: #777;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}


</style>

<template>
  <div class="wrapper">
    <div class="trainer-board">
      <div class="left">
        <button  @click="solve">Solve</button>
      </div>
      <div class="center">
        <Lesson />
      </div>
      <div class="right">
        <button  @click="build">Build</button>
      </div>
    </div>
  </div>
</template>