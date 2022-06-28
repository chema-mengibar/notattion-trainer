<script>


export default {
  inject: ['$services'],
  name: 'Navigation',
  methods: {
    switchMenu(){
      this.isOpen = !this.isOpen
    }
  },
  data: ()=>( {
    t: {},
    isOpen: false
  }),
  created(){
    this.t = this.$services.localeService.D()
  },
}
</script>

<style lang="scss">

@import '../styles/media';

.navigation{
  position:absolute;
  top:0;
  left:0;
  z-index:1;

  width: 50px;
  height: 50px;
  overflow:hidden;

  border-bottom-right-radius: 50px;

  display:flex;
  flex-direction:column;
  justify-content: space-evenly;
  align-items:center;
  padding:0;
  cursor:pointer;

   
  background-color: #6097ff;

  &.isOpen{
    
    height:100%;
    width: 200px;
    padding:50px 15px;
    border-bottom-right-radius: 0;

    .menu_link{
      display:block;
    }
  }

  &:not(.isOpen){
    .menu_link{
      display:none;
    }

    
  }

}

.label{
  display: none;
  margin-left: -15px;
  margin-top: -10px;
  color: white;
  font-size: 14px;
  letter-spacing: 2px;
  &.isOpen{
    display: block;
  }
}

.menu_link{
  &:link,
  &:visited,
  &:hover,
  &:active {
    color:white;
    text-decoration:none;
    cursor: pointer;
  }
}


</style>

<template>
<div class="navigation"
 :data-cy="$options.name" 
 :class="{ isOpen: isOpen,  }"
 @click="switchMenu">

      <span class="label" :class="{ isOpen: !isOpen,  }">...</span>
      <router-link  :to="{name:'Home'}" alt="home"  class="menu_link">Home</router-link>
      <router-link  :to="{name:'Trainer'}" alt="trainer"  class="menu_link">Trainer</router-link>
      <router-link :to="{name:'Config'}" alt="config"  class="menu_link">Config</router-link>

</div>
  
</template>