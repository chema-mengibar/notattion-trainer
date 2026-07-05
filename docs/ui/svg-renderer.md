# SVG Rendere

The trainer service has the render functionalities for the diferent parts of the svg:


I want you to the immplement the trainerService render function.
This will draw directly in the #`partitions-wrapper-svg` dom svg content
based on avaible space:


# The Grid

create a array of arrays coordinates values first of all, by load the view
createGrid() and store in the service constant
re calculate the grid points by resize the aplication

Render methods and parts:

See the `docs/grid-system.png`
Based on the grid the diferent parts of the partition view will use the coordinates.

Number of rows (PEntagrams) based on the number of hands setting

## Parts
### Pentagram line and clave (sol, fa) 
based on the coordinate 0,0 (red dot).
Takes the (b line) space of the screen `docs/grid-system.png`

### Notes
Placement of the notes bassed on the grid. Dots in blue, orange and black
just notes  not üöaced in the 5 lines of pentagram has a small horizntal line
Create a function renderNote( compassIdx, columnIdx, lineIdx  )
- compass idx 0 or 1
- column Idx : inside a compas: 0,1,2,3
- note idx: from bottom to top: 0-20
    in Sol clave is idx 4 the first `Do`, idx 8 ist the clave `sol`
    in Fa clave is idx 12 ist the clave `fa`

### Cursor rectangle 
see `docs/grid-system.png`
4 possible possition by compass block
Ignore green dots

