function getKeyStep(
  step: string,
  symbol: string,
  withBorder: string = '',
  bgColor: string = 'white'
): string {
  // let step = note[0];

  //let fontW = ['m', 'f', 'v', 's'].find((item) => item === step) ? 800 : 400;
  // let borderNone = ['d', 'z', 'n', 'b'].find((item) => item === step)
  //   ? 'border: none;'
  //   : '';
  let fontColor = 'black';

  // if (note[1] === 'u') {
  //   borderNone = 'border: none;';
  //   // fontColor = 'lightgray';
  // }

  //let border = borderNone || 'border: 1px solid grey;';
  let border = 'border: 1px solid grey;';
  let borderSide = '';

  if (withBorder.includes('t')) {
    borderSide += 'border-top: 3px solid black;';
  }

  if (withBorder.includes('r')) {
    borderSide += 'border-right: 3px solid black;';
  }

  if (withBorder.includes('b')) {
    borderSide += 'border-bottom: 3px solid black;';
  }

  if (withBorder.includes('l')) {
    borderSide += 'border-left: 3px solid black;';
  }

  let fontWeight = 400;

  return `<div
    style="
      box-sizing: border-box;    
      margin: 0;
      padding: 0;
      display: inline-block;
      font-size: 1.3rem;
      width: 2.3rem;
      height: 2.3rem;
      user-select: none;
      text-align: center;
      ${border}
      ${borderSide}
      color: ${fontColor};
      background-color: ${bgColor};
      font-weight: ${fontWeight};" 
      data-name="note-step:${step}"
      data-relative-key="${step}"
      >${symbol}</div>`
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ');
}

function getKey(note: string, symbol: string, duration: number = 25): string {
  let step = note[0];

  let fontW = ['m', 'f', 'v', 's'].find((item) => item === step) ? 800 : 400;
  let borderNone = ['d', 'z', 'n', 'b'].find((item) => item === step)
    ? 'border: none;'
    : '';
  let fontColor = 'black';

  if (note[1] === 'u') {
    borderNone = 'border: none;';
    // fontColor = 'lightgray';
  }

  let border = borderNone || 'border: 1px solid grey;';

  return `<div
    style="
      box-sizing: border-box;    
      margin: 0;
      padding: 0;
      display: inline-block;
      font-size: 1.5rem;
      width: 1.5rem;
      user-select: none;
      text-align: center;
      ${border}
      color: ${fontColor};
      font-weight: ${fontW};" 

      data-note-key="b60 ${note}-${duration}"
      data-name="note-val-${note}"

      >${symbol}</div>`
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ');
}

//    margin: 0; display: inline-block; width: .9rem; text-align: center;
//    border: 1px solid lightgrey; border-right: none;

