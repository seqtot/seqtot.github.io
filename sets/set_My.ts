function getKeyFn(
  id: string | number
): (note: string, symbol: string) => string {
  id = id || '';

  return (note: string, symbol: string): string => {
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
        font-size: 1.3rem;
        width: 1.5rem;
        user-select: none;
        text-align: center;
        ${border}
        color: ${fontColor};
        font-weight: ${fontW};" 
        data-note-key="b60 ${note}-${25}"
        data-name="note-val-${note}"
        data-note-lat="${note}"
        data-keyboard-id="${id}"

        >${symbol}</div>`
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ');
  };
} // getKeyFn

function getGuitarKeyboard(id?: number | string): string {
  id = id || '';

  const getKey = getKeyFn(id);
  const _ = '&nbsp;';

  const keyboard = `
<div style="
    font-family: monospace;
    user-select: none;    
    padding: 0.5rem 0 0.5rem 0.5rem;"
    data-name="keyboard-${id}"
>
${getKey('my', 'М')}${getKey('ly', 'Л')}${getKey('ro', 'Р')}
${getKey('so', 'С')}${getKey('bo', 'Б')}${getKey('ma', 'М')}
<br/>
${getKey('fy', 'ф')}${getKey('ky', _)}${getKey('no', _)}
${getKey('zo', _)}${getKey('da', 'д')}${getKey('fa', 'ф')}
<br/>
${getKey('vy', _)}${getKey('by', 'б')}${getKey('mo', 'м')}
${getKey('lo', 'л')}${getKey('ta', _)}${getKey('va', _)}
<br/>
${getKey('sy', 'с')}${getKey('do', 'д')}${getKey('fo', 'ф')}
${getKey('ko', _)}${getKey('ra', 'р')}${getKey('sa', 'c')}
<br/>
${getKey('zy', _)}${getKey('to', _)}${getKey('vo', _)}
${getKey('bo', 'б')}${getKey('na', _)}${getKey('za', _)}
<br/>
${getKey('ly', 'л')}${getKey('ro', 'р')}${getKey('so', 'c')}
${getKey('da', 'д')}${getKey('ma', 'м')}${getKey('la', 'л')}
<br/>
${getKey('ky', _)}${getKey('no', _)}${getKey('zo', _)}
${getKey('ta', _)}${getKey('fa', 'ф')}${getKey('ka', _)}
<br/>
${getKey('by', 'б')}${getKey('mo', 'м')}${getKey('lo', 'л')}
${getKey('ra', 'р')}${getKey('va', _)}${getKey('ba', 'б')}
<br/>
${getKey('do', 'д')}${getKey('fo', 'ф')}${getKey('ko', _)}
${getKey('na', _)}${getKey('sa', 'с')}${getKey('de', 'д')}
<br/>
${getKey('to', _)}${getKey('vo', _)}${getKey('bo', 'б')}
${getKey('ma', 'м')}${getKey('za', _)}${getKey('te', _)}
<br/>
${getKey('ro', 'р')}${getKey('so', `с`)}${getKey('da', 'д')}
${getKey('fa', 'ф')}${getKey('la', 'л')}${getKey('re', 'р')}
<br/>
${getKey('no', _)}${getKey('zo', _)}${getKey('ta', _)}
${getKey('va', _)}${getKey('ka', _)}${getKey('ne', _)}
<br/>
${getKey('mo', 'м')}${getKey('lo', 'л')}${getKey('ra', 'р')}
${getKey('sa', 'с')}${getKey('ba', 'б')}${getKey('me', 'м')}
</div>

`.replace(/\n/g, '');

  return keyboard;
}

const info = `
<div style="margin: .5rem; user-select: none;">



${getKeyboard(1)}
<span style="user-select: none; font-size: 1.5rem" data-name="clear-keys-color">
  clr&nbsp;&nbsp;
</span>
<span style="user-select: none; font-size: 1.5rem" data-name="select-random-key">
  rnd&nbsp;&nbsp;
</span>
${getKeyboard(2)}

<!--div style="font-size: 1.5rem; font-family: monospace; user-select: none;">
  моЦу оПаХуЦу    <br/>
  моПаЦу ЩуЦу     <br/>
  буПаЦу оПаХуЦу <br/>
  моЦуЩуЩа  щуЩа  <br/>
  воЦуЦуЦа цуЩуЦуЦу <br/>
  соЩуЦуЦа <br/>
  моЦуЦаПу паЦуЦаПу  <br/>
</div-->

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
    //{ key: 'beat44', value: beat44, name: 'бит 4/4: bpm120' },
    // { key: 'harmony', value: melody, name: 'Барабан: bpm:120' },
  ],
  hideMetronome: true,
};

