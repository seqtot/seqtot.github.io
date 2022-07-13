function getKey(note: string, symbol: string, duration: number = 25): string {
  let step = note[0];

  let fontW = ['m', 'f', 'v', 's'].find((item) => item === step) ? 800 : 400;
  let borderNone = ['d', 'z', 'n', 'b'].find((item) => item === step)
    ? 'border: none;'
    : '';
  let fontColor = 'black';

  if (note[1] === 'u') {
    borderNone = 'border: none;';
    fontColor = 'lightgray';
  }

  let border = borderNone || 'border: 1px solid grey;';

  return `<div
    style="
      box-sizing: border-box;    
      margin: 0;
      padding: 0;
      display: inline-block;
      font-size: 1.3rem;
      width: 1.3rem;
      user-select: none;
      text-align: center;
      ${border}
      color: ${fontColor};
      font-weight: ${fontW};" 

      data-note-key="b60 ${note}-${duration}"

      >${symbol}</div>`
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ');
}

//    margin: 0; display: inline-block; width: .9rem; text-align: center;
//    border: 1px solid lightgrey; border-right: none;

function getKeyboard(): string {
  const keyboard = `
<div style="
    font-family: monospace;
    user-select: none;    
    padding: .9rem; padding-left: 0;"
>
${getKey('zu', '?')}
${getKey('dy', '~')}${getKey('my', '!')}${getKey('zy', '@')}
${getKey('do', '#')}${getKey('mo', '$')}${getKey('zo', '%')}
${getKey('da', '^')}${getKey('ma', '&')}${getKey('za', '*')}
${getKey('de', '(')}${getKey('me', ')')}${getKey('ze', '_')}
<br/>
${getKey('lu', '?')}
${getKey('ty', '?')}${getKey('fy', 'q')}${getKey('ly', 'w')}
${getKey('to', 'e')}${getKey('fo', 'r')}${getKey('lo', 't')}
${getKey('ta', 'y')}${getKey('fa', 'u')}${getKey('la', 'i')}
${getKey('te', 'o')}${getKey('fe', 'p')}${getKey('le', '[')}
<br/>
${getKey('ku', '?')}
${getKey('ry', '?')}${getKey('vy', 'a')}${getKey('ky', 's')}
${getKey('ro', 'd')}${getKey('vo', 'f')}${getKey('ko', 'g')}
${getKey('ra', 'h')}${getKey('va', 'j')}${getKey('ka', 'k')}
${getKey('re', 'l')}${getKey('ve', ';')}${getKey('ke', "'")}
<br/>
${getKey('bu', '?')}
${getKey('ny', '?')}${getKey('sy', 'z')}${getKey('by', 'x')}
${getKey('no', 'c')}${getKey('so', 'v')}${getKey('bo', 'b')}
${getKey('na', 'n')}${getKey('sa', 'm')}${getKey('ba', ',')}
${getKey('ne', '.')}${getKey('se', '/')}${getKey('be', '?')}
</div>

`.replace(/\n/g, '');

  return keyboard;
}

const info = `
<div style="margin: .5rem;">

<!--b>TEST</b-->
<!--pre style="font-family: monospace; margin: .5rem 0 0;"></pre-->

${getKeyboard()}

<div style="font-size: 1.5rem; font-family: monospace;">
мо оЦу оПаХуЦу    <br/>
мо оПаЦу ЩуЦу     <br/>
бу щуПаЦу оПаХуЦу <br/>
мо оЦуЩуЩа  щуЩа  <br/>
_ ЧаЦуЦуЦа        <br/>
ро цуЩуЦуЦу йаЩуЦуЦа <br/>
мо оЦуЦаПу паЦуЦаПу  <br/>
</div>

<!--оЦуЩуЦу                               (ма)<br/>
пуЩаЩуЦу щуЩаЦа щаЩу паЦуЩу цуЦа щаЩу (мо)<br/>
о_ЩаЩуЦу щуЩаЦа щаЩу паЦуЩу цуЦа щаЩу (мо)<br/>-->

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
