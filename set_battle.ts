const info = `
<div style="margin: .5rem;">
  <b>И вновь продолжается бой</b>
  <a
    class="link external"
    href="https://www.youtube.com/watch?v=hNSCjRqKtc8"
    target="_blank"
  >
    пример
  </a> |
  <a
    class="link external"
    href="https://muzon-muzon.ru/index/i_vnov_ppodolzhaetsya_boj/0-431"
    target="_blank"
  >
    ноты
  </a>

<pre style="font-family: monospace; margin: .5rem 0 0;">

Cm
G7sus Cm Eb
Fm6 G7 Cm
G7sus Cm Eb
Gm D7 G  

G Fm G7 Cm 
Fm Bb7 Eb
Ab Fm Eb 
C7 Fm G7 Cm

<strong>G7sus Cm        Eb</strong>
неба  утреннего стяг
<strong>        Fm6   G7     Cm</strong>
в жизни важен первый шаг
<strong>G7sus   Cm           Eb</strong>
слышишь реют над страною
<strong>      Gm    D7    G</strong>
ветры ярост-ных а-так

<strong>G  Fm           G7     Cm</strong>
и  вновь продол-жается бой
<strong>   Fm         Bb7         Eb</strong>
и  сердцу тре-вожно в гру-ди
<strong>   Ab       Fm       Eb</strong>
и  ленин та-кой моло-дой
<strong>C7 Fm      G7          Cm</strong>
и  юный ок-тябрь впере-ди

</pre>
<br/><br/>
</div>
`;

const content = `
  ${info}
`.trim();

const parts = `
<tick4@ b120>
-  : 1   2   3   4   :
@sn: x   x   x   x   :
--------------------------------------------------------------------------------
<tick3@ b120>
-  : 1   2   3   :
@sn: x   x   x   :
--------------------------------------------------------------------------------
<simple44@ b120>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
--------------------------------------------------------------------------------
<btl_Су1$ b120>
$organ: су-100
--------------------------------------------------------------------------------
<btl_До4$ b120>
$organ: до-400
--------------------------------------------------------------------------------
<btl_До3$ b120>
$organ: до-300
--------------------------------------------------------------------------------
<btl_Но4$ b120>
$organ: но-400
--------------------------------------------------------------------------------
<btl_Фу3$ b120>
$organ: фу-300
--------------------------------------------------------------------------------
<pgIntro$ b120>
$organ: му-50 фу-50 фу-50 фу-50 му-50 фу-50 фу-50 фу-50
--------------------------------------------------------------------------------
<pgMain$ b120>
$organ: му-50 му-50 ву-50 му-50 су-50 му-50 лу-50 зу-50
--------------------------------------------------------------------------------
<pgToEs$ b120>
$organ: му-50 му-50  ву-50 му-50  су-50 му-50  лу-50 су-100
--------------------------------------------------------------------------------
<esSyMyVyMy$ b120>
$organ: 50 му-50 ву-50 му-50  ву-50 су-50 ву-50

<esSyMyVyMy@ b120>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
--------------------------------------------------------------------------------
<pgOut@ b120>
-  : 1   2   3   4   :
@hc: x x x x x       :
@sn:     2     x x x :
@bd: 1       3       :

<pgOut$ b120>
$organ: му-50 му-50 ву-50 му-50 су-50 150
--------------------------------------------------------------------------------
<pgBreakOnE1@ b120>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn: x         x x   :

<pgBrakeOnE1$ b120>
$organ: му-50 200 му-50 му-50 50
--------------------------------------------------------------------------------
<pgBreakOnH@ b120>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:           x x   :

<pgBreakOnH$ b120>
$organ: 250 бу-50 бу-50 50
--------------------------------------------------------------------------------
<peterGunnE2$ b120>
$organ: 200 му-50 му-50
--------------------------------------------------------------------------------
<drumOnE2@ b120>
-  : 1   2   3   4   :
@sn:           x x   :
--------------------------------------------------------------------------------
<pause1@ b120>
-  : 1   :
@hc:     :
--------------------------------------------------------------------------------
<pause2@ b120>
-  : 1   2   :
@hc:         :
--------------------------------------------------------------------------------
<pause3@ b120>
-  : 1   2   3   :
@hc:             :
--------------------------------------------------------------------------------
<pause4@ b120>
-  : 1   2   3   4   :
@hc:                 :
--------------------------------------------------------------------------------
<hat@ b120>
-  : 1   2   3   4   :
@hc: x   x   x   x   :
--------------------------------------------------------------------------------
<hat8@ b120>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
`.trim();

