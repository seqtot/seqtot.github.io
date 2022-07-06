const info = `
<div style="margin: .5rem;">
  <b>TEST</b>
  
<pre style="font-family: monospace; margin: .5rem 0 0;">
</pre>

<div style="font-size: 1.1rem; font-family: monospace;">

<a data-note-line="b60 бы-50">бы|</a>
&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br/>
<a data-note-line="b60 ду-50">~</a>
<a data-note-line="b60 му-50">!</a>
<a data-note-line="b60 зу-50">@</a>
<a data-note-line="b60 до-50">#</a>
<a data-note-line="b60 мо-50">$</a>
<a data-note-line="b60 зо-50">%</a>
<a data-note-line="b60 да-50">^</a>
<a data-note-line="b60 ма-50">&</a>
<a data-note-line="b60 за-50">*</a>
<a data-note-line="b60 де-50">(</a>
<a data-note-line="b60 ме-50">)</a>
<a data-note-line="b60 зе-50">_</a>
<br/>
<a data-note-line="b60 ту-50">?</a>
<a data-note-line="b60 фу-50">q</a>
<a data-note-line="b60 лу-50">w</a>
<a data-note-line="b60 то-50">e</a>
<a data-note-line="b60 фо-50">r</a>
<a data-note-line="b60 ло-50">t</a>
<a data-note-line="b60 та-50">y</a>
<a data-note-line="b60 фа-50">u</a>
<a data-note-line="b60 ла-50">i</a>
<a data-note-line="b60 те-50">o</a>
<a data-note-line="b60 фе-50">p</a>
<a data-note-line="b60 ле-50">[</a>
<br/>
<a data-note-line="b60 ру-50">?</a>
<a data-note-line="b60 ву-50">a</a>
<a data-note-line="b60 ку-50">s</a>
<a data-note-line="b60 ро-50">d</a>
<a data-note-line="b60 во-50">f</a>
<a data-note-line="b60 ко-50">g</a>
<a data-note-line="b60 ра-50">h</a>
<a data-note-line="b60 ва-50">j</a>
<a data-note-line="b60 ка-50">k</a>
<a data-note-line="b60 ре-50">l</a>
<a data-note-line="b60 ве-50">;</a>
<a data-note-line="b60 ке-50">'</a>
<br/>
<a data-note-line="b60 ну-50">?</a>
<a data-note-line="b60 су-50">z</a>
<a data-note-line="b60 бу-50">x</a>
<a data-note-line="b60 но-50">c</a>
<a data-note-line="b60 со-50">v</a>
<a data-note-line="b60 бо-50">b</a>
<a data-note-line="b60 на-50">n</a>
<a data-note-line="b60 са-50">m</a>
<a data-note-line="b60 ба-50">,</a>
<a data-note-line="b60 не-50">.</a>
<a data-note-line="b60 се-50">/</a>
<a data-note-line="b60 бе-50">?</a>
</div>

<br/>

<div style="font-size: 1.75rem; font-family: monospace;">


<!-- Am -->

<a data-note-line="b60 лу-100">wA  1=</a><br/>

<a data-note-line="b60 лу-100 мо-100 ло-100 мо-100">лу7аПаПу</a>
<a data-note-line="b60 лу-100 мо-100 да-100 мо-100">лу7а8а8у</a>

<br/>

<a data-note-line="b60 мо-100">$E 3=</a><br/>
<a data-note-line="b60 мо-100 да-100 мо-100 да-100">мо8а8y8а</a>
<a data-note-line="b60 мо-100 та-100 мо-100 та-100">мо9а9y9а</a>

<!-- Am --> <br/><br/>

<!-- E -->
<a data-note-line="b60 му-100">
  !E -1-
</a>
<br/>
<a data-note-line="b60 му-100 бу-100 мо-100 бу-100">му7аПаПу</a>
<a data-note-line="b60 му-100 бу-100 зо-100 бу-100">му7а9а9у</a>
<br/>

<a data-note-line="b60 зо-100">%G# 4=  %Ab 5-</a><br/>
<a data-note-line="b60 зо-100 бу-100 зо-100 бу-100">зо9у9а9у</a>

<!-- E --> <br/><br/>


<!-- G -->

<a data-note-line="b60 су-100">zG  1-</a><br/>

<a data-note-line="b60 су-100 ро-100 со-100 ро-100">су7аПаПу</a>
<a data-note-line="b60 су-100 ро-100 бо-100 ро-100">су7а9а9у</a>

<br/>

<a data-note-line="b60 бо-100">bB 5=</a><br/>
<a data-note-line="b60 бо-100 ро-100 бо-100 ро-100">бо9у9а9у</a>

<!-- G --><br/><br/>

<a data-note-line="b60 лу-100 до-100 му-100 зу-100">луЩа8уЧа</a><br/>
<a data-note-line="b60 лу-100 ду-100 му-100 ду-100">Ха9уЧаЧу(9а)</a><br/>


</div>

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
