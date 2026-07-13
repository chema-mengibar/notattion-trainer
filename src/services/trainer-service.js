import { reactive } from 'vue';
import { CLEF_SYMBOLS } from '../components/partition/clef-symbols';
import { ARMATURE_SYMBOLS } from '../components/partition/armature-symbols';
import { armaturesSymbolCoordinates } from './trainer-service/scale-armature.config';
import { blackKeysMap, keyMap } from './trainer-service/keyMap.config';

const AMERICAN_NAMES = { do: 'C', re: 'D', mi: 'E', fa: 'F', sol: 'G', la: 'A', si: 'B' };
const RANGES = {
  basic: { from: 0, to: 6 },
  medium: { from: -7, to: 13 },
  full: { from: -16, to: 16 },
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const STAFF_LINE_COUNT = 5;
const NOTE_LINE_COUNT = 21;
const LEDGER_LINE_IDXS = [0, 2, 4, 16, 18, 20];
const NOTE_LEDGER_LINE_IDXS = {
  0: [2, 4],
  1: [2, 4],
  2: [4],
  3: [4],
  17: [16],
  18: [16],
  19: [18, 16],
  20: [16, 18],
};

export default class TrainerService {
  constructor(configService) {
    this.configService = configService;
    this.state = reactive({
      debug:false,
      showNoteLabels: true,
      measures: [],
      cursor: 0,
      columnIndex: 0,
      columnNoteIndex: 0,
      playing: false,
      grid: [],
      measureStart: 1,
      userNotes: [],
      ghostKeys: [],
      highlightedUuid: '',
      highlightedAlteration: '',
      highlightedCompassIdx: null,
      highlightedColumnIdx: null,
    });
    this.timer = null;
    this.highlightTimer = null;
    this.svg = null;
    this.resizeObserver = null;
    this.touchKey = this.touchKey.bind(this);
    this.pressKey = this.pressKey.bind(this);
    this.releaseKey = this.releaseKey.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
    this.generate();
  }

  get intervalMs() {
    return Number(this.configService.settings.tempoVelocity) * 1000;
  }

  get clefs() {
    return this.configService.settings.hands === 2 ? ['sol', 'fa'] : [this.configService.settings.clef];
  }

  get renderClefs() {
    return this.state.debug ? ['sol', 'fa'] : this.clefs;
  }

  get activeSlot() {
    return this.state.measures[this.state.cursor] || null;
  }

  generate() {
    const previousMeasureStart = this.state.measureStart;
    const slots = [];
    for (let measure = 0; measure < 2; measure += 1) {
      for (let beat = 0; beat < 4; beat += 1) {
        slots.push({
          id: `${measure}-${beat}-${Date.now()}-${Math.random()}`,
          measure,
          beat,
          hands: this.buildHands(),
        });
      }
    }
    this.state.measures = slots;
    this.state.cursor = 0;
    this.state.columnIndex = 0;
    this.state.columnNoteIndex = 0;
    this.state.userNotes = [];
    this.state.measureStart = previousMeasureStart;
    this.render();
  }

  generateNext() {
    this.state.measureStart += 2;
    this.generate();
  }

  loadTraining(training) {
    if (!training) return;

    if (training.scale) {
      this.configService.update({ scale: training.scale, hands: 2 });
    }

    const measureCount = Math.max(
      training.right ? training.right.length : 0,
      training.left ? training.left.length : 0,
    );
    const slots = [];

    for (let measure = 0; measure < measureCount; measure += 1) {
      const rightMeasure = training.right[measure] || [];
      const leftMeasure = training.left[measure] || [];
      const beatCount = Math.max(rightMeasure.length, leftMeasure.length, 1);

      for (let beat = 0; beat < beatCount; beat += 1) {
        slots.push({
          id: `training-${measure}-${beat}-${Date.now()}-${Math.random()}`,
          measure,
          beat,
          hands: {
            sol: this.buildTrainingNotes('sol', rightMeasure[beat] || []),
            fa: this.buildTrainingNotes('fa', leftMeasure[beat] || []),
          },
        });
      }
    }

    this.state.measures = slots;
    this.state.cursor = 0;
    this.state.columnIndex = 0;
    this.state.columnNoteIndex = 0;
    this.state.userNotes = [];
    this.state.ghostKeys = [];
    this.state.measureStart = 1;
    this.render();
  }

  buildTrainingNotes(clef, noteUuids) {
    return noteUuids
      .map((uuid) => this.createTrainingNote(clef, uuid))
      .filter(Boolean);
  }

  createTrainingNote(clef, uuid) {
    const mappedNote = this.noteMapForUuid(uuid);
    if (!mappedNote) return null;

    const gridIdx = clef === 'sol' ? mappedNote.solGridIdx : mappedNote.faGridIdx;
    if (gridIdx === null || gridIdx === '') return null;

    return {
      id: `${clef}-${uuid}-${Math.random()}`,
      clef,
      name: mappedNote.note,
      american: AMERICAN_NAMES[mappedNote.note],
      position: Number(gridIdx),
      midi: this.midiFromMappedNote(mappedNote),
      fromPianoDo: mappedNote.fromPianoDo,
      uuid: this.noteUuid(mappedNote),
      label: mappedNote.note,
      alteration: this.scaleAlterationForMappedNote(mappedNote),
    };
  }

  buildHands() {
    return this.clefs.reduce((hands, clef) => {
      hands[clef] = this.buildNotes(clef);
      return hands;
    }, {});
  }

  buildNotes(clef) {
    const settings = this.configService.settings;
    const count = settings.randomNotesPerTime
      ? this.randomNumber(1, settings.notesPerTime)
      : settings.notesPerTime;
    const positions = this.randomItems(this.visibleNotePositions(clef), count);

    return positions
      .map((position) => this.createNote(clef, position))
      .filter(Boolean);
  }

  visibleNotePositions(clef) {
    const gridKey = clef === 'sol' ? 'solGridIdx' : 'faGridIdx';
    return Array.from(new Set(
      this.visibleKeys()
        .map((key) => key[gridKey])
        .filter((gridIdx) => gridIdx !== null && gridIdx !== '')
        .map(Number)
    ));
  }

  randomItems(items, count) {
    const candidates = [...items];
    const selected = [];
    const targetCount = Math.min(count, candidates.length);

    while (selected.length < targetCount) {
      const index = this.randomNumber(0, candidates.length - 1);
      selected.push(candidates[index]);
      candidates.splice(index, 1);
    }

    return selected;
  }

  createNote(clef, position) {
    const mappedNote = this.noteMapForGridIdx(clef, position);
    if (!mappedNote) return null;

    return {
      id: `${clef}-${mappedNote.note}-${mappedNote.fromPianoDo}-${Math.random()}`,
      clef,
      name: mappedNote.note,
      american: AMERICAN_NAMES[mappedNote.note],
      position,
      midi: this.midiFromMappedNote(mappedNote),
      fromPianoDo: mappedNote.fromPianoDo,
      uuid: this.noteUuid(mappedNote),
      label: mappedNote.note,
      alteration: this.scaleAlterationForMappedNote(mappedNote),
    };
  }

  visibleKeys() {
    const range = RANGES[this.configService.settings.keyboardRange] || RANGES.medium;
    const keys = keyMap
      .map((item, keyboardGridIdx) => ({ ...item, keyboardGridIdx }))
      .filter((item) => {
        const fromPianoDo = Number(item.fromPianoDo);
        return fromPianoDo >= range.from && fromPianoDo <= range.to;
      })
      .map((item) => {
        const midi = this.midiFromMappedNote(item);
        return {
          keyId: this.keyId(midi),
          uuid: this.noteUuid(item),
          alteration: '',
          solGridIdx: item.solGridIdx,
          faGridIdx: item.faGridIdx,
          keyboardGridIdx: item.keyboardGridIdx,
          midi,
          name: item.note,
          american: AMERICAN_NAMES[item.note],
          isCentralDo: item.fromPianoDo === '0',
          blackKey: this.blackKeyFor(item.keyboardGridIdx),
        };
      });

    return keys;
  }

  blackKeyFor(index) {
    const blackKey = blackKeysMap.find((item) => (
      Number(item.keyboardGridIdx) === Number(index)
    ));
    if (!blackKey) return null;

    const midi = 35 + Number(blackKey.keyboardGridIdx) + 0.5;
    const mappedNote = this.mappedNoteForBlackKey(blackKey);
    if (!mappedNote) return null;
    const alteration = this.alterationForBlackKey(blackKey);

    return {
      keyId: this.keyId(midi),
      uuid: this.noteUuid(mappedNote),
      midi,
      sostainNote: blackKey.sostainNote,
      bemolNote: blackKey.bemolNote,
      keyboardGridIdx: blackKey.keyboardGridIdx,
      solGridIdx: mappedNote.solGridIdx,
      faGridIdx: mappedNote.faGridIdx,
      label: mappedNote.note,
      accidental: alteration,
      alteration,
    };
  }

  keyId(midi) {
    return `key-${String(midi).replace('.', '-')}`;
  }

  touchKey(midi) {
    this.addUserNote(midi);

    if (this.configService.settings.tempoMode === 'note') {
      this.handleNoteModeTouch(midi);
    }
  }

  pressKey(key) {
    const mappedNote = key && key.uuid
      ? this.noteMapForUuid(key.uuid)
      : this.noteMapForMidi(key);
    if (!mappedNote) return;

    const uuid = this.noteUuid(mappedNote);
    const alteration = key.alteration || '';
    if (this.activeColumnHasActiveNote(uuid, alteration)) {
      this.highlightNote(uuid, alteration, () => {
        if (this.configService.settings.tempoMode === 'note') {
          this.advanceNoteMode();
        }
      });
      return;
    }

    const ghostKey = {
      keyId: key.keyId || this.keyId(key),
      midi: key.midi || key,
      uuid,
      label: mappedNote.note,
      solGridIdx: key.solGridIdx !== undefined ? key.solGridIdx : mappedNote.solGridIdx,
      faGridIdx: key.faGridIdx !== undefined ? key.faGridIdx : mappedNote.faGridIdx,
      accidental: alteration,
      alteration,
    };
    this.state.ghostKeys = [ghostKey];
    this.render();
  }

  releaseKey() {
    this.state.ghostKeys = [];
    this.clearGhostNotes();
    this.render();
  }

  highlightNote(uuid, alteration, afterHighlight = null) {
    window.clearTimeout(this.highlightTimer);
    const slot = this.activeSlot;
    this.state.highlightedUuid = uuid;
    this.state.highlightedAlteration = alteration || '';
    this.state.highlightedCompassIdx = slot ? slot.measure : null;
    this.state.highlightedColumnIdx = slot ? slot.beat : null;
    this.state.ghostKeys = [];
    this.render();
    this.highlightTimer = window.setTimeout(() => {
      this.state.highlightedUuid = '';
      this.state.highlightedAlteration = '';
      this.state.highlightedCompassIdx = null;
      this.state.highlightedColumnIdx = null;
      this.render();
      if (afterHighlight) afterHighlight();
    }, 450);
  }

  activeColumnHasActiveNote(uuid, alteration) {
    if (!this.svg) return false;

    const activeColumns = Array.from(this.svg.querySelectorAll(
      '[data-type="note-column"][data-column-active="true"]',
    ));
    return activeColumns.some((column) => (
      column.querySelector(`[data-type="note"][data-active="true"][data-uuid="${uuid}"][data-alteration="${alteration || ''}"]`)
    ));
  }

  addUserNote(midi) {
    const note = this.keyboardNoteForMidi(midi);
    if (!note) return;

    const slot = this.activeSlot;
    if (!slot) return;

    const entry = {
      ...note,
      slotIdx: this.state.cursor,
      compassIdx: slot.measure,
      columnIdx: slot.beat,
    };
    const alreadyRendered = this.state.userNotes.some((item) => (
      item.slotIdx === entry.slotIdx
      && item.keyId === entry.keyId
    ));

    if (!alreadyRendered) {
      this.state.userNotes.push(entry);
      this.render();
    }
  }

  keyboardNoteForMidi(midi) {
    const mappedNote = this.noteMapForMidi(midi);
    if (!mappedNote) return null;

    const clef = this.clefForMappedNote(mappedNote);
    const position = Number(clef === 'sol' ? mappedNote.solGridIdx : mappedNote.faGridIdx);

    return {
      keyId: this.keyId(midi),
      midi,
      fromPianoDo: mappedNote.fromPianoDo,
      clef,
      position,
      uuid: this.noteUuid(mappedNote),
      label: mappedNote.note,
      alteration: this.scaleAlterationForMappedNote(mappedNote),
    };
  }

  noteMapForGridIdx(clef, lineIdx) {
    const gridKey = clef === 'sol' ? 'solGridIdx' : 'faGridIdx';
    return keyMap.find((item) => item[gridKey] !== null && item[gridKey] !== '' && Number(item[gridKey]) === Number(lineIdx));
  }

  clefForMappedNote(mappedNote) {
    const hasSol = mappedNote.solGridIdx !== null && mappedNote.solGridIdx !== '';
    const hasFa = mappedNote.faGridIdx !== null && mappedNote.faGridIdx !== '';
    const selectedClef = this.configService.settings.clef;

    if (this.configService.settings.hands !== 2 && selectedClef === 'fa' && hasFa) return 'fa';
    if (hasSol) return 'sol';
    if (hasFa) return 'fa';
    return selectedClef;
  }

  noteMapForMidi(midi) {
    const fromPianoDo = String(Math.round(midi) - 35);
    return this.noteMapForFromPianoDo(fromPianoDo);
  }

  noteMapForFromPianoDo(fromPianoDo) {
    return keyMap.find((item) => item.fromPianoDo === String(fromPianoDo));
  }

  noteMapForUuid(uuid) {
    return keyMap.find((item) => this.noteUuid(item) === uuid);
  }

  noteUuidForMidi(midi) {
    const mappedNote = this.noteMapForMidi(midi);
    return mappedNote ? this.noteUuid(mappedNote) : '';
  }

  midiFromMappedNote(mappedNote) {
    return 35 + Number(mappedNote.fromPianoDo);
  }

  noteUuid(mappedNote) {
    return `${mappedNote.note}${mappedNote.fromPianoDo}`;
  }

  scaleAlterationForMappedNote(mappedNote) {
    const selectedScale = this.configService.selectedScale;
    const scaleRoot = selectedScale.value.replace('_major', '').replace('_sos', '');
    if (!selectedScale.accidental || mappedNote.note !== scaleRoot) return '';
    return selectedScale.accidental === 'sharp' ? 'sostenido' : 'bemol';
  }

  mappedNoteForBlackKey(blackKey) {
    const alteration = this.alterationForBlackKey(blackKey);
    if (alteration === 'bemol') {
      return keyMap.find((item) => (
        item.note === blackKey.bemolNote
        && Number(item.fromPianoDo) === Number(blackKey.fromPianoDo) + 1
      ));
    }

    return this.noteMapForFromPianoDo(blackKey.fromPianoDo);
  }

  alterationForBlackKey(blackKey) {
    const selectedScale = this.configService.selectedScale;
    const scaleRoot = selectedScale.value.replace('_major', '').replace('_sos', '');

    if (selectedScale.accidental === 'flat' && blackKey.bemolNote === scaleRoot) return 'bemol';
    if (selectedScale.accidental === 'sharp' && blackKey.sostainNote === scaleRoot) return 'sostenido';
    return 'sostenido';
  }

  jumpTo(index) {
    this.state.cursor = index;
    this.state.columnIndex = index;
    this.state.columnNoteIndex = 0;
    this.render();
  }

  toggle() {
    this.state.playing ? this.pause() : this.play();
  }

  play() {
    if (this.state.playing) return;
    this.state.playing = true;
    if (this.configService.settings.tempoMode === 'note') return;
    this.timer = window.setInterval(() => this.next(), this.intervalMs);
  }

  pause() {
    this.state.playing = false;
    window.clearInterval(this.timer);
    this.timer = null;
  }

  next() {
    const nextCursor = this.state.cursor + 1;
    if (nextCursor >= this.state.measures.length) {
      this.generateNext();
      return;
    }
    this.jumpTo(nextCursor);
  }

  activeColumnNotes() {
    const slot = this.activeSlot;
    if (!slot) return [];
    return this.clefs.flatMap((clef) => slot.hands[clef] || []);
  }

  activeColumnNote() {
    return this.activeColumnNotes()[this.state.columnNoteIndex] || null;
  }

  handleNoteModeTouch(midi) {
    const note = this.activeColumnNote();
    if (!note || note.midi !== midi) return;

    this.advanceNoteMode();
  }

  advanceNoteMode() {
    const nextNoteIndex = this.state.columnNoteIndex + 1;
    if (nextNoteIndex < this.activeColumnNotes().length) {
      this.state.columnNoteIndex = nextNoteIndex;
      this.render();
      return;
    }

    this.next();
  }

  updateTempo(velocity) {
    this.configService.update({ tempoVelocity: velocity });
    this.pause();
  }

  toggleNoteLabels() {
    this.state.showNoteLabels = !this.state.showNoteLabels;
    this.render();
  }

  mountRenderer(svg = document.getElementById('partitions-wrapper-svg')) {
    this.svg = svg;
    this.render();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    const host = svg ? svg.parentElement : null;
    if (host && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.render());
      this.resizeObserver.observe(host);
    }
  }

  unmountRenderer() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.svg = null;
  }

  render(svg = this.svg || document.getElementById('partitions-wrapper-svg')) {
    if (!svg) return;

    this.svg = svg;
    const grid = this.createGrid(svg);
    this.state.grid = grid.rows;
    this.clearSvg(svg);
    this.setSvgSize(svg, grid);
    this.renderDefs(svg);

    grid.rows.forEach((row) => {
      const pentagramGroup = this.renderPentagramGroup(svg, row);
      const decorationGroup = this.renderPentagramDecorationGroup(pentagramGroup);
      this.renderPentagram(decorationGroup, row);
      if (this.state.debug) {
        this.renderDebugNoteGrid(decorationGroup, row);
      }
      this.renderClef(decorationGroup, row);
      this.renderArmature(decorationGroup, row);
      if (this.state.debug) {
        this.renderDebugNotes(pentagramGroup, row);
      } else {
        this.renderMeasureLabels(decorationGroup, row);
        this.renderNotes(pentagramGroup, row);
      }
    });

    if (!this.state.debug) {
      this.renderCursorHitLayer(svg, grid);
    }

    this.renderGhostKeys(svg, grid);
  }

  renderDefs(svg) {
    const defs = this.create('defs', {
      'data-type': 'svg-defs',
    });
    const gradient = this.create('linearGradient', {
      id: 'cursor-rectangle-active-gradient',
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
    });
    [
      { offset: '0%', color: 'rgba(111, 99, 255, .45)' },
      { offset: '7%', color: 'rgba(111, 99, 255, 0)' },
      { offset: '93%', color: 'rgba(111, 99, 255, 0)' },
      { offset: '100%', color: 'rgba(111, 99, 255, .45)' },
    ].forEach((stop) => {
      gradient.appendChild(this.create('stop', {
        offset: stop.offset,
        'stop-color': stop.color,
      }));
    });

    defs.appendChild(gradient);
    svg.appendChild(defs);
  }

  createGrid(svg = this.svg) {
    const bounds = svg.getBoundingClientRect();
    const width = Math.max(Math.round(bounds.width || svg.clientWidth || 640), 320);
    const height = Math.max(Math.round(bounds.height || svg.clientHeight || 210), 160);
    const rowCount = this.renderClefs.length;
    const margin = {
      left: Math.round(width * 0.08),
      right: Math.round(width * 0.08),
      top: Math.round(height * 0.1),
      bottom: Math.round(height * 0.1),
    };
    const usableHeight = height - margin.top - margin.bottom;
    const rowHeight = usableHeight / rowCount;
    const rows = this.renderClefs.map((clef, rowIdx) => {
      const origin = {
        x: margin.left,
        y: margin.top + rowIdx * rowHeight,
      };
      return this.createPentagramGrid({
        clef,
        rowIdx,
        origin,
        width: width - margin.left - margin.right,
        height: rowHeight,
      });
    });

    return { width, height, margin, rows };
  }

  createPentagramGrid(row) {
    const clefSpace = row.width * 0.17;
    const gridStartX = row.origin.x + clefSpace;
    const gridWidth = row.width - clefSpace;
    const compassWidth = gridWidth / 2;
    const columnWidth = compassWidth / 4;
    const centerY = row.origin.y + row.height * 0.5;
    const lineGap = Math.max(6, Math.min(11, row.height / 10));
    const staffTop = centerY - lineGap * 2;
    const noteBottom = staffTop + lineGap * 7;
    const noteStep = lineGap / 2;
    const notePoints = Array.from({ length: NOTE_LINE_COUNT }).map((_, idx) => ({
      idx,
      x: gridStartX,
      y: noteBottom - idx * noteStep,
    }));
    const columns = [];

    for (let compassIdx = 0; compassIdx < 2; compassIdx += 1) {
      for (let columnIdx = 0; columnIdx < 4; columnIdx += 1) {
        columns.push({
          compassIdx,
          columnIdx,
          slotIdx: compassIdx * 4 + columnIdx,
          x: gridStartX + compassIdx * compassWidth + columnIdx * columnWidth,
          width: columnWidth,
        });
      }
    }

    return {
      ...row,
      clefX: row.origin.x,
      gridStartX,
      gridEndX: gridStartX + gridWidth,
      armatureStartX: row.origin.x + clefSpace * 0.48,
      compassWidth,
      columnWidth,
      lineGap,
      staffTop,
      staffBottom: staffTop + (STAFF_LINE_COUNT - 1) * lineGap,
      noteStep,
      notePoints,
      columns,
    };
  }

  renderPentagramGroup(svg, row) {
    const group = this.create('g', {
      'data-type': 'pentagram',
      'data-clef': row.clef,
      'data-row-idx': row.rowIdx,
    });

    svg.appendChild(group);
    return group;
  }

  renderPentagramDecorationGroup(svg) {
    const group = this.create('g', {
      'data-type': 'pentagram-decoration',
    });

    svg.appendChild(group);
    return group;
  }

  renderPentagram(svg, row) {
    for (let lineIdx = 0; lineIdx < STAFF_LINE_COUNT; lineIdx += 1) {
      const y = row.staffTop + lineIdx * row.lineGap;
      const gridIdx = 14 - lineIdx * 2;
      this.append(svg, 'line', {
        'data-type': 'pentagram-line',
        'data-grid-idx': gridIdx,
        x1: row.clefX,
        y1: y,
        x2: row.gridEndX,
        y2: y,
        stroke: '#111',
        'stroke-width': 1,
      });
    }

    for (let compassIdx = 0; compassIdx <= 2; compassIdx += 1) {
      const x = row.gridStartX + compassIdx * row.compassWidth;
      this.append(svg, 'line', {
        'data-type': 'compass-separator',
        x1: x,
        y1: row.staffTop,
        x2: x,
        y2: row.staffBottom,
        stroke: '#111',
        'stroke-width': 1,
      });
    }

    row.columns.forEach((column) => {
      this.append(svg, 'line', {
        'data-type': 'grid-line',
        x1: column.x,
        y1: row.staffTop - row.lineGap * 1.3,
        x2: column.x,
        y2: row.staffBottom + row.lineGap * 1.3,
        stroke: 'rgba(0,0,0,.16)',
        'stroke-width': 1,
        'stroke-dasharray': '2 3',
      });
    });
  }

  renderClef(svg, row) {
    const symbol = CLEF_SYMBOLS[row.clef];
    if (!symbol) return;

    const targetHeight = row.clef === 'sol' ? row.lineGap * 7.6 : row.lineGap * 3.9;
    const scale = targetHeight / symbol.height;
    const x = row.clefX + row.lineGap * 0.35;
    const y = row.clef === 'sol'
      ? row.staffTop - row.lineGap * 2.1
      : row.staffTop + row.lineGap * 0.5;
    const group = this.create('g', {
      'data-type': `clave-${row.clef}`,
      transform: `translate(${x} ${y}) scale(${scale})`,
    });

    symbol.paths.forEach((d) => {
      group.appendChild(this.create('path', {
        'data-type': `clave-${row.clef}-path`,
        d,
        fill: '#111',
        'fill-rule': 'evenodd',
        'clip-rule': 'evenodd',
      }));
    });

    svg.appendChild(group);
  }

  renderArmature(svg, row) {
    const scale = this.configService.settings.scale;
    const armature = armaturesSymbolCoordinates[scale] || {};
    const marks = armature[row.clef] || [];
    const symbolHeight = row.lineGap * 1.7;

    marks.forEach((mark, index) => {
      const symbol = ARMATURE_SYMBOLS[mark.symbol];
      const point = row.notePoints[mark.idx];
      if (!symbol || !point) return;

      const scaleValue = symbolHeight / symbol.height;
      const x = row.armatureStartX + index * row.lineGap * 1.05;
      const y = point.y - symbolHeight * 0.5;
      const group = this.create('g', {
        'data-type': symbol.dataType,
        'data-clef': row.clef,
        'data-scale': scale,
        'data-line-idx': mark.idx,
        transform: `translate(${x} ${y}) scale(${scaleValue})`,
      });

      symbol.paths.forEach((d) => {
        group.appendChild(this.create('path', {
          'data-type': `${symbol.dataType}-path`,
          d,
          fill: '#111',
        }));
      });

      svg.appendChild(group);
    });
  }

  renderMeasureLabels(svg, row) {
    [1, 2].forEach((label, idx) => {
      this.append(svg, 'text', {
        'data-type': 'compass-index',
        x: row.gridStartX + row.compassWidth * idx,
        y: row.staffTop - row.lineGap * 0.6,
        fill: '#111',
        'font-size': Math.max(9, row.lineGap * 1.15),
        'text-anchor': 'middle',
      }, this.state.measureStart + idx);
    });
  }

  renderCursorHitLayer(svg, grid) {
    const row = grid.rows[0];
    if (!row) return;

    const group = this.create('g', {
      'data-type': 'cursor-rectangle-group',
    });

    row.columns.forEach((column) => {
      const isActive = column.slotIdx === this.state.cursor;
      const rectangle = this.create('rect', {
        'data-type': 'cursor-rectangle',
        class: 'cursor-rectangle-hit',
        'data-slot-idx': column.slotIdx,
        'data-compass-idx': column.compassIdx,
        'data-column-idx': column.columnIdx,
        'data-active': isActive ? 'true' : 'false',
        x: column.x,
        y: 0,
        width: column.width,
        height: grid.height,
        style: 'cursor: pointer; pointer-events: all;',
      });

      rectangle.addEventListener('click', () => {
        this.jumpTo(column.slotIdx);
      });
      group.appendChild(rectangle);
    });

    svg.appendChild(group);
  }

  renderNotes(svg, row) {
    this.state.measures.forEach((slot, slotIdx) => {
      const notes = slot.hands[row.clef] || [];
      const columnGroup = this.renderNoteColumnGroup(svg, row, slot.measure, slot.beat);
      const direction = this.getNoteColumnDirection(notes);
      notes.forEach((note) => {
        this.renderNote(columnGroup, row, slot.measure, slot.beat, note.position, direction, {
          keyId: this.keyId(note.midi),
          uuid: note.uuid,
          label: note.label,
          alteration: note.alteration,
          color: this.isActiveNote(row.clef, slot.measure, slot.beat, note.position) ? '#6f63ff' : '#111',
          source: 'exercise',
        });
      });
    });

    this.state.userNotes
      .filter((note) => note.clef === row.clef)
      .forEach((note) => {
        const columnGroup = this.renderNoteColumnGroup(svg, row, note.compassIdx, note.columnIdx, 'user-input');
        this.renderNote(columnGroup, row, note.compassIdx, note.columnIdx, note.position, 'top', {
          keyId: note.keyId,
          uuid: note.uuid,
          label: note.label,
          alteration: note.alteration,
          color: '#8f8f8f',
          source: 'user-input',
        });
      });
  }

  renderDebugNoteGrid(svg, row) {
    row.notePoints.forEach((point) => {
      this.append(svg, 'line', {
        'data-type': 'debug-note-grid-line',
        'data-clef': row.clef,
        'data-line-idx': point.idx,
        x1: row.gridStartX,
        y1: point.y,
        x2: row.gridEndX,
        y2: point.y,
        stroke: point.idx % 2 === 0 ? 'rgba(55, 120, 210, .45)' : 'rgba(55, 120, 210, .22)',
        'stroke-width': 1,
        'pointer-events': 'none',
      });
      this.append(svg, 'text', {
        'data-type': 'debug-note-grid-idx',
        'data-clef': row.clef,
        'data-line-idx': point.idx,
        x: row.gridEndX + row.lineGap * 0.8,
        y: point.y,
        fill: '#2f6fc9',
        'font-size': Math.max(6, row.lineGap * 0.7),
        'text-anchor': 'start',
        'dominant-baseline': 'middle',
        'pointer-events': 'none',
      }, point.idx);
    });
  }

  renderDebugNotes(svg, row) {
    const gridKey = row.clef === 'sol' ? 'solGridIdx' : 'faGridIdx';
    const notes = keyMap
      .filter((item) => item[gridKey] !== null && item[gridKey] !== '')
      .map((item) => ({
        mappedNote: item,
        lineIdx: Number(item[gridKey]),
      }))
      .filter((item) => row.notePoints[item.lineIdx]);

    const availableWidth = row.gridEndX - row.gridStartX;
    const step = availableWidth / Math.max(notes.length, 1);

    notes.forEach((note, index) => {
      const x = row.gridStartX + step * (index + 0.5);
      const columnGroup = this.create('g', {
        'data-type': 'debug-note-column',
        'data-clef': row.clef,
        'data-map-idx': index,
        'data-line-idx': note.lineIdx,
        'data-uuid': this.noteUuid(note.mappedNote),
        transform: `translate(${x} 0)`,
      });
      svg.appendChild(columnGroup);

      this.renderNote(columnGroup, row, 0, index, note.lineIdx, note.lineIdx > 10 ? 'down' : 'top', {
        keyId: this.keyId(this.midiFromMappedNote(note.mappedNote)),
        uuid: this.noteUuid(note.mappedNote),
        label: note.mappedNote.note,
        alteration: this.scaleAlterationForMappedNote(note.mappedNote),
        color: '#111',
        source: 'debug',
      });
    });
  }

  renderGhostKeys(svg, grid) {
    this.clearGhostNotes(svg);
    if (!this.state.ghostKeys.length) return;

    const slot = this.activeSlot;
    const group = this.create('g', {
      'data-type': 'ghost-notes',
    });

    this.state.ghostKeys.forEach((ghostKey, ghostIdx) => {
      grid.rows.forEach((row) => {
        const lineIdx = row.clef === 'sol' ? ghostKey.solGridIdx : ghostKey.faGridIdx;
        if (lineIdx === null || lineIdx === '') return;

        const column = slot
          ? row.columns.find((item) => item.compassIdx === slot.measure && item.columnIdx === slot.beat)
          : row.columns[0];
        if (!column) return;

        const x = column.x + column.width * 0.5 + ghostIdx * row.lineGap * 1.5;
        const columnGroup = this.create('g', {
          'data-type': 'ghost-key-column',
          'data-clef': row.clef,
          'data-key': ghostKey.keyId,
          'data-uuid': ghostKey.uuid,
          transform: `translate(${x} 0)`,
        });
        group.appendChild(columnGroup);

        const isCurrent = this.isCurrentTrainingKey(ghostKey.uuid, ghostKey.alteration);
        this.renderNote(columnGroup, row, slot ? slot.measure : 0, slot ? slot.beat : 0, Number(lineIdx), Number(lineIdx) > 10 ? 'down' : 'top', {
          keyId: ghostKey.keyId,
          uuid: ghostKey.uuid,
          label: ghostKey.label,
          accidental: ghostKey.accidental,
          alteration: ghostKey.alteration,
          color: isCurrent ? '#148a3d' : '#c92f2f',
          source: 'ghost-key',
        });
      });
    });

    svg.appendChild(group);
  }

  clearGhostNotes(svg = this.svg) {
    if (!svg) return;

    const ghostNotes = svg.querySelector('[data-type="ghost-notes"]');
    if (!ghostNotes) return;

    while (ghostNotes.firstChild) {
      ghostNotes.removeChild(ghostNotes.firstChild);
    }
    ghostNotes.remove();
  }

  isCurrentTrainingKey(uuid, alteration) {
    const activeNote = this.activeColumnNote();
    return Boolean(activeNote && activeNote.uuid === uuid && (activeNote.alteration || '') === (alteration || ''));
  }

  getNoteColumnDirection(notes) {
    const indexes = notes.map((note) => note.position);

    if (indexes.length === 1) {
      return indexes[0] > 10 ? 'down' : 'top';
    }

    if (indexes.length === 2) {
      return indexes.every((idx) => idx < 10) ? 'top' : 'down';
    }

    const topVotes = indexes.filter((idx) => idx <= 10).length;
    return topVotes >= 2 ? 'top' : 'down';
  }

  renderNoteColumnGroup(svg, row, compassIdx, columnIdx, source = 'exercise') {
    const column = row.columns.find((item) => item.compassIdx === compassIdx && item.columnIdx === columnIdx);
    if (!column) return null;

    const x = column.x + column.width * 0.5;
    const group = this.create('g', {
      'data-type': 'note-column',
      'data-clef': row.clef,
      'data-compass-idx': compassIdx,
      'data-column-idx': columnIdx,
      'data-column-active': this.isActiveColumn(compassIdx, columnIdx) ? 'true' : 'false',
      'data-source': source,
      transform: `translate(${x} 0)`,
    });

    svg.appendChild(group);
    return group;
  }

  renderNote(parentGroup, row, compassIdx, columnIdx, lineIdx, direction = 'top', options = {}) {
    const point = row.notePoints[lineIdx];
    if (!parentGroup || !point) return null;

    const cx = 0;
    const cy = point.y;
    const noteWidth = row.lineGap * 1.35;
    const noteHeight = row.lineGap * 0.92;
    const stemUp = direction === 'top';
    const isActiveNote = options.source !== 'user-input' && this.isActiveNote(row.clef, compassIdx, columnIdx, lineIdx);
    const color = options.color || (isActiveNote ? '#6f63ff' : '#111');
    const isHighlighted = (
      options.uuid === this.state.highlightedUuid
      && (options.alteration || '') === this.state.highlightedAlteration
      && Number(compassIdx) === Number(this.state.highlightedCompassIdx)
      && Number(columnIdx) === Number(this.state.highlightedColumnIdx)
    );
    const noteGroup = this.create('g', {
      'data-type': 'note',
      class: isHighlighted ? 'note-column--matched' : '',
      'data-key': options.keyId || '',
      'data-uuid': options.uuid || '',
      'data-alteration': options.alteration || '',
      'data-source': options.source || 'exercise',
      'data-compass-idx': compassIdx,
      'data-column-idx': columnIdx,
      'data-line-idx': lineIdx,
      'data-direction': direction,
      'data-active': isActiveNote ? 'true' : 'false',
    });

    this.ledgerLineIdxsForNote(lineIdx).forEach((ledgerLineIdx) => {
      const ledgerPoint = row.notePoints[ledgerLineIdx];
      if (!ledgerPoint) return;

      noteGroup.appendChild(this.create('line', {
        'data-type': 'note-ledger-line',
        'data-line-idx': ledgerLineIdx,
        x1: cx - noteWidth * 1.1,
        y1: ledgerPoint.y,
        x2: cx + noteWidth * 1.1,
        y2: ledgerPoint.y,
        stroke: color,
        'stroke-width': 1,
      }));
    });

    const note = this.create('ellipse', {
      'data-type': 'note-head',
      cx,
      cy,
      rx: noteWidth * 0.55,
      ry: noteHeight * 0.5,
      fill: color,
      transform: `rotate(-18 ${cx} ${cy})`,
    });
    noteGroup.appendChild(note);

    if (options.accidental) {
      this.renderNoteAccidental(noteGroup, row, cx, cy, noteWidth, options.accidental, color);
    }

    if (this.state.showNoteLabels && options.label) {
      const labelText = this.create('text', {
        'data-type': 'note-label',
        x: cx - 10,
        y: cy - 5,
        fill: color,
        'font-size': 8,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'pointer-events': 'none',
      });
      labelText.textContent = String(options.label).toUpperCase();
      noteGroup.appendChild(labelText);
    }

    const stemX = stemUp ? cx + noteWidth * 0.45 : cx - noteWidth * 0.45;
    noteGroup.appendChild(this.create('line', {
      'data-type': 'note-stem',
      x1: stemX,
      y1: cy,
      x2: stemX,
      y2: stemUp ? cy - row.lineGap * 3.4 : cy + row.lineGap * 3.4,
      stroke: color,
      'stroke-width': 1.4,
    }));

    parentGroup.appendChild(noteGroup);
    return noteGroup;
  }

  ledgerLineIdxsForNote(lineIdx) {
    const noteLineIdx = Number(lineIdx);
    const ownLedgerLineIdxs = LEDGER_LINE_IDXS.includes(noteLineIdx) ? [noteLineIdx] : [];
    return [
      ...ownLedgerLineIdxs,
      ...(NOTE_LEDGER_LINE_IDXS[noteLineIdx] || []),
    ];
  }

  renderNoteAccidental(noteGroup, row, cx, cy, noteWidth, accidental, color) {
    const symbol = ARMATURE_SYMBOLS[accidental];
    if (!symbol) return;

    const symbolHeight = row.lineGap * 1.35;
    const scale = symbolHeight / symbol.height;
    const x = cx - noteWidth * 1.35;
    const y = cy - symbolHeight * 0.5;
    const group = this.create('g', {
      'data-type': `note-${symbol.dataType}`,
      transform: `translate(${x} ${y}) scale(${scale})`,
    });

    symbol.paths.forEach((d) => {
      group.appendChild(this.create('path', {
        'data-type': `${symbol.dataType}-path`,
        d,
        fill: color,
      }));
    });

    noteGroup.appendChild(group);
  }

  isActiveNote(clef, compassIdx, columnIdx, lineIdx) {
    if (this.configService.settings.tempoMode !== 'note') return false;
    const activeNote = this.activeColumnNote();
    if (!activeNote) return false;
    const slot = this.activeSlot;
    return Boolean(
      slot
      && slot.measure === compassIdx
      && slot.beat === columnIdx
      && activeNote.clef === clef
      && activeNote.position === lineIdx
    );
  }

  isActiveColumn(compassIdx, columnIdx) {
    const slot = this.activeSlot;
    return Boolean(
      slot
      && Number(slot.measure) === Number(compassIdx)
      && Number(slot.beat) === Number(columnIdx)
    );
  }

  clearSvg(svg) {
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
  }

  setSvgSize(svg, grid) {
    svg.setAttribute('viewBox', `0 0 ${grid.width} ${grid.height}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('preserveAspectRatio', 'none');
  }

  append(svg, tagName, attrs = {}, text = null) {
    const element = this.create(tagName, attrs);
    if (text !== null) {
      element.textContent = text;
    }
    svg.appendChild(element);
    return element;
  }

  create(tagName, attrs = {}) {
    const element = document.createElementNS(SVG_NS, tagName);
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }

  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