function getKeyStep(
  step: string,
  symbol: string,
  borders: string = '',
  bg: string = 'white'
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

  if (borders.includes('t')) {
    borderSide += 'border-top: 3px solid black;';
  }

  if (borders.includes('r')) {
    borderSide += 'border-right: 3px solid black;';
  }

  if (borders.includes('b')) {
    borderSide += 'border-bottom: 3px solid black;';
  }

  if (borders.includes('l')) {
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
      background-color: ${bg};
      font-weight: ${fontWeight};" 
      data-name="note-step:${step}"
      data-relative-key="${step}"
      >${symbol}</div>`
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ');
}

function getKeyboard2(): string {
  return `

<div data-relative-key="0" style="font-size: 1.5rem; user-select: none;">
даПуЩаЦаЦу 
со8аЩуЦуЦаЦу 
наЩуЦуЦа 
даЩаЩуПуЩаЦа 
даЩаХуЦуЦу 
саЩа7уЧа 
наХуЦуЦу 
даЩаХуЦуЦу 
даЩаХуЦуЦу 
ко9аЩаЦуХуЦуЦу 
наХуЦуЦу 
наХуЦу 
</div>

<div
  style="display: flex; flex-direction: column; align-items: center; user-select: none;"
  data-name="relative-keyboard-wrapper"
  data-relative-keyboard-base="do"
>

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
${getKeyStep('-05', 'пу', 'r')}
${getKeyStep('05', 'па', 'l')}
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

<div style="user-select: none;">
${getKeyStep('-16', '16', 'tlr')}
${getKeyStep('-15', '15', 'tb')}
${getKeyStep('-14', '14', 't')}
${getKeyStep('-13', '13', 'tr')}
${getKeyStep('13', '13', 'lt')}
${getKeyStep('14', '14', 't')}
${getKeyStep('15', '15', 'tb')}
${getKeyStep('16', '16', 'trl')}
</div>

<div style="user-select: none;">
${getKeyStep('-20', '20', 'l')}
${getKeyStep('-19', '19', 'r')}
${getKeyStep('-18', '18', 'b')}
${getKeyStep('-17', '17', 'r')}
${getKeyStep('17', '17', 'l')}
${getKeyStep('18', '18', 'b')}
${getKeyStep('19', '19', 'l')}
${getKeyStep('20', '20', 'r')}
</div>

<div style="user-select: none;">
${getKeyStep('-24', '24', 'lb')}
${getKeyStep('-23', '23', 'b')}
${getKeyStep('-22', '22', 'b')}
${getKeyStep('-21', '21', 'rbl')}
${getKeyStep('21', '21', 'lbr')}
${getKeyStep('22', '22', 'b')}
${getKeyStep('23', '23', 'b')}
${getKeyStep('24', '24', 'br')}
</div>

</div>


`.replace(/\n/g, '');
}

function getKeyboard(id?: number | string): string {
  id = id || '';

  const getKey = getKeyFn(id);

  const keyboard = `
<div style="
    font-family: monospace;
    user-select: none;    
    padding: 0.5rem 0 0.5rem 0.5rem;"
    data-name="keyboard-${id}"
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
