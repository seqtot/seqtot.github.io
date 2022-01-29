// 1: ---------------------
// 2: ---------------------
// 3: ---------------------
// 4: ---------------------
// 5: ---------------------
// 6: ---------------------

const info = `
<div style="margin: .5rem;">
  <b>It's My Life </b>
  
  <a
    class="link external"
    href="https://www.songsterr.com/a/wsa/bon-jovi-its-my-life-4-string-bass-tab-s442387"
    target="_blank"
  >
    songsterr
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
    урок
  </a> | 
  <a
    class="link external"
    href="https://www.ackordofmine.ru/index/bon_jovi_it_96_s_my_life_tekst_pesni_s_akkordami/0-1974"
    target="_blank"
  >
    аккорды
  </a> | 


<pre style="font-family: monospace; margin: .5rem 0 0;">

основной риф
<span style="color: lightgray;">   доДо  доНоСоЗоСо</span>
3: 5-3-------0-1-0-
4: 5-3-----1-------
5: 3-3---3---------
6: 3-3-------------

<b>риф</b>
<b>куплет (1 раз)</b>
Cm   __  риф
- Cm __  риф
Cm              
-   F
<b>припев (2 раза)</b>
- Cm
- G# D#
- A# Cm
- G# A#
A# Hm Cm
<b>риф</b>

Cm                                       риф
This ain't a song for the broken-hearted
   Cm                                    риф
No silent prayer for the faith-departed
Cm                        
I ain't gonna be just a face in the crowd
             F
You're gonna hear my voice
When I shout it out loud

          Cm
It's my life
     G#           D#
It's now or never
              A#           Cm
I ain't gonna live forever
               G#              A#
I just want to live while I'm alive

A#   Hm Cm
It's my life 
                    G#           D#  
My heart is like an open highway
                    A#            Cm
Like Frankie said I did it my way
             G#              A#
I just wanna live while I'm alive

A#   Hm Cm  
It's my life 

This is for the ones who stood their ground
For Tommy and Gina who never backed down
Tomorrow's getting harder make no mistake
Luck ain't even lucky
Got to make your own breaks

It's my life
And it's now or never
I ain't gonna live forever
I just want to live while I'm alive

It's my life
My heart is like an open highway
Like Frankie said I did it my way
I just want to live while I'm alive
It's my  life 

Better stand tall when they're calling you out
Don't bend, don't break, baby, don't back down

</pre>
<br/><br/>
</div>
`;

const content = `
  ${info}
`.trim();

const parts = `
<tick4@>
-  : 1   2   3   4   :
@cowbell: x   x   x   x   :
--------------------------------------------------------------------------------
<tick3@>
-  : 1   2   3   :
@cowbell: x   x   x   :
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
<btl_Су1$>
$organ: су-100
--------------------------------------------------------------------------------
<btl_Но4$>
$organ: но-400
--------------------------------------------------------------------------------
<btl_Су3$>
$organ: су-300
--------------------------------------------------------------------------------
<btl_Су4$>
$organ: су-400
--------------------------------------------------------------------------------
<btl_СуСуСу_СуФуСу_СуФуСу$>
$organ: су-50 су-50 су-50  су-50 фу-50 су-50  су-50 фу-50 су-50
--------------------------------------------------------------------------------
<btl_До4$>
$organ: до-400
--------------------------------------------------------------------------------
<btl_До3$>
$organ: до-300
--------------------------------------------------------------------------------
<btl_До3Су1$>
$organ: до-300 су-100
--------------------------------------------------------------------------------
<btl_Фу3$>
$organ: фу-300
--------------------------------------------------------------------------------
<btl_Фу3Су1$>
$organ: фу-300 су-100
--------------------------------------------------------------------------------
<btl_Су3Ро1$>
$organ: су-300 ро-100
--------------------------------------------------------------------------------
<pause100@>
-  : 1   :
@hc:     :
--------------------------------------------------------------------------------
<pause200@>
-  : 1   2   :
@hc:         :
--------------------------------------------------------------------------------
<pause300@>
-  : 1   2   3   :
@hc:             :
--------------------------------------------------------------------------------
<pause400@>
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

const melody = `
<out b120 r1000>
tick4@
iml_Риф_drum@
iml_ThisAintASongForTheBrokenHearted_drum@
simple44_drum@-4

