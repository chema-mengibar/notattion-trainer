<script>
import TouchBigSymbol from './TouchBigSymbol.vue';
import TouchSmallSymbol from './TouchSmallSymbol.vue';

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 220;
const TOUCH_HEIGHT = 70;
const WHITE_KEY_TOP = 70;
const WHITE_KEY_HEIGHT = 140;
const BLACK_KEY_HEIGHT = 82;
const TOUCH_SYMBOL_WIDTH = 28;
const TOUCH_BIG_HEIGHT = 49;
const TOUCH_SMALL_HEIGHT = 28;
const KEYBOARD_GRID_SIZE = 33;

export default {
  name: 'PianoKeyboard',
  inject: ['$services'],
  components: { TouchBigSymbol, TouchSmallSymbol },
  data: () => ({
    viewBoxWidth: VIEWBOX_WIDTH,
    viewBoxHeight: VIEWBOX_HEIGHT,
    whiteKeyTop: WHITE_KEY_TOP,
    whiteKeyHeight: WHITE_KEY_HEIGHT,
    blackKeyHeight: BLACK_KEY_HEIGHT,
    pressedKeys: [],
  }),
  mounted() {
    window.addEventListener('pointerup', this.releaseAll);
    window.addEventListener('pointercancel', this.releaseAll);
  },
  beforeUnmount() {
    window.removeEventListener('pointerup', this.releaseAll);
    window.removeEventListener('pointercancel', this.releaseAll);
  },
  computed: {
    keys() {
      return this.$services.trainerService.visibleKeys();
    },
    trainer() {
      return this.$services.trainerService;
    },
    whiteKeyWidth() {
      return VIEWBOX_WIDTH / KEYBOARD_GRID_SIZE;
    },
    blackKeys() {
      return this.keys.filter((key) => key.blackKey);
    },
    coordinates() {
      return this.keys.map((key) => ({
        key,
        index: key.keyboardGridIdx,
        x: key.keyboardGridIdx * this.whiteKeyWidth,
        y: WHITE_KEY_TOP,
      }));
    },
  },
  methods: {
    touch(key, event) {
      this.pressKey(key.midi);
      this.trainer.pressKey(this.keyPayload(key, event));
    },
    pressKey(midi) {
      if (!this.pressedKeys.includes(midi)) {
        this.pressedKeys.push(midi);
      }
    },
    release(key) {
      this.pressedKeys = this.pressedKeys.filter((midi) => midi !== key.midi);
      this.trainer.releaseKey(key);
    },
    releaseAll() {
      this.pressedKeys = [];
      this.trainer.releaseKey();
    },
    keyPayload(key, event) {
      const dataset = event.currentTarget.dataset;
      return {
        keyId: dataset.key || key.keyId,
        uuid: dataset.uuid || key.uuid,
        midi: key.midi,
        alteration: dataset.alteration || '',
        solGridIdx: dataset.solGridIdx !== undefined ? dataset.solGridIdx : key.solGridIdx,
        faGridIdx: dataset.faGridIdx !== undefined ? dataset.faGridIdx : key.faGridIdx,
      };
    },
    whiteX(index) {
      return this.coordinates[index].x;
    },
    blackX(key) {
      return key.blackKey.keyboardGridIdx * this.whiteKeyWidth;
    },
    blackWidth() {
      return this.whiteKeyWidth * 0.64;
    },
    touchSymbolHeight(key) {
      return this.touchType(key) === 'circle' ? TOUCH_SMALL_HEIGHT : TOUCH_BIG_HEIGHT;
    },
    touchX(key) {
      return this.blackX(key) - TOUCH_SYMBOL_WIDTH / 2;
    },
    touchY(key) {
      return this.touchType(key) === 'circle'
        ? TOUCH_HEIGHT - TOUCH_SMALL_HEIGHT - 10
        : TOUCH_HEIGHT - TOUCH_BIG_HEIGHT - 6;
    },
    touchTransform(key) {
      return `translate(${this.touchX(key)} ${this.touchY(key)})`;
    },
    touchType(key) {
      const octaveIndex = key.blackKey.keyboardGridIdx % 7;
      return [1, 4].includes(octaveIndex) ? 'circle' : 'paddle';
    },
    touchCenterX(key) {
      return this.blackX(key);
    },
    touchCenterY(key) {
      return this.touchY(key) + this.touchSymbolHeight(key) / 2;
    },
    touchRadius() {
      return TOUCH_SYMBOL_WIDTH * 0.5;
    },
    whiteClass(key) {
      return {
        central: key.isCentralDo,
        pressed: this.pressedKeys.includes(key.midi),
      };
    },
    blackClass(key) {
      return {
        pressed: this.pressedKeys.includes(key.blackKey.midi),
      };
    },
    touchClass(key, index) {
      return {
        circle: this.touchType(key) === 'circle',
        paddle: this.touchType(key) === 'paddle',
        pressed: this.pressedKeys.includes(key.blackKey.midi),
      };
    },
  },
};
</script>

