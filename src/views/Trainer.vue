<script>

import Lesson from '../components/lesson.vue'
import Zoom from '../components/zoom.vue'

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
    Lesson,
    Zoom
  },
};
</script>

<style  lang="scss">
@import "../styles/media";

 .advice{
    z-index:100;
    display:none;
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height: 100vh;
    background-color: rgba(0,0,0,.8);
    color: white;
    font-size:24px;
    @media screen and (orientation:portrait) { 
      display:flex;
      justify-content: center;
      align-items: center;
    }
   }

.trainer-board{
  display:flex;
  flex-direction:row;
  justify-content: space-between;
  flex:1;
}

.left, .right{
  max-width:70px;
  flex:1;
  display:flex;
  align-items: center;
  justify-content: center;
  
  button{
    height:70%;
    width: 100%;
    background-color: rgb(223, 223, 223);
    border-radius: 8px;
    box-shadow: 0px 0px 7px 1px rgba(0,0,0,0.3);
  }
}

.left{
  button{
    border-top-left-radius: 40px;
    border-bottom-left-radius: 40px;
  }
}
.right{
  
  button{
    border-top-right-radius: 40px;
    border-bottom-right-radius: 40px;
  }
}

</style>

<template>
  <div class="wrapper">
    <Zoom />
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
  <div class="advice">rotate your device</div>
</template>