<out b120 r1000>
tick3@
btl_Вход@     btl_Вход_voice$
pause50$
btl_Неба@     btl_Неба_voice$
btl_ВЖизни@   btl_ВЖизни_voice$
btl_Слышишь@  btl_Слышишь_voice$
btl_Ветры@    btl_Ветры_voice$
btl_Проигрыш@ btl_Проигрыш_voice$
btl_ИВновь@   btl_ИВновь_voice$
btl_ИСердцу@  btl_ИСердцу_voice$
btl_ИЛенин@   btl_ИЛенин_voice$
btl_ИЮный@    btl_ИЮный_voice$
btl_ИЛенин@   btl_ИЛенин_voice$
btl_ИЮный@    btl_ИЮный_voice$
pause400@

<out b120 r1>
tick3@
btl_TukTuk2@ btl_Су1$
btl_test2@   btl_До4$
btl_test2@   btl_Но4$
btl_test2@   btl_Фу3Су1$
btl_testOut@ btl_До3Су1$
btl_test2@   btl_До4$
btl_test2@   btl_Но4$
btl_test2@   btl_Су3Ро1$

<out b120 r1>
tick3@
btl_TukTuk@ btl_Су1$
btl_44@     btl_До4$
btl_44@     btl_Но4$
btl_44@     btl_Фу3Су1$
btl_34@     btl_До3$
btl_TukTuk@ btl_Су1$
btl_44@     btl_До4$
btl_44@     btl_Но4$
btl_44@     btl_Су3Ро1$
btl_44@     btl_СуСуСу_СуФуСу_СуФуСу$

<pause50$>
$organ: 50

<iml_Риф_drum@>
-  : 1   |   |   |   2   |   |   |   3   |   |   |   4   |   |   |   :
@hc:         x x x x x x x x x x x x         x x x x x x x x x x x x :
@sn: x   x                           x   x       x       x       x   :
@bd: x   x     x     x     x x x     x   x         x x       x x     :

<iml_ThisAintASongForTheBrokenHearted_drum@>
-  : 1   |   |   |   2   |   |   |   3   |   |   |   4   |   |   |   :
@hc:                               x x x x x x x x x x x x x x x x x :
@sn: x                           x       x       x       x       x   :
@bd: x                         x     x       x       x       x       :

<btl_Вход@>
-  : 1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x :

<btl_Вход_voice$ b170>
$organ: му-100 су-50 ку-50 то-50 мо-50 со-50 ко-50  бу-100 ро-50 фо-50 зо-50 ра-50 d700
--------------------------------------------------------------------------------
<btl_Неба_voice$>
#     не-50 ба-50 ут-250 рен-50 не-50 го-50 стяг-100
$sax: да-50 ра-50 на-250  ра-50 на-50 фа-50   са-100 d800

<btl_Неба@>
#    Н Б У         Р Н Г С
#    е а т         е е о т
#                  н     я
#                        г
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: Н Б У         Р Н Г С           :
@sn: x x     x       x       x       :
@bd:     x       x x   x x       x   :

<btl_Неба_voice$>
#     не-50 ба-50 ут-250 рен-50 не-50 го-50 стяг-100
$sax: да-50 ра-50 на-250  ра-50 на-50 фа-50   са-100 d800
--------------------------------------------------------------------------------
<btl_ВЖизни@>
#    В Н В   Ж       П В Ш           :
#    ж и а   е       е ы а           :
#    и       н       р й г           :
#    з                               :
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: В Н В   Ж       П В Ш           :
@sn: x x     x       x       x       :
@bd:     x       x     x x       x   :


<btl_ВЖизни_voice$>
#   вжиз-50 ни-50 ва-100 жен-200 пер-50 вый-50 шаг-100
$sax: фа-50 на-50 ра-100  фа-200  на-50  ра-50  да-100 d800
--------------------------------------------------------------------------------
<btl_Слышишь@>
#    С Ш Р         Ю Н С Н О Ю       :
#    л и е         т а т о           :
#    ы ш             д р             :
#      ь               а             :
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: С Ш Р         Ю Н С Н О Ю       :
@sn: x x     x       x       x       :
@bd:     x       x x   x x       x   :

<btl_Слышишь_voice$>
#    слы-50 шишь-50 ре-250 ют-50 над-50 стра-50 но-50  о-50  ю-200
$sax: да-50   ра-50 на-250 ра-50  на-50   фа-50 са-50 за-50 са-200 d800
--------------------------------------------------------------------------------
<btl_Ветры@>
#    В Р Я         Р Н А :                                    
#    е ы           о ы   :                                  
#    т             с х   :                                
#                  т     :                               
-  : 0   1   |   |   |   :
@hc: x x x x x x x x x x :
#sn: В Р Я         Р Н А :
@sn: x x     x       x   :
@bd:     x       x x   x :

