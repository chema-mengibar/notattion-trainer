<script>
import BaseAppIcon from './BaseAppIcon.vue';

export default {
  name: 'PlayIcon',
  components: { BaseAppIcon },
};
</script>

<template>
  <BaseAppIcon label="Play">
    <rect width="24" height="24" fill="white" />
    <path d="M6.46655 1.89064L19.8837 10.09C20.5359 10.5093 20.9552 11.2547 20.9552 12.0001C20.9552 12.7921 20.5359 13.5375 19.8837 13.9102L6.46655 22.1095C5.76774 22.5288 4.88258 22.5754 4.18377 22.1561C3.48496 21.7834 3.06567 21.038 3.06567 20.1994V3.80071C3.06567 3.00873 3.48496 2.26333 4.18377 1.89064C4.88258 1.47135 5.76774 1.47135 6.46655 1.89064Z" stroke="black" stroke-width="2" />
  </BaseAppIcon>
</template>
