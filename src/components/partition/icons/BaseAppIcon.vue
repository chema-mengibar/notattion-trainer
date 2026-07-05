<script>
export default {
  name: 'BaseAppIcon',
  props: {
    label: { type: String, required: true },
    size: { type: Number, default: 24 },
    viewBox: { type: String, default: '0 0 24 24' },
  },
};
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    :viewBox="viewBox"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    :aria-label="label"
  >
    <slot></slot>
  </svg>
</template>

<style lang="scss">
.app-icon {
  display: block;
  flex: 0 0 auto;
}
</style>
