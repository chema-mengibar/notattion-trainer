<script>
const MIN_TEMPO_SECONDS = 2;
const MAX_TEMPO_SECONDS = 12;

export default {
  name: 'VelocityButton',
  inject: ['$services'],
  data: () => ({
    isOpen: false,
    draftVelocity: 4,
  }),
  computed: {
    settings() {
      return this.$services.configService.settings;
    },
    isDisabled() {
      return this.settings.tempoMode === 'note';
    },
    tempoLabel() {
      return Number(this.settings.tempoVelocity);
    },
  },
  methods: {
    normalizeTempo(value) {
      const numericValue = Number(value);

      if (Number.isNaN(numericValue)) return this.settings.tempoVelocity;

      return Math.min(MAX_TEMPO_SECONDS, Math.max(MIN_TEMPO_SECONDS, numericValue));
    },
    updateDraft(value) {
      this.draftVelocity = this.normalizeTempo(value);
    },
    open() {
      if (this.isDisabled) return;
      this.draftVelocity = this.normalizeTempo(this.settings.tempoVelocity);
      this.$services.trainerService.pause();
      this.isOpen = true;
    },
    save() {
      this.$services.trainerService.updateTempo(this.normalizeTempo(this.draftVelocity));
      this.isOpen = false;
    },
  },
};
</script>

<template>
  <div class="velocity-cta">
    <button
      class="partition-cta side-cta"
      type="button"
      aria-label="Tempo velocity"
      :disabled="isDisabled"
      @click="open"
    >
      <strong class="tempo-value">{{ tempoLabel }}</strong>
      <span>SEC.</span>
    </button>

    <div v-if="isOpen" class="modal-backdrop">
      <section class="tempo-modal">
        <h1>Tempo</h1>
        <div class="tempo-field">
          <label for="tempo-seconds">Seconds</label>
          <input
            id="tempo-seconds"
            type="number"
            min="2"
            max="12"
            step="1"
            :value="draftVelocity"
            @input="updateDraft($event.target.value)"
          />
        </div>
        <div class="tempo-range">
          <span>2</span>
          <input
            type="range"
            min="2"
            max="12"
            step="1"
            :value="draftVelocity"
            aria-label="Tempo seconds"
            @input="updateDraft($event.target.value)"
          />
          <span>12</span>
        </div>
        <div class="modal-actions">
          <button type="button" @click="isOpen = false">Cancel</button>
          <button type="button" class="primary" @click="save">Save</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss">
.velocity-cta {
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

.tempo-modal {
  width: min(420px, 100%);
  border-radius: 8px;
  background: #fff;
  padding: 22px;
}

.tempo-modal h1 {
  margin: 0 0 16px;
  font-size: 22px;
}

.tempo-value {
  min-width: 22px;
  text-align: center;
  font-size: 18px;
}

.tempo-field {
  display: grid;
  gap: 8px;
}

.tempo-field label {
  font-size: 14px;
  font-weight: 700;
}

.tempo-field input {
  min-height: 44px;
  border: 1px solid #a9a9a9;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 18px;
}

.tempo-range {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  font-size: 13px;
  font-weight: 700;
}

.tempo-range input {
  width: 100%;
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
  background: var(--button-color-rgb);
  color: #fff;
  border-color: var(--button-color-rgb);
}
</style>
