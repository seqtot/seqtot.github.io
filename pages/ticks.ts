const tick14 = `
<tick @>
-             : 1 :
@cowbell      : 1 :
`.trim();

const tick24 = `
<tick @>
-             : 1   2   :
@cowbell      : 1       :
@nil          :     2   :
`.trim();

const tick38 = `
<tick @>
-             : 1   2   3   :
@cowbell      : 1     2     :
@nil          :   1 2   3 3 :
`.trim();

const tick44 = `
<tick @>
-             : 1   2   3   4   :
@cowbell      : 1               :
@nil          :     2   3   4   :
`.trim();

const tick88 = `
<tick @>
-             : 1   2   3   4   :
@hc           : 1 1 2 2 3 3 4 4 :
`.trim();

const _x___XX_xx___x__ = `
<body @>
-             : 1   2   3   4   :
@sn           :  x   xx xx   x  :
`.trim();


export const standardTicks = {
  '1:4': tick14,
  '2:4': tick24,
  '3:8': tick38,
  '4:4': tick44,
  '8:8': tick88,
  _x___XX_xx___x__,
};
