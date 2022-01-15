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
<span style="color: lightgray;">   му  МоКуЛу</span> <a data-note-line="b120 му-100 мо-100 ку-50 лу-100">PLAY</a>
5: --2/7----
6: 0-----6-5
<span style="color: lightgray;">   суМу ВуМу ВуСуВу</span> <a data-note-line="b120 су-100 му-50 ву-50 му-50 ву-50 су-50 ву-50">PLAY</a>
6: 3-0--2-0--2-3-2
<span style="color: lightgray;">   муМуМуМуМуМуМуФу</span> <a data-note-line="b120 му-50 му-50 му-50 му-50 му-50 му-50 му-50 фу-50">PLAY</a>
6: 0-0-0-0-0-0-0-1
</pre>

<br/>
Переход к <strong>И вновь продолжается бой</strong>
<a data-note-line="b120 му-100 су-50 ку-50 то-50 мо-50 со-50 ко-50  бу-100 ро-50 фо-50 зо-50 ра-50">PLAY</a>

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
<span style="color: lightgray;">   муФуФуФу</span> <a data-note-line="b120 му-50 фу-50 фу-50 фу-50">PLAY</a>
6: 0/1-1-1
<span style="color: lightgray;">   муМу ВуМу СуМу ЛуЗу</span> <a data-note-line="b120 му-50 му-50 ву-50 му-50 су-50 му-50 лу-50 зу-50">PLAY</a>
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
<pg_оХаОО_ritm$>

$bass: му-50 фу-50 фу-50 фу-50 му-50 фу-50 фу-50 фу-50
--------------------------------------------------------------------------------
<pg_00ЦаЦуЩаЩуПаХу_ritm$>
$organ: му-50 му-50 ву-50 му-50 су-50 му-50 лу-50 зу-50
--------------------------------------------------------------------------------
<pgToEs$>
$organ: му-50 му-50  ву-50 му-50  су-50 му-50  лу-50 су-100  d400
--------------------------------------------------------------------------------
<esMyVyMyVy$>
$organ: 50 му-50  ву-50 му-50  ву-50 су-50  ву-50 му-100 d400

<esMyVyMyVy@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
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
<esMoKyLy$>
$organ: 50 мо-100 ку-50  лу-100 му-50 му-100 d400

<esMoKyLyLast$>
$organ: 50 мо-100 ку-50  лу-100 му-50 су-100 d400
--------------------------------------------------------------------------------
<pg_00ЦаЦуЩа@>
-  : 1   2   3   4   :
@hc: x x x x x       :
@sn:     2     x x x :
@bd: 1       3       :

<pg_00ЦаЦуЩа_ritm$>
$organ: му-50 му-50 ву-50 му-50 су-50 150
--------------------------------------------------------------------------------
<pgBreakOnE1@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn: x         x x   :

<pgBrakeOnE1_ritm$>
$organ: му-50 200 му-50 му-50 50
--------------------------------------------------------------------------------
<pgBreakOnH@>
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
<hat@>
-  : 1   2   3   4   :
@hc: x   x   x   x   :
--------------------------------------------------------------------------------
<hat8@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
`.trim();

const petGunBreak = `
<out b120 r1>
tick@
simple44@-1 pg_00ЦаЦуЩаЩуПаХу_ritm$-1
pg_00ЦаЦуЩа@ pg_00ЦаЦуЩа_ritm$
pgBreakOnE1@ pgBrakeOnE1_ritm$
pgBreakOnH@  pgBreakOnH_ritm$
hat8@-1
hat@-1 pg_оХаОО_ritm$-1
pause@

<out b120 r1>
tick@
simple44@-2 pg_00ЦаЦуЩаЩуПаХу_ritm$-2
simple44@-1 pgToEs$-1
esMyVyMyVy@-1 esMyVyMyVy$
simple44@-2 pg_00ЦаЦуЩаЩуПаХу_ritm$-2
simple44@-1 pgToEs$-1
esMyVyMyVy@-1 esMyVyMyVy$
pause@

${parts}
`;

const full = `
<out b120 r1>
tick@

hat@-2       pg_оХаОО_ritm$-2
simple44@-2  pg_00ЦаЦуЩаЩуПаХу_ritm$-2
simple44@-8  pg_00ЦаЦуЩаЩуПаХу_ritm$-8
simple44@-7  pg_00ЦаЦуЩаЩуПаХу_ritm$-7
pg_00ЦаЦуЩа@ pg_00ЦаЦуЩа_ritm$
pgBreakOnE1@ pgBrakeOnE1_ritm$
pgBreakOnH@  pgBreakOnH_ritm$
hat8@-1

hat@-2 pg_оХаОО_ritm$-2
simple44@-2 pg_00ЦаЦуЩаЩуПаХу_ritm$-2
simple44@-1 pgToEs$-1
esMyVyMyVy@-1 esMyVyMyVy$
simple44@-2 pg_00ЦаЦуЩаЩуПаХу_ritm$-2
simple44@-1 pgToEs$-1
esMyVyMyVy@-1 esMyVyMyVy$


${parts}
`;

const beat44 = `
<out b100 r1000>
simple44@

<simple44@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
`.trim();

const test = `
<out b120 r1>
simple44@-1 pgToEs$-1
esMyVyMyVy@-1 esMyVyMyVy$

simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLyLast$-1
esMyVyMyVy@-1 esMyVyMyVy$-1

simple44@-1 esMy6Fy$-1
simple44@-1 esMyFy$-1
simple44@-1 esMyFy2$-1
esMyVyMyVy@-1 esMyVyMyVy$-1

simple44@-1 esMy6Fy$-1
simple44@-1 esMyFy$-1
simple44@-1 esMyFy2$-1
esMyVyMyVy@-1 esMyVyMyVy$-1

simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLyLast$-1
esMyVyMyVy@-1 esMyVyMyVy$-1

simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLyLast$-1
esMyVyMyVy@-1 esMyVyMyVy$-1



<out b120 r1>
simple44@-1 pgToEs$-1
esMyVyMyVy@-1 esMyVyMyVy$-1

simple44@-1 esMy6Fy$-1
simple44@-1 esMyFy$-1
simple44@-1 esMyFy2$-1
esMyVyMyVy@-1 esMyVyMyVy$-1

simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLy$-1
simple44@-1 esMoKyLyLast$-1
esMyVyMyVy@-1 esMyVyMyVy$-1

<out b120 r1>
tick@ 

simple44@-2 esMyFy$-2
simple44@-1 esMyFyOut$-1
esMyVyMyVy@-1 esMyVyMyVy$-1
simple44@-2 esMyFy$-2
simple44@-1 esMyFyOut$-1
esMyVyMyVy@-1 esMyVyMyVy$-1

<out b120 r1>
simple44@-2 esMoKyLy$-2

${parts}
`;

export default {
  content,
  tracks: [
    { key: '4/4', value: beat44, name: 'бит 4/4 bmp:100' },
    { key: 'break', value: petGunBreak, name: 'сбивка bmp:120' },
    { key: 'full', value: full, name: 'полностью bmp:120' },
    { key: 'test', value: test, name: 'тест' },
  ],
};

// pg - peterGunn
// es - enterSandman

// # hc: hiHat closed
// # ho: hiHat opened
// # sn: snare
// # bd: buss drum