function getKeyboard2(): string {
  return `
<div 
  style="
    display: flex; flex-direction: column; align-items: center; user-select: none;
  "
  data-name="relative-keyboard-wrapper"
  data-relative-keyboard-base=""
>

<div >
<span data-set-note data-name="set-note-dy" style="user-select: none; margin-right: .5rem;">dy</span>
<span data-set-note data-name="set-note-ty" style="user-select: none; margin-right: .5rem;">ty</span>
<span data-set-note data-name="set-note-ry" style="user-select: none; margin-right: .5rem;">ry</span>
<span data-set-note data-name="set-note-ny" style="user-select: none; margin-right: .5rem;">ny</span>
<span data-set-note data-name="set-note-my" style="user-select: none; margin-right: .5rem;">my</span>
<span data-set-note data-name="set-note-fy" style="user-select: none; margin-right: .5rem;">fy</span>
<span data-set-note data-name="set-note-vy" style="user-select: none; margin-right: .5rem;">vy</span>
<span data-set-note data-name="set-note-sy" style="user-select: none; margin-right: .5rem;">sy</span>
<span data-set-note data-name="set-note-zy" style="user-select: none; margin-right: .5rem;">zy</span>
<span data-set-note data-name="set-note-ly" style="user-select: none; margin-right: .5rem;">ly</span>
<span data-set-note data-name="set-note-ky" style="user-select: none; margin-right: .5rem;">ky</span>
<span data-set-note data-name="set-note-by" style="user-select: none; margin-right: .5rem;">by</span>
</div>

<div>
<span data-set-note data-name="set-note-do" style="user-select: none; margin-right: .5rem;">do</span>
<span data-set-note data-name="set-note-to" style="user-select: none; margin-right: .5rem;">to</span>
<span data-set-note data-name="set-note-ro" style="user-select: none; margin-right: .5rem;">ro</span>
<span data-set-note data-name="set-note-no" style="user-select: none; margin-right: .5rem;">no</span>
<span data-set-note data-name="set-note-mo" style="user-select: none; margin-right: .5rem;">mo</span>
<span data-set-note data-name="set-note-fo" style="user-select: none; margin-right: .5rem;">fo</span>
<span data-set-note data-name="set-note-vo" style="user-select: none; margin-right: .5rem;">vo</span>
<span data-set-note data-name="set-note-so" style="user-select: none; margin-right: .5rem;">so</span>
<span data-set-note data-name="set-note-zo" style="user-select: none; margin-right: .5rem;">zo</span>
<span data-set-note data-name="set-note-lo" style="user-select: none; margin-right: .5rem;">lo</span>
<span data-set-note data-name="set-note-ko" style="user-select: none; margin-right: .5rem;">ko</span>
<span data-set-note data-name="set-note-bo" style="user-select: none; margin-right: .5rem;">bo</span>
</div>

<div data-relative-key="0" style="font-size: 1.5rem; user-select: none;">
оХуХаЦаХа оЦаЦа оЦаЦуЦуЦуХу
</div>

<div style="display: flex; flex-direction: column; align-items: center; user-select: none;">

<div style="user-select: none;">
${getKeyStep('-04', 'чу', 'tl')}
${getKeyStep('-03', 'щу', 't')}
${getKeyStep('-02', 'цу', 'trb')}
${getKeyStep('-01', 'ху', 'tr')}
${getKeyStep('01', 'ха', 'lt')}
${getKeyStep('02', 'ца', 'ltb')}
${getKeyStep('03', 'ща', 't')}
${getKeyStep('04', 'ча', 'tr')}
</div>

<div style="user-select: none;">
${getKeyStep('-08', '8y', 'l')}
${getKeyStep('-07', '7y', 'rb')}
${getKeyStep('-06', 'шу', '')}
${getKeyStep('-05', 'пу', 'r', 'orange')}
${getKeyStep('05', 'па', 'l', 'orange')}
${getKeyStep('06', 'ша', '')}
${getKeyStep('07', '7а', 'lb')}
${getKeyStep('08', '8а', 'r')}
</div>

<div style="user-select: none;">
${getKeyStep('-12', 'ю', 'rbl')}
${getKeyStep('-11', 'гу', 'b')}
${getKeyStep('-10', 'жу', 'b')}
${getKeyStep('-09', '9у', 'rb')}
${getKeyStep('09', '9а', 'lb')}
${getKeyStep('10', 'жа', 'b')}
${getKeyStep('11', 'га', 'b')}
${getKeyStep('12', 'я', 'lbr')}
</div>

<!-- -->

<div style="user-select: none;">
${getKeyStep('-16', '16', 'tl')}
${getKeyStep('-15', '15', 't')}
${getKeyStep('-14', '14', 'trb')}
${getKeyStep('-13', '13', 'tr')}
${getKeyStep('13', '13', 'lt')}
${getKeyStep('14', '14', 'ltb')}
${getKeyStep('15', '15', 't')}
${getKeyStep('16', '16', 'tr')}
</div>

<div style="user-select: none;">
${getKeyStep('-20', '20', 'l')}
${getKeyStep('-19', '19', 'rb')}
${getKeyStep('-18', '18', '')}
${getKeyStep('-17', '17', 'r', 'orange')}
${getKeyStep('17', '17', 'l', 'orange')}
${getKeyStep('18', '18', '')}
${getKeyStep('19', '19', 'lb')}
${getKeyStep('20', '20', 'r')}
</div>

<div style="user-select: none;">
${getKeyStep('-24', '24', 'rbl')}
${getKeyStep('-23', '23', 'b')}
${getKeyStep('-22', '22', 'b')}
${getKeyStep('-21', '21', 'rb')}
${getKeyStep('21', '21', 'lb')}
${getKeyStep('22', '22', 'b')}
${getKeyStep('23', '23', 'b')}
${getKeyStep('24', '24', 'lbr')}
</div>

</div>

</div>


`.replace(/\n/g, '');
}

function getKeyboard(): string {
  const keyboard = `
<div style="
    font-family: monospace;
    user-select: none;    
    padding: 0.5rem 0 0.5rem 0.5rem;"
>
${getKey('dy', '~')}${getKey('my', '!')}${getKey('zy', '@')}
${getKey('do', '#')}${getKey('mo', '$')}${getKey('zo', '%')}
${getKey('da', '^')}${getKey('ma', '&')}${getKey('za', '*')}
${getKey('de', '(')}${getKey('me', ')')}${getKey('ze', '_')}
<br/>
${getKey('ty', '?')}${getKey('fy', 'q')}${getKey('ly', 'w')}
${getKey('to', 'e')}${getKey('fo', 'r')}${getKey('lo', 't')}
${getKey('ta', 'y')}${getKey('fa', 'u')}${getKey('la', 'i')}
${getKey('te', 'o')}${getKey('fe', 'p')}${getKey('le', '[')}
<br/>
${getKey('ry', '?')}${getKey('vy', 'a')}${getKey('ky', 's')}
${getKey('ro', 'd')}${getKey('vo', 'f')}${getKey('ko', 'g')}
${getKey('ra', 'h')}${getKey('va', 'j')}${getKey('ka', 'k')}
${getKey('re', 'l')}${getKey('ve', ';')}${getKey('ke', "'")}
<br/>
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

${getKeyboard2()}
<br/>

${getKey('bu', 'бы')}
<span style="user-select: none; font-size: 1.5rem" data-name="clear-keys-color">
  &nbsp;&nbsp;&nbsp;!clr
</span>
<span style="user-select: none; font-size: 1.5rem" data-name="select-random-key">
  &nbsp;&nbsp;!rnd
</span>

${getKeyboard()}

<div style="font-size: 1.5rem; font-family: monospace;">
моЦу оПаХуЦу    <br/>
моПаЦу ЩуЦу     <br/>
буПаЦу оПаХуЦу <br/>
моЦуЩуЩа  щуЩа  <br/>
воЦуЦуЦа цуЩуЦуЦу <br/>
соЩуЦуЦа <br/>
моЦуЦаПу паЦуЦаПу  <br/>
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
