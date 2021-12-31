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
<tick@ b120>
-  : 1   2   3   4   :
@sn: x   x   x   x   :
--------------------------------------------------------------------------------
<simple44@ b120>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
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
<pause@ b120>
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

const petGunBreak = `
<out b120 r1>
tick@
simple44@-1 pgMain$-1
pgOut@ pgOut$
pgBreakOnE1@ pgBrakeOnE1$
pgBreakOnH@  pgBreakOnH$
hat8@-1
hat@-1 pgIntro$-1
pause@

<out b120 r1>
tick@
simple44@-2 pgMain$-2
simple44@-1 pgToEs$-1
esSyMyVyMy@-1 esSyMyVyMy$
simple44@-2 pgMain$-2
simple44@-1 pgToEs$-1
esSyMyVyMy@-1 esSyMyVyMy$
pause@

${parts}
`;

const drums = `
<out b120 r1>
tick@
hat@-2 pgIntro$-2
simple44@-2 pgMain$-2
simple44@-8 pgMain$-8
simple44@-7 pgMain$-7
pgOut@ pgOut$
pgBreakOnE1@ pgBrakeOnE1$
pgBreakOnH@  pgBreakOnH$
hat8@-1

hat@-2 pgIntro$-2
simple44@-2 pgMain$-2
simple44@-1 pgToEs$-1
esSyMyVyMy@-1 esSyMyVyMy$
simple44@-2 pgMain$-2
simple44@-1 pgToEs$-1
esSyMyVyMy@-1 esSyMyVyMy$

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

export default {
  content,
  drums,
  break: petGunBreak,
  tracks: [{ key: 'beat44', value: beat44, name: 'бит 4/4' }],
};
