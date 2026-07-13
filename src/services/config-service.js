import { reactive } from 'vue';

const STORAGE_KEY = 'notation-trainer-settings';

export const SCALES = [
  { value: 'do_major', american: 'C Major', latin: 'Do Major', accidental: null, count: 0 },
  { value: 'sol_major', american: 'G Major', latin: 'Sol Major', accidental: 'sharp', count: 1 },
  { value: 're_major', american: 'D Major', latin: 'Re Major', accidental: 'sharp', count: 2 },
  { value: 'la_major', american: 'A Major', latin: 'La Major', accidental: 'sharp', count: 3 },
  { value: 'mi_major', american: 'E Major', latin: 'Mi Major', accidental: 'sharp', count: 4 },
  { value: 'si_major', american: 'B Major', latin: 'Si Major', accidental: 'sharp', count: 5 },
  { value: 'fa_sos_major', american: 'F# Major', latin: 'Fa# Major', accidental: 'sharp', count: 6 },
  { value: 'do_sos_major', american: 'C# Major', latin: 'Do# Major', accidental: 'sharp', count: 7 },
  { value: 'fa_major', american: 'F Major', latin: 'Fa Major', accidental: 'flat', count: 1 },
  { value: 'si_bemol_major', american: 'Bb Major', latin: 'Sib Major', accidental: 'flat', count: 2 },
  { value: 'mi_bemol_major', american: 'Eb Major', latin: 'Mib Major', accidental: 'flat', count: 3 },
  { value: 'la_bemol_major', american: 'Ab Major', latin: 'Lab Major', accidental: 'flat', count: 4 },
  { value: 're_bemol_major', american: 'Db Major', latin: 'Reb Major', accidental: 'flat', count: 5 },
  { value: 'sol_bemol_major', american: 'Gb Major', latin: 'Solb Major', accidental: 'flat', count: 6 },
  { value: 'do_bemol_major', american: 'Cb Major', latin: 'Dob Major', accidental: 'flat', count: 7 },
];

const DEFAULT_SETTINGS = {
  hands: 2,
  clef: 'sol_fa',
  scaleType: 'american',
  scale: 'do_major',
  notesPerTime: 1,
  randomNotesPerTime: false,
  keyboardRange: 'medium',
  tempoVelocity: 4,
  tempoMode: 'note',
};

const LEGACY_TEMPO_VELOCITIES = {
  slow: 6,
  normal: 4,
  fast: 2,
};

const clampTempoVelocity = (value) => {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) return DEFAULT_SETTINGS.tempoVelocity;

  return Math.min(12, Math.max(2, numericValue));
};

export default class ConfigService {
  constructor() {
    this._settings = reactive({ ...DEFAULT_SETTINGS, ...this.readStoredSettings() });
    this.normalize();
  }

  get settings() {
    return this._settings;
  }

  get scales() {
    return SCALES;
  }

  get selectedScale() {
    return SCALES.find((scale) => scale.value === this._settings.scale) || SCALES[0];
  }

  update(patch) {
    Object.assign(this._settings, patch);
    this.normalize();
    this.persist();
  }

  reset() {
    Object.assign(this._settings, DEFAULT_SETTINGS);
    this.persist();
  }

  readStoredSettings() {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  persist() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this._settings));
  }

  normalize() {
    if (this._settings.scale === 'si_mayor') {
      this._settings.scale = 'si_major';
    }

    if (this._settings.hands === 2) {
      this._settings.clef = 'sol_fa';
    }

    if (this._settings.notesPerTime === 1) {
      this._settings.randomNotesPerTime = false;
    }

    if (LEGACY_TEMPO_VELOCITIES[this._settings.tempoVelocity]) {
      this._settings.tempoVelocity = LEGACY_TEMPO_VELOCITIES[this._settings.tempoVelocity];
    }

    this._settings.tempoVelocity = clampTempoVelocity(this._settings.tempoVelocity);
  }
}
