<script>


export default {
  inject: ['$services'],
  name: 'Zoom',
  methods: {
    plus(){
      
      this.zoom += 0.1
      if (this.zoom > 2) {
        this.zoom = 2
      }
      this.$services.trainerService.scale(this.zoom)
    },
    minus(){
      this.zoom -= 0.1
      if (this.zoom < 1) {
        this.zoom = 1
      }
      this.$services.trainerService.scale(this.zoom)
    }
  },
  data: ()=>( {
    t: {},
    zoom: 1,
    
  }),
  created(){
    this.t = this.$services.localeService.D()
  },
}
</script>

<style lang="scss">

@import '../styles/media';

.zoom{
  position:absolute;
  bottom:0;
  left:0;
  z-index:1;

  width: 50px;
  height: 100px;


  display:flex;
  flex-direction:column;
  justify-content: space-evenly;
  align-items:center;
  padding:0;


  button{
    width: 30px;
    height: 30px;
    background-color: rgb(223, 223, 223);
    border-radius: 8px;
    box-shadow: 0px 0px 7px 1px rgba(0,0,0,0.3);
  }

  

}



</style>

<template>
<div class="zoom"
 :data-cy="$options.name" 
>

      <button  @click="plus">+</button>
      <button  @click="minus">-</button>
    

</div>
  
</template>