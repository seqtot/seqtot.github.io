// https://www.youtube.com/watch?v=RQByi1q81DQ slow with tabs
// https://www.youtube.com/watch?v=ewgaDgO6mpw tabs
// https://www.youtube.com/watch?v=-hX4e_Pgi80 tabs

// https://www.youtube.com/watch?v=vz76bWsVTVY - 100 simple riffs
// https://www.youtube.com/watch?v=yE4eq9aLK_M

// Creedence Clearwater Revival - Suzie Q - GUITAR TUTORIAL
const suzieQ = `
<div style="margin: .5rem;">
  <b>Suzie Q</b> (Creedence)
  <a
    class="link external"
    href="https://www.youtube.com/watch?v=V1_Q2kB2Brs"
    target="_blank"
  >
    tabs
  </a>&nbsp;&nbsp;

<pre style="font-family: monospace; margin: .5rem 0 0;">
основной
2: --3------------------
3: ----2-0--------------
4: --------0-2-2-----0--
5: --------------0-2----
6: 0-------------------3
хвост
3: ----2-----2-----5-----4
4: ----2-----2-----5-----4
5: 0-0---0-0---3-3---2-2--
6: -----------------------
основной хэви
3: ---7----------------------------
4: --------7-5---------------------
5: ---------------5-7----7------5--
6: 00---00-----00-----00---55-7---3

3: -------------------------------
4: -------------------------------
5: -------------------------------
6: -------------------------------

</pre>


</div>
`;

const enterSandmen = `
<div style="margin: .5rem;">
  <b>Enter Sandman</b> (Metallica)
  <a
    class="link external"
    href="https://www.youtube.com/watch?v=NIAkEJp8i_Y"
    target="_blank"
  >
    lesson
  </a> |
  <a
    class="link external"
    href="https://www.songsterr.com/a/wsa/metallica-enter-sandman-tab-s19"
    target="_blank"
  >
    tabs
  </a>

<pre style="font-family: monospace; margin: .5rem 0 0;">
<span style="color: lightgray;">   му  МоКуЛу</span> <a data-note-line="b110 му-100 мо-100 ку-50 лу-100">PLAY</a>
5: --2/7----
6: 0-----6-5
<span style="color: lightgray;">   суМу ВуМу ВуСуВу</span> <a data-note-line="b110 су-100 му-50 ву-50 му-50 ву-50 су-50 ву-50">PLAY</a>
6: 3-0--2-0--2-3-2
<span style="color: lightgray;">   муМуМуМуМуМуМуФу</span> <a data-note-line="b110 му-50 му-50 му-50 му-50 му-50 му-50 му-50 фу-50">PLAY</a>
6: 0-0-0-0-0-0-0-1
</pre>

<br/>
Переход к <strong>И вновь продолжается бой</strong>
<a data-note-line="b110 му-100 су-50 ку-50 то-50 мо-50 со-50 ко-50  бу-100 ро-50 фо-50 зо-50 ра-50">PLAY</a>

<pre style="font-family: monospace; margin: .5rem 0 0;">
<span style="color: lightgray;">   муСуКуТоМоСоКо  буРоФоЗоРа</span>
3: ----------0-3-=---------7-
4: --------2-----=---0-3-6---
5: ----1-4-------=-2---------
6: 0-3-----------=-----------

</pre>


</div>
`;

const peterGunn = `
<div style="margin: .5rem;">
  <b>Peter Gunn</b>
  <a
    class="link external"
    href="https://www.youtube.com/watch?v=vhdSodIxZSE"
    target="_blank"
  >
    lesson
  </a> |
  <a
    class="link external"
    href="https://www.youtube.com/watch?v=296wS9ome4M"
    target="_blank"
  >
    Duane Eddy
  </a>

<pre style="font-family: monospace; margin: .5rem 0 0;">
<span style="color: lightgray;">   муФуФуФу</span> <a data-note-line="b110 му-50 фу-50 фу-50 фу-50">PLAY</a>
6: 0/1-1-1
<span style="color: lightgray;">   муМу ВуМу СуМу ЛуЗу</span> <a data-note-line="b110 му-50 му-50 ву-50 му-50 су-50 му-50 лу-50 зу-50">PLAY</a>
6: 0-0--2-0--3-0--5-4
</pre>

</div>
`;

const content = `
  ${peterGunn}
  ${enterSandmen}
`.trim();

