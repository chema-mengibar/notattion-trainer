<script>
import TempoModeIcon from '../icons/TempoModeIcon.vue';

export default {
  name: 'TempoModeButton',
  inject: ['$services'],
  components: { TempoModeIcon },
  computed: {
    settings() {
      return this.$services.configService.settings;
    },
    label() {
      return this.settings.tempoMode === 'note' ? 'NOTES' : 'TIME';
    },
  },
  methods: {
    toggleMode() {
      this.$services.configService.update({
        tempoMode: this.settings.tempoMode === 'note' ? 'seconds' : 'note',
      });
    },
  },
};
</script>

<template>
  <button class="partition-cta side-cta" type="button" aria-label="Tempo mode" @click="toggleMode">
    <TempoModeIcon />
    <span>{{ label }}</span>
  </button>
</template>
