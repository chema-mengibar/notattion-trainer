<script>
import EyeIcon from '../icons/EyeIcon.vue';

export default {
  name: 'NoteLabelsButton',
  inject: ['$services'],
  components: { EyeIcon },
  computed: {
    trainer() {
      return this.$services.trainerService;
    },
    label() {
      return this.trainer.state.showNoteLabels ? 'NOTES' : 'OFF';
    },
  },
};
</script>

<template>
  <button
    class="partition-cta side-cta"
    type="button"
    aria-label="Note labels"
    @click="trainer.toggleNoteLabels"
  >
    <EyeIcon />
    <span>{{ label }}</span>
  </button>
</template>
