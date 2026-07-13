<script>
import SettingsButton from './cta/SettingsButton.vue';
import LoadTrainingButton from './cta/LoadTrainingButton.vue';
import PlayButton from './cta/PlayButton.vue';
import TempoModeButton from './cta/TempoModeButton.vue';
import VelocityButton from './cta/VelocityButton.vue';
import NoteLabelsButton from './cta/NoteLabelsButton.vue';
import FullScreenButton from './cta/FullScreenButton.vue';

export default {
  name: 'PartitionArea',
  inject: ['$services'],
  components: {
    SettingsButton,
    LoadTrainingButton,
    PlayButton,
    TempoModeButton,
    VelocityButton,
    NoteLabelsButton,
    FullScreenButton,
  },
  computed: {
    trainer() {
      return this.$services.trainerService;
    },
  },
  mounted() {
    this.trainer.mountRenderer(this.$refs.partitionsSvg);
  },
  beforeUnmount() {
    this.trainer.unmountRenderer();
  },
};
</script>

<template>
  <section class="partition-area">
    <div class="panel-left">
      <SettingsButton />
      <LoadTrainingButton />
      <FullScreenButton />
    </div>
    <div class="panel-center">
      <div class="partitions-wrapper">
        <svg id="partitions-wrapper-svg" ref="partitionsSvg"></svg>
      </div>
    </div>
    <div class="panel-right">
      <PlayButton />
      <div class="panel-spacer"></div>
      <TempoModeButton />
      <VelocityButton />
      <NoteLabelsButton />
    </div>
  </section>
</template>

<style lang="scss">
.partition-area {
  width: 100%;
  height: 50%;
  min-height: 0;
  display: flex;
  flex-direction: row;
  background: #fff;
}

.panel-left,
.panel-right {
  flex: 0 0 44px;
  padding: 10px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
}


.panel-spacer {
  flex: 1;
}

.panel-center {
  min-width: 0;
  flex: 1;
  display: flex;
}

.partitions-wrapper {
  width: 100%;
  height: 100%;
}

.cursor-rectangle-hit {
  fill: transparent;
}

.cursor-rectangle-hit[data-active="true"] {
  fill: url("#cursor-rectangle-active-gradient");
}

</style>
