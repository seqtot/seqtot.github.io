'use babel';

// https://codemirror.net/mode/cobol/index.html
// https://github.com/codemirror/codemirror

// red     hsl(0,   100%, 50%)  rgb(255, 0, 0)
// orange  hsl(30,  100%, 50%)  rgb(255, 128, 0)
// yellow  hsl(60,  100%, 50%)  rgb(255, 255, 0)

// green   hsl(90,  100%, 50%)  rgb(128, 255, 0)
// green   hsl(120, 100%, 50%)  rgb(0,   255, 0)
// green   hsl(150, 100%, 50%)  rgb(0,   255, 128)

// green   hsl(180, 100%, 50%)  rgb(0,   255, 255)
// purple  hsl(210, 100%, 50%)  rgb(0,   128, 255)
// purple  hsl(230, 100%, 50%)  rgb(0,   42, 255)

// purple  hsl(260, 100%, 50%)  rgb(85,  0, 255)
// magenta hsl(290, 100%, 50%)  rgb(212, 0, 255)
// magenta hsl(320, 100%, 50%)  rgb(255, 0, 170)

// dark red   light
// dark green light
// dark blue  light
// pink
// orange
// purple
// magenta
import { codeByNoteHash, noteLatByNote } from '../muse/freq';
import cm from '../cm/codemirror.js';

//console.log('codeByNoteHash', noteLatByNote);

const alphas = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZабвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

const BUILTIN = 'builtin',
    COMMENT = 'comment',
    STRING = 'string',
    ATOM = 'atom',
    NUMBER = 'number',
    KEYWORD = 'keyword',
    MODTAG = 'header',
    COBOLLINENUM = 'def',
    PERIOD = 'link';

// . : ! #

// *
// -
// +
// . текст
// !? ноты
// % аккорды

// *()+-

//~! @ # $ % ^ & * ( ) _ +
// ! " № ; % : ? * ( ) _ +

const noteLineChars = {
    '!': '!',
    '$': '$',
}

const textLineChars = {
    '.': '.',
    '<': '<',
}

//const TEXT_LINE = '.';
//const CHORD_LINE = '%';

const lineMarkers = [...Object.values(noteLineChars), ...Object.values(textLineChars)];

function makeKeywords(str) {
    var obj = {},
    words = str
        .replace(/\n/g, ' ')
        .trim()
        .split(' ')
        .filter((item) => item);
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
}

