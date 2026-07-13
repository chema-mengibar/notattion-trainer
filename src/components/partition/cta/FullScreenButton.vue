<script>
import FullScreenIcon from '../icons/FullScreenIcon.vue';

export default {
  name: 'FullScreenButton',
  components: { FullScreenIcon },
  methods: {
    openFullScreen() {
      const target = document.documentElement;
      const requestFullScreen = (
        target.requestFullscreen
        || target.webkitRequestFullscreen
        || target.msRequestFullscreen
      );

      if (requestFullScreen) {
        requestFullScreen.call(target);
      }
    },
  },
};
</script>

<template>
  <button
    class="partition-cta icon-cta"
    type="button"
    aria-label="Full screen"
    @click="openFullScreen"
  >
    <FullScreenIcon />
  </button>
</template>
