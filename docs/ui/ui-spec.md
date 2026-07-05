# UI Specs





# Settings View

## User Settings

Hands: 1 or 2 ; -  
value: 1 or 2 number

Hands Clave: 
- 1 hand: `sol` of `fa` 
- 2 hands : no option -> both `sol` and `fa` selected automatically
value: `sol` ,  `fa` ,  `sol_fa`

Scale Type (radio button): 
 - Anglo-American notation -  value: 'american'
 - Sol-fa -  value: 'latin'

Scale: dropdown
by selec display a representation pentagram with armatures simbols and clave (1 or and 2)


Notes x time
How many notes represents in one time cursor (pro Hand):
Values: 1,2,3

Notes x time random max:
Checkbox: true/false
If true, means the `Notes x time` will be randomly calculated.
If user seleted `Notes x time` 1, checkbox is disabled and false
If user seleted `Notes x time` 2,3, means number is the max of displayed notes, and vary from 1-to max
Sometime 1, sometimes 2, etcc by each cursor time.
It doesnt matter if ar dissonant.
i more than 1, will not repeat in one hand by cursor time o playing time.


Keyboard range
How many octaves / keys are displayed
Options:  
- basic: central `DO` 
- medium: central `DO` +  1 octave to the left  +  1 octave to the right
- full:  as in design
This affect at the display position of notes in pentagram.

# Training View
- `docs/ui/design-mobile.png`

View port is divided vertically in 2 areas:
- partition area
- keyboard area

## Parts
`docs/ui/parts.png`

a - Armadura
b - mano derecha
c - mano izquierda
d - Barras de compas
e - distancia entre pentagramas
f - distancia entre lineas
g - grid
h - touch area , teclas negras
i - touch area teclas blancas
j - `Do` central
k - cursor
m - keyboard area
n - settings button
p - play button
r - tempo mode
s - tempo velocity

## Training worflow

Based on the selected settings, notes are placed in a compass seccion randomly in a grid.
Grid is horizontal splited /4 in each compas section.
Just 2 compases are displayed at same time.

When user start a cursor jump to first grid position.
The user has to click in keyboard the displayed notes
The user has x Time till the cursor jumps to next grid position.
After I compas is finised will automaticalle re-render with new notes and idx number change in pentagram.

User can play pause the traing with the  (top-right corner) toogle button:
![play.svg](svgs/play.svg)
![pause.svg](svgs/pause.svg)

# Tempo configuration

Tempo has 2 factor:
- velocity: slow, normal, fast
- mode: notes / time

And icon is displayed in Partition area:
![tempo_fast.svg](svgs/tempo_fast.svg)
![tempo_normal.svg](svgs/tempo_normal.svg)
![tempo_slow.svg](svgs/tempo_slow.svg)

configurable variables in code:
slow 6 seconds   ; normal 3.5 seconds ; fast:  1.5 seconds  


By click on the icons, a modal apears with a range element, and training will be paused:
slow - normal - fast
and cancel/save button
By save tempo will change
User has to click in the ply button (top-right corner) to continue

## Velocity Mode
each x seconds the cursor change.
user hast x time to click the notes in the keyboard (1 after 1, multi touch tablets, mobiles)
`docs/ui/design-mobile.png`

## Note Mode
each note at once will we marked in partition area. with the accent color
User has to click each note , after click , next note of the column will be marked,
after all notes in a column are finished, cursor jumpo to next column
`docs/ui/design-mobile__tempo-mode-note.png`

also need a column note index and a column index for this mode

## Setting (gear Button)
User can navigate to the setting view by clicking on the top-left button 
![gear.svg](svgs/gear.svg)

By saving o go back button click user navigate to trainingg view

## Clickable Parts during Training
Just (j) white keys and (h) touch buttons for black keys are clickable in the keyboard area during training.
In Partition area user can click on the grid line (with some space for finger) and will jump to the selected time.


## Code Variables

grid: css color with alpha

piano area css background
`do` key central css fill color
touch elements (h) fill color and opacity
cursor css color and alpha


# Core project

## Scales
In code we well use the latin type as keys values


| Inglés   | Do-Re-Mi   | Armadura                   | Value           |
| -------- | ---------- | -------------------------- |-----------------|
| C Major  | Do Mayor   | —                          | do_major        |
| G Major  | Sol Mayor  | F#                         | sol_major       |
| D Major  | Re Mayor   | F#, C#                     | re_major        |
| A Major  | La Mayor   | F#, C#, G#                 | la_major        |
| E Major  | Mi Mayor   | F#, C#, G#, D#             | mi_major        |
| B Major  | Si Mayor   | F#, C#, G#, D#, A#         | si_mayor        |
| F# Major | Fa# Mayor  | F#, C#, G#, D#, A#, E#     | fa_sos_major    |
| C# Major | Do# Mayor  | F#, C#, G#, D#, A#, E#, B# | do_sos_major    |
| F Major  | Fa Mayor   | Bb                         | fa_major        |
| Bb Major | Sib Mayor  | Bb, Eb                     | si_bemol_major  |
| Eb Major | Mib Mayor  | Bb, Eb, Ab                 | mi_bemol_major  |
| Ab Major | Lab Mayor  | Bb, Eb, Ab, Db             | la_bemol_major  |
| Db Major | Reb Mayor  | Bb, Eb, Ab, Db, Gb         | re_bemol_major  |
| Gb Major | Solb Mayor | Bb, Eb, Ab, Db, Gb, Cb     | sol_bemol_major |
| Cb Major | Dob Mayor  | Bb, Eb, Ab, Db, Gb, Cb, Fb | do_bemol_major  |


# Vue Routes
- trainer
- settings

# Architecture
Logic and main stores are in Services


## Config Service
Settings storage
[config-service.js](../../src/services/config-service.js)
in yected in Trainer service

## Trainer Service
[trainer-service.js](../../src/services/trainer-service.js)
Use the inyected tconfig service to render the partition area.

I will define a system coordinates in a pentagram column.See in design the lines are the 5 basic lines of the pentagram, and 3 lines under and 3 lines over.
This is strict related to the sleected keyboard layout.
During each interaction the web (trainer Service) check the input of touched keys by user so we are able to check if is an error or not.
Error or success are not displayed durring training time at the moment.

Training time is unlimited so long the user continues, and notes placement ar calculated on time.



# Ui partition canvas
docs/ui/parts.png
docs/ui/design-mobile.png
Create a partition area vue component and partials vue components to render the pentagrams, using the selected settings.
Svgs:
- docs/ui/svgs/armadura-bemol.svg
- docs/ui/svgs/armadura-sostenido.svg
- docs/ui/svgs/clave-fa.svg
- docs/ui/svgs/clave-sol.svg
- docs/ui/svgs/note-down.svg
- docs/ui/svgs/note-up.svg
- docs/ui/svgs/pentagrama.svg


Implement the component/s to be responsive for desktop, tablet and mobile.

# Ui partition canvas
docs/ui/parts.png
docs/ui/design-mobile.png


- docs/ui/svgs/tecla-blanca.svg
- docs/ui/svgs/tecla-negra.svg
- docs/ui/svgs/touch-big.svg
- docs/ui/svgs/touch-small.svg

Create a vue component
Number of keys based on the settings
Touch areas for black keys are just `docs/ui/black-keys.png`
- docs/ui/svgs/touch-big.svg
- docs/ui/svgs/touch-small.svg

Touch areas for white keys are the keys
docs/ui/svgs/tecla-blanca.svg