<template>
  <section class="keyboard-area">
    <svg
      class="keyboard-svg"
      :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      role="application"
      aria-label="Piano keyboard"
    >
      <rect data-type="keyboard-background" x="0" y="0" :width="viewBoxWidth" :height="viewBoxHeight" fill="#b6b6b6" />

      <g data-type="black-key-touch-layer">
        <g
          v-for="(key, index) in blackKeys"
          :key="`touch-${key.blackKey.midi}`"
          data-type="black-key-touch"
          :data-key="key.blackKey.keyId"
          :data-uuid="key.blackKey.uuid"
          :data-alteration="key.blackKey.alteration"
          :data-keyboard-grid-idx="key.blackKey.keyboardGridIdx"
          :data-sol-grid-idx="key.blackKey.solGridIdx"
          :data-fa-grid-idx="key.blackKey.faGridIdx"
          class="black-key-touch"
          :class="touchClass(key, index)"
          @pointerdown.prevent="touch(key.blackKey, $event)"
          @pointerup.prevent="release(key.blackKey)"
          @pointercancel.prevent="release(key.blackKey)"
        >
          <g :transform="touchTransform(key)">
            <TouchSmallSymbol v-if="touchType(key) === 'circle'" />
            <TouchBigSymbol v-else />
          </g>
          <circle
            data-type="black-key-touch-hit"
            class="black-key-touch-hit"
            :cx="touchCenterX(key)"
            :cy="touchCenterY(key)"
            :r="touchRadius()"
          />
        </g>
      </g>

      <g data-type="white-key-layer">
        <g
          v-for="(key, index) in keys"
          :key="key.midi"
          data-type="white-key"
          :data-key="key.keyId"
          :data-uuid="key.uuid"
          :data-alteration="key.alteration"
          :data-sol-grid-idx="key.solGridIdx"
          :data-fa-grid-idx="key.faGridIdx"
          class="white-key"
          :class="whiteClass(key)"
          :transform="`translate(${whiteX(index)} ${whiteKeyTop})`"
          @pointerdown.prevent="touch(key, $event)"
          @pointerup.prevent="release(key)"
          @pointercancel.prevent="release(key)"
        >
          <rect x="0.5" y="0.5" :width="whiteKeyWidth - 1" :height="whiteKeyHeight - 1" />
        </g>
      </g>

      <g data-type="black-key-layer">
        <g
          v-for="key in blackKeys"
          :key="key.blackKey.midi"
          data-type="black-key"
          :data-key="key.blackKey.keyId"
          :data-uuid="key.blackKey.uuid"
          :data-alteration="key.blackKey.alteration"
          :data-keyboard-grid-idx="key.blackKey.keyboardGridIdx"
          :data-sol-grid-idx="key.blackKey.solGridIdx"
          :data-fa-grid-idx="key.blackKey.faGridIdx"
          class="black-key"
          :class="blackClass(key)"
          :transform="`translate(${blackX(key) - blackWidth() / 2} ${whiteKeyTop})`"
          pointer-events="none"
        >
          <rect x="0" y="0" :width="blackWidth()" :height="blackKeyHeight" />
        </g>
      </g>
    </svg>
  </section>
</template>

<style lang="scss">
.keyboard-area {
  width: 100%;
  height: 50%;
  min-height: 0;
  background: #b6b6b6;
  overflow: hidden;
  touch-action: none;
}

.keyboard-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.black-key-touch {
  cursor: pointer;
  color: #dedede;
}

.black-key-touch .touch-symbol {
  width: 100%;
  height: auto;
  display: block;
}

.black-key-touch .touch-symbol * {
  fill: currentColor;
}

.black-key-touch.pressed {
  color: #56c7d1;
}

.black-key-touch-hit {
  fill: transparent;
  pointer-events: all;
}

.white-key {
  cursor: pointer;
  fill: #fff;
  stroke: #aeaeae;
}

.white-key.central {
  fill: #ffca17;
}

.white-key.pressed {
  fill: #56c7d1;
}

.black-key {
  fill: #111;
}

.black-key.pressed {
  fill: #56c7d1;
}
</style>
