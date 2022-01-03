import { drumKeys, drumCodes, drumInfo } from './drums';
// Import stylesheets
// https://github.com/surikov/webaudiofont
// https://musescore.com/user/28057257/scores/6616725

//     Choir Aahs: 576 - 587
//     Voice Oohs: 588 - 599
//     Tuba: 632 - 639
//     Trombone: 624 - 631

// 162 192 193
// Organ
//     Drawbar Organ: 160 - 169
//     Percussive Organ: 170 - 179
//     Rock Organ: 180 - 189
//     Church Organ: 190 - 199
//     Reed Organ: 200 - 210
//     Accordion: 211 - 222
//     Harmonica: 223 - 230
//     Tango Accordion: 231 - 243

// rock guitar
//     overdrive distortion harmonic
//     315-332   333-353    354-365
// 320 321 приглуш

//     Guitar Fret Noise: 1273 - 1282
//     Breath Noise: 1283 - 1292
export const MIDI_INSTR = 162; // 633

// 580 581 594 а5T5T
// 595 у
// 597 598 ы
// 580

export const voiceCodes = {
  organ: 162,
  bass: 366,
};

export const instrAlias = {
  ...voiceCodes,
  ...drumCodes,
};

export function getInstrCodeBy(val: number | string): number | string {
  if (typeof val === 'number') return val;

  val = val.replace('$', '').replace('@', '');

  return instrAlias[val] || '';
}

export const twoVoice = {
  octaves: {
    left1: {
      octave: 'a',
      volume: 0.5,
      instr: MIDI_INSTR,
    },
    left2: {
      octave: 'o',
      volume: 0.5,
      instr: MIDI_INSTR,
    },
    right2: {
      octave: 'a',
      volume: 0.5,
      instr: MIDI_INSTR,
    },
    right1: {
      octave: 'o',
      volume: 0.5,
      instr: MIDI_INSTR,
    },
    right0: {
      octave: 'u',
      volume: 0.5,
      instr: MIDI_INSTR,
    },
  },
};

export const bassAndOrgan = {
  octaves: {
    left1: {
      octave: 'a',
      volume: 0.15,
      instr: MIDI_INSTR,
    },
    left2: {
      octave: 'o',
      volume: 0.15,
      instr: MIDI_INSTR,
    },
    right2: {
      octave: 'y',
      volume: 0.5,
      instr: 366,
    },
    right1: {
      octave: 'u',
      volume: 0.5,
      instr: 366,
    },
    right0: {
      octave: 'u',
      volume: 0.5,
      instr: 366,
    },
  },
  drums: drumKeys,
};

export const byDefault = {
  octaves: {
    left1: {
      octave: 'e',
      volume: 0.5,
      instr: MIDI_INSTR,
    },
    left2: {
      octave: 'a',
      volume: 0.5,
      instr: MIDI_INSTR,
    },
    right2: {
      octave: 'o',
      volume: 0.5,
      instr: MIDI_INSTR,
    },
    right1: {
      octave: 'y',
      volume: 0.5,
      instr: MIDI_INSTR,
    },
    right0: {
      octave: 'u',
      volume: 0.5,
      instr: MIDI_INSTR,
    },
  },
  // drums: drumKeys,
};

export const voiceAndDrumsSettings = {
  ...byDefault,
  drums: drumInfo, // drumKeys
};

export const defaultSynthSettings = byDefault;

// organ 162, 168, 177, 179
// church 192, 194, 195 слабый
// 196 простой низкий
// 197 низкий труба
// 197 с хриптцой
// 202 203 дудки
// 204 206
// 207 низковат
// 208 почти гаромшка
// 209 гармошка с лёгким придыханием
// 210 218 низковат

// 170, 171, 174, 175, 176, 186 с перкуссией
// 187 больше на дузовые похож
// 189 как в трубу дуешь
// 178, 188 стакатто,
// 180 перкуссия с баском
// 172 двойная перкуссия
// 161, 164, 165, 169 мощноват
// 173, 181 мощный, с атакой
// 182, 184 мощный, с атакой, лёгкая перегрузка
// 185 атака, пекуссия, затейливый
// 183 мощный, с атакой, дрожание
// 167 резковат с дрожанием
// 166 слабенький без басов
// 163 сухая перкуссия
// 190 221 подзванивает на верхах

// 191 разнопарка
// 199 высокий строй

// 193 201 205 216 220 плохой ряд
// 211 212 200 bad

// 214 213 215 217 219(чуток вау вау) 222
// 223 (придых) 224(потешный) 225 (придых) 226 (нарост)

// Acoustic Grand Piano: 0 - 10
// Bright Acoustic Piano: 11  - 21
// Electric Grand Piano: 22 - 31
// Honky-tonk Piano: 32 - 42
// Electric Piano 1: 43 - 57
// Electric Piano 2: 58 - 69
// Harpsichord: 70 - 80
// Clavinet: 81 - 88
// Chromatic Percussion
//     Celesta: 89 - 98
//     Glockenspiel: 99 - 106
//     Music Box: 107 - 115
//     Vibraphone: 116 - 123
//     Marimba: 124 - 132
//     Xylophone: 133 - 140
//     Tubular Bells: 141 - 151
//     Dulcimer: 152 - 159
// Organ
//     Drawbar Organ: 160 - 169
//     Percussive Organ: 170 - 179
//     Rock Organ: 180 - 189
//     Church Organ: 190 - 199
//     Reed Organ: 200 - 210
//     Accordion: 211 - 222
//     Harmonica: 223 - 230
//     Tango Accordion: 231 - 243

