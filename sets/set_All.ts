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
</div>
`;

const peterGunn = `<div style="margin: .5rem;">
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
</div>
`;

const blackNight = `<div style="margin: .5rem;">
  <b>Black Night</b>
  <a 
    class="link external"
    href="https://www.youtube.com/watch?v=QuAKMlfxX7I"
    target="_blank"
  >
    youtube
  </a> |
  <a 
    class="link external"
    href="https://www.songsterr.com/a/wsa/deep-purple-black-night-tab-s23516t6"
    target="_blank"
  >
      tabs
    </a>
</div>`;

const itsMyLife = `<div style="margin: .5rem;">
  <b>It's My Life </b>
  
  <a
    class="link external"
    href="https://www.songsterr.com/a/wsa/bon-jovi-its-my-life-4-string-bass-tab-s442387"
    target="_blank"
  >
    tabs
  </a> |  
  <a
    class="link external"
    href="https://www.youtube.com/watch?v=vx2u5uUu3DE"
    target="_blank"
  >
    youtube
  </a> |
  <a
    class="link external"
    href="https://www.youtube.com/watch?v=3Npebqu-rl8"
    target="_blank"
  >
    lesson
  </a> | 
  <a
    class="link external"
    href="https://www.ackordofmine.ru/index/bon_jovi_it_96_s_my_life_tekst_pesni_s_akkordami/0-1974"
    target="_blank"
  >
    chords
  </a> |
</div>`;

const pacificZodiac = `<div style="margin: .5rem;">
  <b>Pacific (Zodiac, 1980)</b>
  <a 
    class="link external"
    href="https://www.youtube.com/watch?v=W33mp0TYVv8"
    target="_blank"
  >
    youtube
  </a> |
  <a 
    class="link external"
    href="https://www.youtube.com/watch?v=eNoKyYsbuNA"
    target="_blank"
  >
      lesson
    </a>
</div>`;

const agressiveSamurai = `<div style="margin: .5rem;">
  <b>Agressive (Samurai)</b>
  <a 
    class="link external"
    href="https://www.youtube.com/watch?v=jVtuIMm52aQ"
    target="_blank"
  >
    youtube
  </a>
</div>`;

const sweetChild = `<div style="margin: .5rem;">
  <b>Sweet Child O' Mine (Guns N' Roses, 1988)</b>
  <a 
    class="link external"
    href="https://www.youtube.com/watch?v=1w7OgIMMRc4"
    target="_blank"
  >
    youtube
  </a> |
  <a 
    class="link external"
    href="https://www.songsterr.com/a/wsa/guns-n-roses-sweet-child-o-mine-standard-tunning-tab-s412809"
    target="_blank"
  >
      tabs
  </a>

</div>`;

//

const content = `
  ${peterGunn}
  ${enterSandmen}
  ${blackNight}
  ${itsMyLife}
  ${pacificZodiac}
  ${agressiveSamurai}
  ${sweetChild}
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