<btl_Ветры_voice$>
#     вет-50 ры-50  я-250 рост-50 ных-50  а-50
$sax:  са-50 ла-50 ка-250   ла-50  са-50 ва-50 d500
--------------------------------------------------------------------------------
<btl_Проигрыш@>
#    Т                           :
#    а                           :
#    к                           :
-  : 0   1   |   |   |   2   |   :
@hc: x x x x x x x x x x x x x x :
@sn: Т   x   x   x x x   x x x   :
@bd: x   x   x   x x x   x x x   :

<btl_Проигрыш_voice$>
#     так-50
$sax:  са-50 d700
--------------------------------------------------------------------------------
<btl_ИВновь@>
#    И   В   П Д Ж Е   С Б           :
#        н   р о а т   я о           :
#        о   о л         й           :
#        в                           :
#        ь                           :
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: И   В   П Д Ж Е   С Б           :
@sn: x       x       x       x       :
@bd:     x     x x x   x x       x   :

<btl_ИВновь_voice$>
#      и-100 вновь-100 про-50 дол-50 жа-50 ет-100 ся-50 бой-100
$sax: са-100    за-100  фа-50  на-50 ра-50 да-100 бо-50  да-100 d800
--------------------------------------------------------------------------------
<btl_ИСердцу@>
#    И   С   Ц Т В Н   В Д           :
#        е   у р о о   г и           :
#        р     е ж     р             :
#        д             у             :
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: И   С   Ц Т В Н   В Д           :
@sn: x       x       x       x       :
@bd:     x     x x x   x x       x   :

<btl_ИСердцу_voice$>
#      и-100 серд-100 цу-50 тре-50 вож-50 но-100 вгру-50 ди-250
$sax: са-100   за-100 фа-50  на-50  ра-50 да-100   ко-50 са-250 d800
--------------------------------------------------------------------------------
<btl_ИЛенин@>
#    И   Л   Н       Т   К   М Л Д   :
#        е   и       а   о   о о о   :
#            н           й       й   :
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: И   Л   Н       Т   К   М Л Д   :
@sn: x       x       x       x       :
@bd:     x       x       x     x x   :

<btl_ИЛенин_voice$>
#     и-100  ле-100 нин-200 та-100 кой-100 мо-50 ло-50 дой-100 
$sax: на-100 де-100  де-200 ре-100  не-100 ре-50 де-50  ка-100 d800
--------------------------------------------------------------------------------
<btl_ИЮный@>
#    И   Ю Н   О Т   В Р Д           :
#        н ы   к я   п е и           :
#          й     р   е               :
#                ь                   :
-  : 0   1   |   |   |   2   |   |   :
@hc: x x x x x x x x x x x x x x x x :
#sn: И   Ю Н   О Т   В Р Д           :
@sn: x       x       x       x       :
@bd:     x x   x x     x x       x   :

<btl_ИЮный_voice$>
#     и-100   ю-50 ный-100 ок-50 тябрь-100 впе-50 ре-50 ди-100
$sax: де-100 за-50  фа-100 на-50    ра-100  да-50 бо-50 да-100 d800
--------------------------------------------------------------------------------

<btl_TukTuk@>
-  : 1   :
@sn: x x :

<btl_44@>
-  : 1     2     3     4     :
@hc: x  x  x  x  x  x  x  x  :
@sn:       2           4     :
@bd: 1           3           :

<btl_34@>
-  : 1     2     3     :
@hc: x  x  x  x  x  x  :
@sn:       2           :
@bd: 1           3     :

<btl_14@>
-  : 1     :
@hc: x  x  :
@sn:       :
@bd: 1     :

<btl_test1$>
$organ: да-50 ра-50

<btl_test2$>
$organ: на-50 на-50 на-50  на-50 на-50 ра-50  на-50 фа-50

<btl_TukTuk2@>
-  : 1   :
@sn: x x :

<btl_test2@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn: x     x     x   :
@bd:    xx     x     :

<btl_testOut@>
-  : 1   2   3   4   :
@hc: x x x x x x     :
@sn: x     x     x x :
@bd:    xx    xx     :

${parts}
`;

const beat44 = `
<out b120 r1000>
simple44@