// Guitar
//     Acoustic Guitar (nylon): 244 - 255
//     Acoustic Guitar (steel): 256 - 273
//     Electric Guitar (jazz): 274 - 285
//     Electric Guitar (clean): 286 - 298
//     Electric Guitar (muted): 299 - 314

// rock guitar
//     overdrive distortion harmonic
//     315-332   333-353    354-365

// Bass
//     Acoustic Bass: 366 - 374
//     Electric Bass (finger): 375 - 383
//     Electric Bass (pick): 384 - 392
//     Fretless Bass: 393 - 400
//     Slap Bass 1: 401 - 408
//     Slap Bass 2: 409 - 417
//     Synth Bass 1: 418 - 433
//     Synth Bass 2: 434 - 446
// Strings
//     Violin: 447 - 457
//     Viola: 458 - 465
//     Cello: 466 - 474
//     Contrabass: 475 - 482
//     Tremolo Strings: 483 - 491
//     Pizzicato Strings: 492 - 499
//     Orchestral Harp: 500 - 507
//     Timpani: 508 - 516
// Ensemble
//     String Ensemble 1: 517 - 543
//     String Ensemble 2: 544 - 552
//     Synth Strings 1: 553 - 566
//     Synth Strings 2: 567 - 575
//     Choir Aahs: 576 - 587
//     Voice Oohs: 588 - 599
//     Synth Choir: 600 - 607
//     Orchestra Hit: 608 - 616

// piano harpsichord Clavinet
// celesta glockenspiel music_box Vibraphone Marimba Xylophone Tubular_Bells Dulcimer
// organ accordion harmonica
// Acoustic_Guitar_nylon Acoustic_Guitar_steel
// Electric_Guitar_jazz Electric_Guitar_clean Electric_Guitar_muted
// rock_guitar_overdrive  rock_guitar_distortion rock_guitar_harmonic
// Acoustic_Bass
// Electric_Bass_finger Electric Bass_pick
// Fretless Bass
// Slap Bass
// Synth Bass
// Violin, Viola, Cello, Contrabass
// Tremolo Strings, Pizzicato Strings, Orchestral Harp
// Timpani (литавры)
// Trumpet, Trombone, Tuba, Muted Trumpet, French Horn, Brass Section, Synth Brass

// Brass
//     Trumpet: 617 - 623
//     Trombone: 624 - 631
//     Tuba: 632 - 639
//     Muted Trumpet: 640 - 647
//     French Horn: 648 - 658
//     Brass Section: 659 - 670
//     Synth Brass 1: 671 - 682
//     Synth Brass 2: 683 - 694
// Reed
//     Soprano Sax: 695 - 702
//     Alto Sax: 703 - 711
//     Tenor Sax: 712 - 720
//     Baritone Sax: 721 - 728
//     Oboe: 729 - 736
//     English Horn: 737 - 744
//     Bassoon: 745 - 753
//     Clarinet: 754 - 761
// Pipe
//     Piccolo: 762 - 770
//     Flute: 771 - 780
//     Recorder: 781 - 788
//     Pan Flute: 789 - 799
//     Blown bottle: 800 - 810
//     Shakuhachi: 811 - 820
//     Whistle: 821 - 828
//     Ocarina: 829 - 836
// Synth Lead
//     Lead 1 (square): 837 - 845
//     Lead 2 (sawtooth): 846 - 855
//     Lead 3 (calliope): 856 - 867
//     Lead 4 (chiff): 868 - 877
//     Lead 5 (charang): 878 - 891
//     Lead 6 (voice): 892 - 902
//     Lead 7 (fifths): 903 - 912
//     Lead 8 (bass + lead): 913 - 922
// Synth Pad
//     Pad 1 (new age): 923 - 943
//     Pad 2 (warm): 944 - 953
//     Pad 3 (polysynth): 954 - 964
//     Pad 4 (choir): 965 - 975
//     Pad 5 (bowed): 976 - 985
//     Pad 6 (metallic): 986 - 996
//     Pad 7 (halo): 997 - 1007
//     Pad 8 (sweep): 1008 - 1016
// Synth Effects
//     FX 1 (rain): 1017 - 1028
//     FX 2 (soundtrack): 1029 - 1038
//     FX 3 (crystal): 1039 - 1052
//     FX 4 (atmosphere): 1053 - 1068
//     FX 5 (brightness): 1069 - 1083
//     FX 6 (goblins): 1084 - 1094
//     FX 7 (echoes): 1095 - 1107
//     FX 8 (sci-fi): 1108 - 1119
// Ethnic
//     Sitar: 1120 - 1128
//     Banjo: 1129 - 1136
//     Shamisen: 1137 - 1146
//     Koto: 1147 - 1157
//     Kalimba: 1158 - 1165
//     Bagpipe: 1166 - 1173
//     Fiddle: 1174 - 1184
//     Shanai: 1185 - 1191
// Percussive
//     Tinkle Bell: 1192 - 1199
//     Agogo: 1200 - 1208
//     Steel Drums: 1209 - 1216
//     Woodblock: 1217 - 1227
//     Taiko Drum: 1228 - 1240
//     Melodic Tom: 1241 - 1251
//     Synth Drum: 1252 - 1261
//     Reverse Cymbal: 1262 - 1272
// Sound effects
//     Guitar Fret Noise: 1273 - 1282
//     Breath Noise: 1283 - 1292
//     Seashore: 1293 - 1310
//     Bird Tweet: 1311 - 1323
//     Telephone Ring: 1324 - 1338
//     Helicopter: 1339 - 1364
//     Applause: 1365 - 1381
//     Gunshot: 1382 - 1394
