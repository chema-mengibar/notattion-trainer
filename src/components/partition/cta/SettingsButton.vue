<script>
import GearIcon from '../icons/GearIcon.vue';

export default {
  name: 'SettingsButton',
  components: { GearIcon },
  methods: {
    openSettings() {
      this.$router.push({ name: 'Settings' });
    },
  },
};
</script>

<template>
  <button class="partition-cta icon-cta" type="button" aria-label="Settings" @click="openSettings">
    <GearIcon />
  </button>
</template>

<style lang="scss">
.partition-cta {
  width: 42px;
  height: 42px;
  border: 0;
  background: transparent;
  color: #1f1f1f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding: 0;
}

.side-cta {
  width: 42px;
  min-height: 36px;
  display: grid;
  justify-items: center;
  gap: 2px;
  color: #111;
  text-transform: uppercase;
  font-size: 8px;
  line-height: 1;
}

.partition-cta:disabled {
  opacity: 0.35;
  cursor: default;
  pointer-events: none;
}
</style>