const harmony = `
<out b120 r1>
tick3@
pause1@ btl_Су1$
pause4@ btl_До4$
pause4@ btl_Но4$
pause3@ btl_Фу3$
pause1@ btl_Су1$
pause3@ btl_До3$
pause1@ btl_Су1$

${parts}
`;

const beat44 = `
<out b120 r1000>
simple44@

<simple44@ b120>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
`.trim();

const test = `
<out b120 r1000>
woodBlock@

<out b120 r1000>
handClap@
sideRimshot@
cuica@
triangle@
woodBlock@
guiro@
whistle@
cabasa@
maracas@
claves@
agogo@
timbale@
conga@
cymbal@
bongo@
vibraSlap@
tambourine@
bell@
hiHat@
lowTom@
midTom@
highTom@
snare@
bassDrum@


<bassDrum@ b120>
-           : 1   2   3   4   :
@bd1        : x   x           :
@bd2        :         x   x   :


<snare@ b120>
-           : 1   2   3   4   :
@sn1        : x   x           :
@sn2        :         x   x   :


<lowTom@ b120>
-        : 1   2   3   4   :
@lowTom2 : x   x           :
@lowTom1 :         x   x   :


<midTom@ b120>
-        : 1   2   3   4   :
@midTom2 : x   x           :
@midTom1 :         x   x   :


<highTom@ b120>
-         : 1   2   3   4   :
@highTom2 : x   x           :
@highTom1 :         x   x   :


<whistle@ b120>
-             : 1   2   3   4   :
@shortWhistle : x   x           :
@longWhistle  :         x   x   :


<guiro@ b120>
-           : 1   2   3   4   :
@shortGuiro : x   x           :
@longGuiro  :         x   x   :


<conga@ b120>
-              : 1   2   3   4   5   6   :
@muteHighConga : x   x                   :
@openHighConga :         x   x           :
@lowConga      :                 x   x   :


<cabasa@ b120>
-        : 1   2   3   4   :
@cabasa  : x   x   x   x   :


<maracas@ b120>
-        : 1   2   3   4   :
@maracas : x   x   x   x   :


<claves@ b120>
-       : 1   2   3   4   :
@claves : x   x   x   x   :


<timbale@ b120>
-            : 1   2   3   4   :
@highTimbale : x   x           :
@lowTimbale  :         x   x   :


<agogo@ b120>
-          : 1   2   3   4   :
@highAgogo : x   x           :
@lowAgogo  :         x   x   :


<hiHat@ b120>
-           : 1   2   3   4   5   6   :
@ho         : x   x                   :
@hc         :         x   x           :
@hp         :                 x   x   :


<cymbal@ b120>
-              : 1   2   3   4   5   6   7   8   9   10  11  12  :
@crashCymbal2  : x   x                                           :
@crashCymbal1  :         x   x                                   :
@splashCymbal  :                 x   x                           :
@rideCymbal2   :                         x   x                   :
@rideCymbal1   :                                 x   x           :
@chineseCymbal :                                         x   x   :

<bell@ b120>
-         : 1   2   3   4   :
@rideBell : x   x           :
@cowbell  :         x   x   :


<bongo@ b120>
-          : 1   2   3   4   :
@highBongo : x   x           :
@lowBongo  :         x   x   :


<triangle@ b120>
-             : 1   2   3   4   :
@muteTriangle : x   x           :
@openTriangle :         x   x   :


<woodBlock@ b120>
-              : 1   2   3   4   :
@highWoodBlock : x   x           :
@lowWoodBlock  :         x   x   :


<cuica@ b120>
-          : 1   2   3   4   :
@muteCuica : x   x           :
@openCuica :         x   x   :


<tambourine@ b120>
-           : 1   2   3   4   :
@tambourine : x x x x x x x x :


<vibraSlap@ b120>
-           : 1   2   3   4   :
@vibraSlap  : x x x x x x x x :


<handClap@ b120>
-           : 1   2   3   4   :
@handClap   : x   x   x   x   :

<sideRimshot@ b120>
-            : 1   2   3   4   :
@sideRimshot : x   x   x   x   :

`.trim();

export default {
  content,
  tracks: [
    { key: 'beat44', value: beat44, name: 'бит 4/4' },
    { key: 'harmony', value: harmony, name: 'Гармония' },
    { key: 'test', value: test, name: 'Тест' },
  ],
};