cm.defineMode('musa', function () {
    var atoms = makeKeywords(
        'TRUE FALSE ZEROES ZEROS ZERO SPACES SPACE LOW-VALUE LOW-VALUES '
    );
    var keywords = makeKeywords(`
    EDIT SAVE DELETE
    ДЫ ДУ ДО ДА ДЕ ДИ DU DY DO DA DE DI
    ТЫ ТУ ТО ТА ТЕ ТИ TU TY TO TA TE TI
    РЫ РУ РО РА РЕ РИ RU RY RO RA RE RI
    НЫ НУ НО НА НЕ НИ NU NY NO NA NE NI
    МЫ МУ МО МА МЕ МИ MU MY MO MA ME MI
    ФЫ ФУ ФО ФА ФЕ ФИ FU FY FO FA FE FI
    ВЫ ВУ ВО ВА ВЕ ВИ VU VY VO VA VE VI
    СЫ СУ СО СА СЕ СИ SU SY SO SA SE SI
    ЗЫ ЗУ ЗО ЗА ЗЕ ЗИ ZU ZY ZO ZA ZE ZI
    ЛЫ ЛУ ЛО ЛА ЛЕ ЛИ LU LY LO LA LE LI
    КЫ КУ КО КА КЕ КИ KU KY KO KA KE KI
    БЫ БУ БО БА БЕ БИ BU BY BO BA BE BI
    `);

    var builtins = makeKeywords('- * ** / + < <= = > >= '); // -
    var tests = {
        digit: /\d/,
        digit_or_colon: /[\d:]/,
        hex: /[0-9a-f]/i,
        decor: /[0-9a-f]/i,
        sign: /[+-]/,
        exponent: /e/i,
        keyword_char: /[^\s\(\[\;\)\]]/,
        // [\p{Alpha}\p{M}\p{Nd}\p{Pc}\p{Join_C}]
        // /[\w*+\-]/
        symbol: /[\p{Alpha}\p{M}\p{Nd}\p{Pc}\p{Join_C}]/u,
    };

    const toneChar = '$';
    const drumChar = '@';
    const decorChar = '*';

    function isDecor(ch, stream) {
        if (ch === decorChar || ch === toneChar) {
            stream.skipTo(' ');
            return true;
        }

        return false;
    }

    function isNumber(ch, stream) {
        // hex
        if (ch === '0' && stream.eat(/x/i)) {
            stream.eatWhile(tests.hex);
            return true;
        }
        // leading sign
        if ((ch == '+' || ch == '-') && tests.digit.test(stream.peek())) {
            stream.eat(tests.sign);
            ch = stream.next();
        }
        if (tests.digit.test(ch)) {
            stream.eat(ch);
            stream.eatWhile(tests.digit);
            if ('.' == stream.peek()) {
                stream.eat('.');
                stream.eatWhile(tests.digit);
            }
            if (stream.eat(tests.exponent)) {
                stream.eat(tests.sign);
                stream.eatWhile(tests.digit);
            }
            return true;
        }
        return false;
    }

    return {
        startState: function () {
            return {
                indentStack: null,
                indentation: 0,
                mode: false,
                lineType: null,
                lastNoteCode: 0,
            };
        },
        token: function (stream, state) {
            if (stream.sol()) {
                state.lineType = null;
                state.lastNoteCode = 0;
            }

            // if (state.indentStack == null && stream.sol()) {
            //     update indentation, but only if indentStack is empty
            //     state.indentation = 6; //stream.indentation();
            // }

            // skip spaces
            if (stream.eatSpace()) {
                return null;
            }

            var returnType = null;
            switch (state.mode) {
                case 'string': // multi-line string parsing mode
                    var next = false;
                    while ((next = stream.next()) != null) {
                        if ((next == '"' || next == "'") && !stream.match(/['"]/, false)) {
                            state.mode = false;
                            break;
                        }
                    }
                    returnType = STRING; // continue on in string mode
                    break;
                default:
                    // default parsing mode
                    //console.log('sol', stream.sol());
                    var ch = stream.next();
                    var col = stream.column();

                    // if (ch == '#') {
                    //   stream.skipToEnd();
                    //   return COMMENT; // COMMENT;
                    // }

                    //console.log(ch, col);

                    if (col === 0 && !lineMarkers.find((item) => item === ch)) {
                        stream.skipToEnd();

                        return 'hr';
                    }

                    if (state.lineType === 'text') {
                        stream.skipToEnd();

                        return null;
                    }

                    if (col === 0 && noteLineChars[ch]) { // !$
                        state.lineType = 'note';

                        return 'hr';
                    }

                    // if (col === 0 && ch == CHORD_LINE) { // %
                    //     stream.skipToEnd();
                    //
                    //     return 'hr';
                    // }

                    if (col === 0 && textLineChars[ch]) { // .<
                        state.lineType = 'text';

                        return 'hr';
                    }

                    // COBOLLINENUM, MODTAG

                    if (ch == '"' || ch == "'") {
                        state.mode = 'string';
                        returnType = STRING;
                    } else if (ch == "'" && !tests.digit_or_colon.test(stream.peek())) {
                        returnType = ATOM;

                        //} else if (ch == '.') {
                        //  returnType = PERIOD;
                    } else if (isNumber(ch, stream)) {
                        returnType = NUMBER;
                    } else if (isDecor(ch, stream)) {
                        returnType = STRING;
                    } else {
                        //console.log('stream.current()', stream.current());
                        //console.log('stream.current().match(tests.symbol)', stream.current().match(tests.symbol));
                        // if (stream.current().match(tests.symbol)) {
                        if (alphas.includes(stream.current())) {
                            //console.log('stream.eol()', stream.eol());
                            while (!stream.eol()) {
                                let char = stream.peek();

                                if (alphas.includes(char)) {
                                    col++;
                                    stream.next();
                                } else {
                                    break;
                                }

                                // col < 71
                                // if (eated === undefined) {
                                //     break;
                                // } else {
                                //     col++;
                                // }
                            }
                        }

                        //console.log('stream.current().toUpperCase()', stream.current().toUpperCase())

                        if (
                            keywords &&
                            keywords.propertyIsEnumerable(
                                stream.current().toUpperCase()
                                // stream.current()
                            )
                        ) {
                            let note = stream.current().toLowerCase();

                            //console.log('note', note);

                            note = noteLatByNote[note];

                            if (note) {
                                returnType = 'step-' + note;
                            } else {
                                returnType = 'noteDefault';
                            }

                            // const code = codeByNoteHash[note];
                            // const prevCode = state.lastNoteCode;
                            // let diff = 0;
                            // returnType = 'noteDefault';
                            //
                            // if (code) {
                            //     state.lastNoteCode = code;
                            // } else {
                            //     returnType = 'noteDefault';
                            // }
                            //
                            // if (code && prevCode) {
                            //     diff = code - prevCode;
                            // }
                            //
                            // // !до то но во ко на
                            //
                            // if (diff > 0 && diff < 13) {
                            //     const zero = diff > 9 ? '' : '0';
                            //     returnType = `stepP${zero}${diff}`;
                            // } else if (diff < 0 && diff > -13) {
                            //     const zero = diff * -1 > 9 ? '' : '0';
                            //     returnType = `stepN${zero}${-1 * diff}`;
                            // } else {
                            //     returnType = 'noteDefault';
                            // }

                        } else if (
                            builtins &&
                            builtins.propertyIsEnumerable(stream.current().toUpperCase())
                        ) {
                            returnType = BUILTIN;
                        } else if (
                            atoms &&
                            atoms.propertyIsEnumerable(stream.current().toUpperCase())
                        ) {
                            returnType = ATOM;
                        } else returnType = null;
                    }
            }

            return returnType;
        },
        //indent: function (state) {
        //  if (state.indentStack == null) return state.indentation;
        //  return state.indentStack.indent;
        //},
    };
});

cm.defineMIME('text/x-musa', 'musa');
