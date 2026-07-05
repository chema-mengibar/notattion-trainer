<script>
import { ARMATURE_SYMBOLS } from './armature-symbols';
import { CLEF_SYMBOLS } from './clef-symbols';
import { armaturesSymbolCoordinates } from '../../services/trainer-service/scale-armature.config';

const STAFF_LINE_COUNT = 5;
const NOTE_LINE_COUNT = 21;

export default {
  name: 'ScaleArmaturePreview',
  props: {
    settings: { type: Object, required: true },
  },
  data: () => ({
    clefSymbols: CLEF_SYMBOLS,
  }),
  computed: {
    clefs() {
      return this.settings.hands === 2 ? ['sol', 'fa'] : [this.settings.clef];
    },
    rows() {
      const rowHeight = this.clefs.length === 2 ? 86 : 118;
      return this.clefs.map((clef, rowIdx) => this.createRow(clef, rowIdx, rowHeight));
    },
    viewBoxHeight() {
      return this.clefs.length === 2 ? 172 : 118;
    },
  },
  methods: {
    createRow(clef, rowIdx, rowHeight) {
      const lineGap = 8;
      const staffTop = rowIdx * rowHeight + (this.clefs.length === 2 ? 22 : 38);
      const noteBottom = staffTop + lineGap * 8;
      return {
        clef,
        rowIdx,
        lineGap,
        staffTop,
        staffBottom: staffTop + lineGap * 4,
        notePoints: Array.from({ length: NOTE_LINE_COUNT }).map((_, idx) => ({
          idx,
          y: noteBottom - idx * (lineGap / 2),
        })),
      };
    },
    staffLines(row) {
      return Array.from({ length: STAFF_LINE_COUNT }).map((_, idx) => row.staffTop + idx * row.lineGap);
    },
    clefTransform(row) {
      const symbol = CLEF_SYMBOLS[row.clef];
      const targetHeight = row.clef === 'sol' ? row.lineGap * 7.4 : row.lineGap * 3.6;
      const scale = targetHeight / symbol.height;
      const x = 20;
      const y = row.clef === 'sol'
        ? row.staffTop - row.lineGap * 2
        : row.staffTop + row.lineGap * 0.55;
      return `translate(${x} ${y}) scale(${scale})`;
    },
    marks(row) {
      const scaleConfig = armaturesSymbolCoordinates[this.settings.scale] || {};
      return (scaleConfig[row.clef] || []).map((mark, index) => ({
        ...mark,
        index,
        symbolConfig: ARMATURE_SYMBOLS[mark.symbol],
        point: row.notePoints[mark.idx],
      })).filter((mark) => mark.symbolConfig && mark.point);
    },
    markTransform(row, mark) {
      const targetHeight = row.lineGap * 1.6;
      const scale = targetHeight / mark.symbolConfig.height;
      const x = 62 + mark.index * row.lineGap * 1.1;
      const y = mark.point.y - targetHeight * 0.5;
      return `translate(${x} ${y}) scale(${scale})`;
    },
  },
};
</script>

<template>
  <svg
    class="scale-armature-preview"
    viewBox="0 0 260 172"
    :style="{ aspectRatio: `260 / ${viewBoxHeight}` }"
    role="img"
    aria-label="Scale armature preview"
  >
    <g v-for="row in rows" :key="row.clef" :data-type="`preview-row-${row.clef}`">
      <line
        v-for="y in staffLines(row)"
        :key="y"
        data-type="preview-pentagram-line"
        x1="12"
        :y1="y"
        x2="238"
        :y2="y"
        stroke="#111"
        stroke-width="1"
      />

      <g :data-type="`preview-clave-${row.clef}`" :transform="clefTransform(row)">
        <path
          v-for="path in clefSymbols[row.clef].paths"
          :key="path"
          :d="path"
          fill="#111"
          fill-rule="evenodd"
          clip-rule="evenodd"
        />
      </g>

      <g
        v-for="mark in marks(row)"
        :key="`${row.clef}-${mark.index}`"
        :data-type="`preview-${mark.symbolConfig.dataType}`"
        :data-line-idx="mark.idx"
        :transform="markTransform(row, mark)"
      >
        <path
          v-for="path in mark.symbolConfig.paths"
          :key="path"
          :d="path"
          fill="#111"
        />
      </g>
    </g>
  </svg>
</template>

<style lang="scss">
.scale-armature-preview {
  width: 100%;
  height: 150px;
  display: block;
  background: #fff;
}
</style>
