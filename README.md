leaflet-custom-paths
====================
Draw custom paths with the Leaflet mapping library

Resources
---------
*  [VML path data specification](http://www.w3.org/TR/NOTE-VML#_Toc416858391 "VML path data specification")
*  [SVG path data specification](http://www.w3.org/TR/SVG11/paths.html#PathDataGeneralInformation "SVG path data specification")

Path data spec overview
-----------------------

| SVG | parameters         | VML | parameters         | meaning                                                             |
| --- | ------------------ | --- | ------------------ | ------------------------------------------------------------------- |
| M/m | (x y)+             | m/- | (x y)              | move to (x y)                                                       |
| L/l | (x y)+             | l/r | (x y)+             | line to (x y)                                                       |
| H/h | x+                 | -   | -                  | horizontal lineto x                                                 |
| V/v | y+                 | -   | -                  | vertical lineto y                                                   |
| Z,z | -                  | x   | -                  | close path                                                          |
| -   | -                  | e   | -                  | end path                                                            |
| C/c | (x1 y1 x2 y2 x y)+ | c/v | (x1 y1 x2 y2 x y)+ | cubic bézier curve to (x y) with control points (x1 y1) and (x2 y2) |