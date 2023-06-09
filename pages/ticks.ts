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

const tick34 = `
<tick @>
-             : 1   2   3   :
@cowbell      : 1           :
@nil          :     2   3   :
`.trim();

const tick44 = `
<tick @>
-             : 1   2   3   4   :
@cowbell      : 1               :
@nil          :     2   3   4   :
`.trim();

export const standardTicks = {
  '1:4': tick14,
  '2:4': tick24,
  '3:4': tick34,
  '4:4': tick44,
};
