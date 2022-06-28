import { reactive } from 'vue'

const SOL = 'sol'
const FA = 'fa'
const SOSTENIDO = 'sostenido'
const BEMOL = 'bemol'

export default class TrainerService {

    constructor() {



        this.notes = {
            sol: {
                1: 'sol',
                2: 'la',
                3: 'si',
                4: 'do',
                5: 're',
                6: 'mi',
                7: 'fa',
                8: 'sol',
                9: 'la',
                10: 'si',
                11: 'do',
                12: 're',
                13: 'mi',
                14: 'fa',
                15: 'sol',
                16: 'la',
                17: 'si',
                18: 'do',
                19: 're',
            },
            fa: {
                1: 'si',
                2: 'do',
                3: 're',
                4: 'mi',
                5: 'fa',
                6: 'sol',
                7: 'la',
                8: 'si',
                9: 'do',
                10: 're',
                11: 'mi',
                12: 'fa',
                13: 'sol',
                14: 'la',
                15: 'si',
                16: 'do',
                17: 're',
                18: 'mi',
                19: 'fa',
            }
        }

        this.notesKeys = {
            sol: {
                1: 35,
                2: 37,
                3: 39,
                4: 40,
                5: 42,
                6: 44,
                7: 45,
                8: 47,
                9: 49,
                10: 51,
                11: 52,
                12: 54,
                13: 56,
                14: 57,
                15: 59,
                16: 61,
                17: 63,
                18: 64,
                19: 66,
            },
            fa: {
                1: 15,
                2: 16,
                3: 18,
                4: 20,
                5: 21,
                6: 23,
                7: 25,
                8: 27,
                9: 28,
                10: 30,
                11: 32,
                12: 33,
                13: 35,
                14: 37,
                15: 39,
                16: 40,
                17: 42,
                18: 44,
                19: 45,
            }
        }

        this.alteraciones = {
            sostenido: {
                1: ['fa'],
                2: ['fa', 'do'],
                3: ['fa', 'do', 'sol'],
                4: ['fa', 'do', 'sol', 're'],
            },
            bemol: {
                1: ['si'],
                2: ['si', 'mi'],
                3: ['si', 'mi', 'la'],
                4: ['si', 'mi', 'la', 're'],
            }
        }


        this._config = reactive({
            clave: SOL,
            armadura: null,
            alt: 1,
            notes: 2
        })

        this.notesExercise = []
    }

    get config() {
        return this._config
    }


    set configClave(clave) {
        console.log(clave)
        this._config.clave = clave;
    }

    set configArmadura(armadura) {
        this._config.armadura = armadura;
    }

    set configAlteraciones(alt) {
        this._config.alt = alt;
    }

    set configMaxNotes(notes) {
        this._config.notes = notes;
    }

    reset() {

        this.notesExercise = []

        document.getElementById('solution').innerHTML = ''

        const claves = [...document.getElementById('claves').childNodes];
        claves.forEach(notaItem => {
            notaItem.style.display = 'none';
        })

        const teclas = [...document.getElementById('piano').childNodes];
        teclas.forEach(teclaItem => {
            if (typeof teclaItem.getAttribute === 'function') {
                const color = teclaItem.getAttribute('data-note-color') || 'white'
                teclaItem.style.fill = color;
            }
        })

        const notas = [...document.getElementById('notas').childNodes];
        notas.forEach(notaItem => {
            notaItem.style.display = 'none';
        })


    }

    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    solve() {

        let solution = ''

        this.notesExercise.forEach(note => {
            solution += note + ' <br />'
        })

        document.getElementById('solution').innerHTML = solution
    }

    build() {
        this.reset()

        const clave = this.config.clave
        const armadura = this.config.armadura
        const alt = this.config.alt

        let notasAlteraciones = []
        if (armadura !== null) {
            notasAlteraciones = this.alteraciones[armadura][alt]

            // 
            for (let a = 1; a <= alt; a += 1) {
                document.getElementById(`${armadura}-${clave}-${a}`).style.display = 'block';
            }
        }

        //
        const claveElement = document.getElementById(`clave-${clave}`)
        if (claveElement) {
            claveElement.style.display = 'block'
        }



        //
        const maxNotes = this.config.notes //this.randomNumber(1, this.config.notes);
        const notes = []

        for (let m = 1; m <= maxNotes; m += 1) {
            const nNote = this.randomNumber(1, 19);
            notes.push(nNote)
        }
        //

        for (let n = 0; n < notes.length; n += 1) {
            const notaIdx = notes[n]
            const nota = this.notes[clave][notaIdx]
            let tecla = this.notesKeys[clave][notaIdx]

            this.notesExercise.push(nota)

            document.getElementById(`nota-${notaIdx}`).style.display = 'block';

            if (notasAlteraciones.includes(nota)) {
                if (armadura === SOSTENIDO) {
                    tecla += 1
                }
                if (armadura === BEMOL) {
                    tecla -= 1
                }
            }
            document.getElementById(`key-${tecla}`).style.fill = 'orange';

            console.log(nota, tecla, notaIdx)

        }












    }


}