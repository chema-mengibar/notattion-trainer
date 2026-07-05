<script>
import FileIcon from '../icons/FileIcon.vue';

const TRAINING_MODULES = import.meta.globEager('../../../services/trainings/*.js');
const TRAININGS = Object.entries(TRAINING_MODULES).map(([path, module]) => {
  const name = path.split('/').pop().replace('.js', '');
  return {
    name,
    label: name.replace(/-/g, ' '),
    data: module.default,
  };
});

export default {
  name: 'LoadTrainingButton',
  inject: ['$services'],
  components: { FileIcon },
  data: () => ({
    isOpen: false,
    selectedTraining: TRAININGS[0] ? TRAININGS[0].name : '',
    trainings: TRAININGS,
  }),
  computed: {
    trainer() {
      return this.$services.trainerService;
    },
  },
  methods: {
    open() {
      this.selectedTraining = this.selectedTraining || (this.trainings[0] && this.trainings[0].name) || '';
      this.isOpen = true;
    },
    load() {
      const training = this.trainings.find((item) => item.name === this.selectedTraining);
      if (!training) return;

      this.trainer.loadTraining(training.data);
      this.isOpen = false;
    },
  },
};
</script>

<template>
  <div class="load-training-cta">
    <button class="partition-cta icon-cta" type="button" aria-label="Load training" @click="open">
      <FileIcon />
    </button>

    <div v-if="isOpen" class="modal-backdrop">
      <section class="training-modal">
        <h1>Training</h1>
        <select v-model="selectedTraining">
          <option v-for="training in trainings" :key="training.name" :value="training.name">
            {{ training.label }}
          </option>
        </select>
        <div class="modal-actions">
          <button type="button" @click="isOpen = false">Cancel</button>
          <button type="button" class="primary" :disabled="!selectedTraining" @click="load">Load</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss">
.load-training-cta {
  display: contents;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.35);
}

.training-modal {
  width: min(420px, 100%);
  border-radius: 8px;
  background: #fff;
  padding: 22px;
}

.training-modal h1 {
  margin: 0 0 16px;
  font-size: 22px;
}

.training-modal select {
  width: 100%;
  min-height: 42px;
  border: 1px solid #a9a9a9;
  border-radius: 8px;
  padding: 0 10px;
  background: #fff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions button {
  min-width: 88px;
  min-height: 40px;
  border: 1px solid #b8b8b8;
  border-radius: 8px;
  background: #fff;
}

.modal-actions .primary {
  background: #2d6f77;
  color: #fff;
  border-color: #2d6f77;
}
</style>
