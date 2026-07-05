<script>
import ScaleArmaturePreview from '../components/partition/ScaleArmaturePreview.vue';

export default {
  name: 'Settings',
  inject: ['$services'],
  components: { ScaleArmaturePreview },
  computed: {
    settings() {
      return this.$services.configService.settings;
    },
    scales() {
      return this.$services.configService.scales;
    },
    selectedScale() {
      return this.$services.configService.selectedScale;
    },
    scaleLabelKey() {
      return this.settings.scaleType === 'american' ? 'american' : 'latin';
    },
  },
  methods: {
    update(patch) {
      this.$services.configService.update(patch);
      this.$services.trainerService.generate();
    },
    save() {
      this.$router.push({ name: 'Trainer' });
    },
  },
};
</script>

<template>
  <main class="settings-view">
    <header class="settings-header">
      <router-link class="back-button" :to="{ name: 'Trainer' }" aria-label="Back">‹</router-link>
      <h1>Settings</h1>
      <button class="save-button" type="button" @click="save">Save</button>
    </header>

    <section class="settings-panel">
      <div class="field">
        <label>Hands</label>
        <div class="segmented-control">
          <button type="button" :class="{ active: settings.hands === 1 }" @click="update({ hands: 1, clef: 'sol' })">1</button>
          <button type="button" :class="{ active: settings.hands === 2 }" @click="update({ hands: 2, clef: 'sol_fa' })">2</button>
        </div>
      </div>

      <div class="field" :class="{ disabled: settings.hands === 2 }">
        <label>Hand clef</label>
        <div class="segmented-control">
          <button type="button" :disabled="settings.hands === 2" :class="{ active: settings.clef === 'sol' }" @click="update({ clef: 'sol' })">Treble</button>
          <button type="button" :disabled="settings.hands === 2" :class="{ active: settings.clef === 'fa' }" @click="update({ clef: 'fa' })">Bass</button>
        </div>
      </div>

      <div class="field">
        <label>Scale type</label>
        <div class="segmented-control">
          <button type="button" :class="{ active: settings.scaleType === 'american' }" @click="update({ scaleType: 'american' })">Anglo-American</button>
          <button type="button" :class="{ active: settings.scaleType === 'latin' }" @click="update({ scaleType: 'latin' })">Sol-fa</button>
        </div>
      </div>

      <div class="field">
        <label for="scale">Scale</label>
        <select id="scale" :value="settings.scale" @change="update({ scale: $event.target.value })">
          <option v-for="scale in scales" :key="scale.value" :value="scale.value">{{ scale[scaleLabelKey] }}</option>
        </select>
        <div class="scale-preview">
          <div class="scale-preview-header">
            <span>{{ selectedScale[scaleLabelKey] }}</span>
            <span>{{ selectedScale.accidental ? `${selectedScale.count} ${selectedScale.accidental}${selectedScale.count > 1 ? 's' : ''}` : 'No accidentals' }}</span>
          </div>
          <ScaleArmaturePreview :settings="settings" />
        </div>
      </div>

      <div class="field">
        <label>Notes per time</label>
        <div class="segmented-control">
          <button v-for="value in [1, 2, 3]" :key="value" type="button" :class="{ active: settings.notesPerTime === value }" @click="update({ notesPerTime: value })">{{ value }}</button>
        </div>
      </div>

      <label class="checkbox-field" :class="{ disabled: settings.notesPerTime === 1 }">
        <input
          type="checkbox"
          :checked="settings.randomNotesPerTime"
          :disabled="settings.notesPerTime === 1"
          @change="update({ randomNotesPerTime: $event.target.checked })"
        />
        Random max notes per time
      </label>

      <div class="field">
        <label>Keyboard range</label>
        <select :value="settings.keyboardRange" @change="update({ keyboardRange: $event.target.value })">
          <option value="basic">Basic</option>
          <option value="medium">Medium</option>
          <option value="full">Full</option>
        </select>
      </div>

      <div class="field">
        <label>Tempo mode</label>
        <div class="segmented-control">
          <button type="button" :class="{ active: settings.tempoMode === 'seconds' }" @click="update({ tempoMode: 'seconds' })">Seconds</button>
          <button type="button" :class="{ active: settings.tempoMode === 'note' }" @click="update({ tempoMode: 'note' })">Note</button>
        </div>
      </div>
    </section>
  </main>
</template>

<style lang="scss">
.settings-view {
  min-height: 100vh;
  background: #eef0ed;
  color: #202020;
  padding: 14px;
}

.settings-header {
  display: grid;
  grid-template-columns: 48px 1fr 86px;
  align-items: center;
  max-width: 820px;
  margin: 0 auto 14px;
}

.settings-header h1 {
  margin: 0;
  font-size: 24px;
  text-align: center;
}

.back-button,
.save-button {
  min-height: 42px;
  border: 1px solid #b8b8b8;
  border-radius: 8px;
  background: #fff;
  color: #202020;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 24px;
}

.save-button {
  font-size: 14px;
  background: #2d6f77;
  color: #fff;
  border-color: #2d6f77;
}

.settings-panel {
  max-width: 820px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 8px;
}

.field label,
.checkbox-field {
  font-size: 14px;
  font-weight: 700;
}

.segmented-control {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  border: 1px solid #b6b6b6;
  border-radius: 8px;
  overflow: hidden;
}

.segmented-control button {
  min-height: 44px;
  border: 0;
  background: #fff;
}

.segmented-control button + button {
  border-left: 1px solid #b6b6b6;
}

.segmented-control .active {
  background: #2d6f77;
  color: #fff;
}

select {
  min-height: 44px;
  border: 1px solid #b6b6b6;
  border-radius: 8px;
  background: #fff;
  padding: 0 12px;
}

.scale-preview {
  min-height: 138px;
  border: 1px solid #cfc7b7;
  border-radius: 8px;
  background: #f7f3ea;
  display: grid;
  gap: 8px;
  padding: 0 16px;
  font-size: 14px;
  overflow: hidden;
}

.scale-preview-header {
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-field {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-field input {
  width: 22px;
  height: 22px;
}

.disabled {
  opacity: 0.55;
}
</style>
