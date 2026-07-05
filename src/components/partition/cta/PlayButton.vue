<script>
import PlayIcon from '../icons/PlayIcon.vue';
import PauseIcon from '../icons/PauseIcon.vue';

export default {
  name: 'PlayButton',
  inject: ['$services'],
  components: { PlayIcon, PauseIcon },
  computed: {
    trainer() {
      return this.$services.trainerService;
    },
    isDisabled() {
      return this.$services.configService.settings.tempoMode === 'note';
    },
  },
  methods: {
    toggle() {
      if (this.isDisabled) return;
      this.trainer.toggle();
    },
  },
};
</script>

<template>
  <button
    class="partition-cta icon-cta"
    type="button"
    :aria-label="trainer.state.playing ? 'Pause' : 'Play'"
    :disabled="isDisabled"
    @click="toggle"
  >
    <PauseIcon v-if="trainer.state.playing" />
    <PlayIcon v-else />
  </button>
</template>
