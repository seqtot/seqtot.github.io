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
--------------------------------------------------------------------------------
<pause50$>
$organ: 50


`.trim();

const melody = `
<out b120 r1000>
iml_IAintGonnaBeJustAFaceInTheCrowd_YoureGonnaHearMyVoiceWhenIShoutItOutLoud_drum@
iml_ItsMyLife_ItsNowOrNever_drum@

tick4@
iml_Риф_drum@
iml_ThisAintASongForTheBrokenHearted_drum@
iml_NoSilentPrayerForTheFaithDeparted_drum@
iml_IAintGonnaBeJustAFaceInTheCrowd_YoureGonnaHearMyVoiceWhenIShoutItOutLoud_drum@
iml_ItsMyLife_ItsNowOrNever_drum@

#simple44_drum@-4
pause400@

<iml_ItsMyLife_ItsNowOrNever_drum@>
-  : |   |   1   |   |   |   2   |   |   |   3   |   :
@hc:         x   x x x x x x x x x x x x x x x x x x :
@sn:             x       x       x       x       x   :
@bd:         x       x       x       x       x       :

<iml_IAintGonnaBeJustAFaceInTheCrowd_YoureGonnaHearMyVoiceWhenIShoutItOutLoud_drum@>
-  : 1   |   |   |   2   |   |   |   3   |   |   |   4   |   |   |   5   |   :
@hc: x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x         :
@sn:     2       4       2       4       2       4       2       4   x   x   :
@bd: 1       3       1       3       1       3       1       3       x   x   :

<iml_NoSilentPrayerForTheFaithDeparted_drum@>
-  : 1   |   |   |   2   |   |   |   3   |   |   |   4   |   |   |   :
@hc: x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x :
@sn:     2       4       2       4       2       4       2       4   :
@bd: 1       3       1       3       1       3       1       3       :

<iml_ThisAintASongForTheBrokenHearted_drum@>
-  : 1   |   |   |   2   |   |   |   3   |   |   |   4   |   |   |   :
@hc:                               x x x x x x x x x x x x x x x x x :
@sn: x                           x       x       x       x       x   :
@bd: x                         x     x       x       x       x       :

<iml_Риф_drum@>
-  : 1   |   |   |   2   |   |   |   3   |   |   |   4   |   |   |   :
@hc:         x x x x x x x x x x x x         x x x x x x x x x x x x :
@sn: x   x                           x   x       x       x       x   :
@bd: x   x     x     x     x x x     x   x         x x       x x     :


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

export default {
  content,
  tracks: [
    { key: 'beat44', value: beat44, name: 'бит 4/4: bpm120' },
    // { key: 'harmony', value: melody, name: 'Барабан: bpm:120' },
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