const parts = `
<tick@>
-  : 1   2   3   4   :
@sn: x   x   x   x   :
--------------------------------------------------------------------------------
<simple44@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
--------------------------------------------------------------------------------
<simple44_drum@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
--------------------------------------------------------------------------------
<pg_оХаОО_ritm$>
$organ: му-50 фу-50 фу-50 фу-50 му-50 фу-50 фу-50 фу-50
--------------------------------------------------------------------------------
<pg_ооЦаЦуЩаЩуПаХу_ritm$>
$organ: му-50 му-50 ву-50 му-50 су-50 му-50 лу-50 зу-50
--------------------------------------------------------------------------------
<pg_ToEs_ritm$>
$organ: му-50 му-50  ву-50 му-50  су-50 му-50  лу-50 су-100  d400
--------------------------------------------------------------------------------
<es_оЦаЦуЦаХаХуЦу_ritm$>
$organ: 50 му-50  ву-50 му-50  ву-50 су-50  ву-50 му-100 d400
--------------------------------------------------------------------------------
<esMy6Fy$>
$organ: 50 му-50  му-50 му-50  му-50 му-50  му-50 фу-50

<esMyFy$>
$organ: му-50 му-50  му-50 му-50  му-50 му-50  му-50 фу-50

<esMyFy2$>
$organ: му-50 му-50  му-50 му-50  му-50 му-50  му-50 су-100 d400
--------------------------------------------------------------------------------
<esMyFyOut$>
$organ: му-50 му-50  му-50 му-50  му-50 му-50  му-50 су-100 d400
--------------------------------------------------------------------------------
# о
<esMoKyLy$>
$organ: 50 мо-100 ку-50  лу-100 му-50 му-150 d400

<esMoKyLyLast$>
$organ: 50 мо-100 ку-50  лу-100 му-50 су-100 d400
--------------------------------------------------------------------------------
<pg_ооЦаЦуЩа_drum@>
-  : 1   2   3   4   :
@hc: x x x x x       :
@sn:     2     x x x :
@bd: 1       3       :

<pg_ооЦаЦуЩа_ritm$>
$gdm: му-50 му-50 ву-50 му-50 су-50 150
--------------------------------------------------------------------------------
<pg_BreakOnE1_drum@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn: x         x x   :

<pg_BrakeOnE1_ritm$>
$organ: му-50 200 му-50 му-50 50
--------------------------------------------------------------------------------
<pg_BreakOnH_drum@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:           x x   :

<pgBreakOnH_ritm$>
$organ: 250 бу-50 бу-50 50
--------------------------------------------------------------------------------
<peterGunnE2$>
$organ: 200 му-50 му-50
--------------------------------------------------------------------------------
<drumOnE2@>
-  : 1   2   3   4   :
@sn:           x x   :
--------------------------------------------------------------------------------
<pause@>
-  : 1   2   3   4   :
@hc:                 :
--------------------------------------------------------------------------------
<hat_drum@>
-  : 1   2   3   4   :
@hc: x   x   x   x   :
--------------------------------------------------------------------------------
<hat8_drum@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
`.trim();

const petGunBreak = `
<out b110 r1>
tick@
simple44@-1        pg_ооЦаЦуЩаЩуПаХу_ritm$-1
pg_ооЦаЦуЩа_drum@  pg_ооЦаЦуЩа_ritm$
pg_BreakOnE1_drum@ pg_BrakeOnE1_ritm$
pg_BreakOnH_drum@  pgBreakOnH_ritm$
hat8_drum@-1
hat_drum@-1        pg_оХаОО_ritm$-1
pause@

<out b110 r1>
tick@
simple44@-2 pg_ооЦаЦуЩаЩуПаХу_ritm$-2
simple44@-1 pg_ToEs_ritm$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$
simple44@-2 pg_ооЦаЦуЩаЩуПаХу_ritm$-2
simple44@-1 pg_ToEs_ritm$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$
pause@

${parts}
`;

// pg_оХаОО
// ооЦаЦуЩаЩуПаХу

const full = `
<out b110 r1>
tick@

hat_drum@-2        pg_оХаОО_ritm$-2
simple44_drum@-2   pg_ооЦаЦуЩаЩуПаХу_ritm$-2
simple44_drum@-8   pg_ооЦаЦуЩаЩуПаХу_ritm$-8
simple44_drum@-7   pg_ооЦаЦуЩаЩуПаХу_ritm$-7
pg_ооЦаЦуЩа_drum@  pg_ооЦаЦуЩа_ritm$
pg_BreakOnE1_drum@ pg_BrakeOnE1_ritm$
pg_BreakOnH_drum@  pgBreakOnH_ritm$
hat8_drum@

hat_drum@-2       pg_оХаОО_ritm$-2
simple44_drum@-2  pg_ооЦаЦуЩаЩуПаХу_ritm$-2
simple44_drum@    pg_ToEs_ritm$
simple44@         es_оЦаЦуЦаХаХуЦу_ritm$
simple44_drum@-2  pg_ооЦаЦуЩаЩуПаХу_ritm$-2
simple44_drum@    pg_ToEs_ritm$
simple44@         es_оЦаЦуЦаХаХуЦу_ritm$

${parts}
`;

const beat44 = `
<out b110 r1000>
simple44@

<simple44@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
`.trim();

const test = `
<out b110 r1>
simple44@-1 pg_ToEs_ritm$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$

simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLyLast$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$

simple44@-1 esMy6Fy$-1
simple44@-1 esMyFy$-1
simple44@-1 esMyFy2$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$

simple44@-1 esMy6Fy$-1
simple44@-1 esMyFy$-1
simple44@-1 esMyFy2$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$

simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLyLast$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$

simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLyLast$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$



<out b110 r1>
simple44@-1 pg_ToEs_ritm$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$

simple44@-1 esMy6Fy$-1
simple44@-1 esMyFy$-1
simple44@-1 esMyFy2$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$

simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLyLast$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$

<out b110 r1>
tick@ 

simple44@-2 esMyFy$-2
simple44@-1 esMyFyOut$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$
simple44@-2 esMyFy$-2
simple44@-1 esMyFyOut$-1
simple44@-1 es_оЦаЦуЦаХаХуЦу_ritm$

<out b110 r1>
simple44@-2 esMoKyLy$-2

${parts}
`;

export default {
  content,
  tracks: [
    { key: '4/4', value: beat44, name: 'бит 4/4 bmp:110' },
    { key: 'break', value: petGunBreak, name: 'сбивка bmp:110' },
    { key: 'full', value: full, name: 'полностью bmp:110' },
    { key: 'test', value: test, name: 'тест' },
  ],
};

// pg - peterGunn
// es - enterSandman

// # hc: hiHat closed
// # ho: hiHat opened
// # sn: snare
// # bd: buss drum
