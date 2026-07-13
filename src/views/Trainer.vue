<script>
import PartitionArea from '../components/partition/PartitionArea.vue';
import PianoKeyboard from '../components/keyboard/PianoKeyboard.vue';

export default {
  name: 'Trainer',
  inject: ['$services'],
  components: {
    PartitionArea,
    PianoKeyboard,
  },
  computed: {
    trainer() {
      return this.$services.trainerService;
    },
  },
  mounted() {
    document.body.style.overflow = 'hidden';
  },
  beforeUnmount() {
    this.trainer.pause();
    document.body.style.overflow = 'auto';
  },
};
</script>

<template>
  <main class="trainer-view">
    <PartitionArea />
    <PianoKeyboard />
  </main>
</template>

<style lang="scss">
.trainer-view {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

</style>
