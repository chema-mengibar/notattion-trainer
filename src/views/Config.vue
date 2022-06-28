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


.tool{
  margin-top: 20px;

  .tool-name{
    margin-bottom: 5px;
  }

  button{
    width: 120px;
    height: 40px;
    background-color: grey;
    border: 1px solid #333;

    &.active{
      background-color: orange;

    }
    
  }

  button + button {
      margin-left: 10px;
    }
}


</style>

<template>
  <div class="wrapper">
      Config

    <div class="tool">
      <div class="tool-name">Clave:</div>
      <button :class="{ active: $services.trainerService.config.clave === 'fa'}" @click="$services.trainerService.configClave = 'fa'">FA</button>
      <button :class="{ active: $services.trainerService.config.clave === 'sol'}" @click="$services.trainerService.configClave = 'sol'">SOL</button>
    </div>

    <div class="tool">
      <div class="tool-name">Alteracion:</div>
      <button :class="{ active: $services.trainerService.config.armadura === null}" @click="$services.trainerService.configArmadura = null">no</button>
      <button :class="{ active: $services.trainerService.config.armadura === 'sostenido'}" @click="$services.trainerService.configArmadura = 'sostenido'">sostenido</button>
      <button :class="{ active: $services.trainerService.config.armadura === 'bemol'}" @click="$services.trainerService.configArmadura = 'bemol'">bemol</button>
    </div>

    <div class="tool">  
      <div class="tool-name">Num Alteraciones:</div>
      <button :class="{ active: $services.trainerService.config.alt === 1}" @click="$services.trainerService.configAlteraciones = 1">1</button>
      <button :class="{ active: $services.trainerService.config.alt === 2}" @click="$services.trainerService.configAlteraciones = 2">2</button>
      <button :class="{ active: $services.trainerService.config.alt === 3}" @click="$services.trainerService.configAlteraciones = 3">3</button>
      <button :class="{ active: $services.trainerService.config.alt === 4}" @click="$services.trainerService.configAlteraciones = 4">4</button>
    </div>

    <div class="tool">
      <div class="tool-name">Max notas:</div>
      <button :class="{ active: $services.trainerService.config.notes === 1}" @click="$services.trainerService.configMaxNotes = 1">1</button>
      <button :class="{ active: $services.trainerService.config.notes === 2}" @click="$services.trainerService.configMaxNotes = 2">2</button>
      <button :class="{ active: $services.trainerService.config.notes === 3}" @click="$services.trainerService.configMaxNotes = 3">3</button>
    </div>

  </div>
</template>