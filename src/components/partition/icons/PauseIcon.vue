<script>
import BaseAppIcon from './BaseAppIcon.vue';

export default {
  name: 'PauseIcon',
  components: { BaseAppIcon },
};
</script>

<template>
  <BaseAppIcon label="Pause">
    <rect width="24" height="24" fill="white" />
    <path d="M5.84172 1.552H7.59052C9.01143 1.552 10.2137 2.75431 10.2137 4.17521V19.9145C10.2137 21.39 9.01143 22.5377 7.59052 22.5377H5.84172C4.36616 22.5377 3.21851 21.39 3.21851 19.9145V4.17521C3.21851 2.75431 4.36616 1.552 5.84172 1.552ZM16.3346 1.552H18.0834C19.5043 1.552 20.7066 2.75431 20.7066 4.17521V19.9145C20.7066 21.39 19.5043 22.5377 18.0834 22.5377H16.3346C14.859 22.5377 13.7114 21.39 13.7114 19.9145V4.17521C13.7114 2.75431 14.859 1.552 16.3346 1.552Z" stroke="black" stroke-width="2" />
  </BaseAppIcon>
</template>