<simple44@>
-  : 1   2   3   4   :
@hc: x x x x x x x x :
@sn:     2       4   :
@bd: 1       3       :
`.trim();

const test2 = `
<out b70 r1>
tick4@

Вступление_harm$
Умолчали_melo$
Стыли_melo$
Вдохи_melo$
Хриплым_melo$

Вступление_harm$
Умолчали_melo$
Стыли_melo$
Вдохи_melo$
Хриплым_melo$

<Вступление_harm$>
#sax:    d1550 де-150 ме-200 ме-50 | ре-25 де-25 ла-25 де-25 ла-250 са-175 ла-25 ба-25 де-25 де-100 ба-25 ла-25 са-50 | 150 ма-25 ра-25 бо-25 ло-25 со-100
#$organ: d1550 ДО-200 БУ-200 ЛУ-400 МУ-200 ДО-200 МУ-400 
#              C            G/h          Am           Em           C           Em
$organ:  d1550 ДО+мо+со-200 бу+ро+СО-200 ЛУ+до+мо-400 МУ+су+бу-200 ДО+мо+со-200 МУ+су+бу-400 

<Умолчали_melo$>
#          у      мол   | ча    ли           ву    зо    ры    | ча    ры 
$sax: d800 да-25  ра-25 | ма-25 ма-75 100 75 ма-25 ло-75 со-25 | ло-25 ло-175 100 50
#                         C            Em7               Am            G
$organ: d800 50         | ДО+мо+со-200 бу+ро+МО+со-200 | ЛУ+до+мо-200  СУ+бу+ро-200 |

<Стыли_melo$>
#         сты-25 ли-75 | ве-25 ки-125 100 вплач-50 во-25 ро-25 жей-200 150
$sax: d800 ма-25 ма-75 | ло-25 со-125 100    со-50 со-25 со-25  мо-200 150
#                 Em           C(Am7)         Em(7)
$organ: d800 50 | МУ+су+бу-200 ДО+мо+со-200 | МУ+су+бу-400

<Вдохи_melo$>
#           вдо-25  хи-25 | за-25 ры-175 100 50 за-25 мер-25 за-25 ли-175 100 50
$sax:   d800 да-25  ра-25 | ма-25 ма-175 100 50 ло-25  со-25 ло-25 ло-175 100 50
#                           C            Em7               Am           G
$organ: d800 50           | ДО+мо+со-200 бу+ро+МО+со-200 | ЛУ+до+мо-200 СУ+бу+ро-200 |

# C     ДО+мо+со
# G/h   бу+ро+СО
# Am    ЛУ+до+мо
# Em    МУ+су+бу
# Em7/h бу+ро+МО+со
# G     СУ+бу+ро

<Хриплым_melo$>
#          хрип-25 лым-50 кри-25  и-25 ком-125  100 50 во-25 жа-25 рей-100 100 200
$sax:   d850 ма-25  ма-50  бо-25 ло-25  со-125  100 50 со-25 мо-25  мо-100 100 200
#                 Em           C(Am7)         Em(7)
$organ: d850 50 | МУ+су+бу-200 ДО+мо+со-200 | МУ+су+бу-400

# ДО-200 БУ-200 | ЛУ-400        ||  C  G/H    | Am     |
# МУ-200 ДО-200 | МУ-400        ||  Em C      | Em     |
#                                                      |
# ДО-200 МУ-200 | ЛУ-200 СУ-200 ||  C Em7/H   | Am G?  |
# МУ-200 ДО-200 | МУ-400        ||  Em C      | Em     |

${parts}

`.trim();

export default {
  content,
  tracks: [
    { key: 'beat44', value: beat44, name: 'бит 4/4: bpm120' },
    { key: 'harmony', value: melody, name: 'Мелодия: bpm:120' },
    // { key: 'test', value: test, name: 'Тест' },
    // { key: 'test2', value: test2, name: 'Тест2' },
  ],
};

// https://ale07.ru/music/notes/km.htm - ноты
// https://www.youtube.com/watch?v=_BdCuM9xkOk - бас
// https://www.youtube.com/watch?v=vLC44hBcnjk - минус

// C-200 G/H-200 | Am-400 | Em-200 C-200 | Em-400

// умолчали в узоры чары
//               C               Em7
// у-да-25 мол-ра-25 | ча-ма-25 ли-ма-75 100 75 ву-ма-25 зо-ло-75 ры-со-25 |

// Kelly Mac & Aaron John Shapiro - Entrance
