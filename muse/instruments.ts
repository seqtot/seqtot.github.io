import { drumCodes } from './drums';

// https://surikov.github.io/webaudiofont/examples/customsample.html

export const hardcodedInstruments = {
  // 0: '_tone_0000_JCLive_sf2_file',
  // 162: '_tone_0160_FluidR3_GM_sf2_file',
  // 168: '_tone_0161_FluidR3_GM_sf2_file',
  // // Trombone
  // 626: '_tone_0000_JCLive_sf2_file',     // hrd 0570_FluidR3_GM_sf2_file.js
  // 630: '_tone_0161_FluidR3_GM_sf2_file', // mdl 0570_SoundBlasterOld_sf2.js
  // 629: '_tone_0160_FluidR3_GM_sf2_file', // sft 0570_SBLive_sf2.js
  // // Trumpet 617 - 623 (trump)
  // 617: '_tone_0560_Aspirin_sf2_file',    // hrd 0560_Aspirin_sf2_file.js
  // 618: '_tone_0560_Chaos_sf2_file',      // mdl 0560_Chaos_sf2_file.js
  // 619: '_tone_0560_FluidR3_GM_sf2_file', // sft 0560_FluidR3_GM_sf2_file.js
  // // Tuba: 632 - 639 (tuba)
  // 635: '_tone_0580_GeneralUserGS_sf2_file', // hrd 0580_GeneralUserGS_sf2_file.js
  // 638: '_tone_0580_SoundBlasterOld_sf2',    // mdl 0580_SoundBlasterOld_sf2.js
  // 634: '_tone_0580_FluidR3_GM_sf2_file',    // sft 0580_FluidR3_GM_sf2_file.js
  // // Soprano Sax: 695 - 702 (ssax)
  // 702: '_tone_0641_FluidR3_GM_sf2_file', // hrd 0641_FluidR3_GM_sf2_file.js
  // 697: '_tone_0640_FluidR3_GM_sf2_file', // mdl 0640_FluidR3_GM_sf2_file.js
  // 696: '_tone_0640_Chaos_sf2_file',      // sft 0640_Chaos_sf2_file.js
  // // Alto Sax: 703 - 711 (asax)
  // 707: '_tone_0650_JCLive_sf2_file',        // hrd 0650_JCLive_sf2_file.js
  // 706: '_tone_0650_GeneralUserGS_sf2_file', // mdl 0650_GeneralUserGS_sf2_file.js
  // 704: '_tone_0650_Chaos_sf2_file',         // sft 0650_Chaos_sf2_file.js
  // // Tenor Sax: 712 - 720 (tsax)
  // 719: '_tone_0661_FluidR3_GM_sf2_file', // hrd 0661_FluidR3_GM_sf2_file.js
  // 714: '_tone_0660_FluidR3_GM_sf2_file', // mdl 0660_FluidR3_GM_sf2_file.js
  // 713: '_tone_0660_Chaos_sf2_file',      // sft 0660_Chaos_sf2_file.js
  // // Baritone Sax: 721 - 728 (bsax)
  // 725: '_tone_0670_JCLive_sf2_file',     // hrd 0670_JCLive_sf2_file.js
  // 728: '_tone_0671_FluidR3_GM_sf2_file', // mdl 0671_FluidR3_GM_sf2_file.js
  // 726: '_tone_0670_SBLive_sf2',          // sft 0670_SBLive_sf2.js
  // // Piccolo: 762 - 770
  // 762: '_tone_0720_Aspirin_sf2_file', // 0720_Aspirin_sf2_file.js
  // // Xylophone: 133 - 140
  // 136: '_tone_0130_GeneralUserGS_sf2_file', // 0130_GeneralUserGS_sf2_file.js
  // // Noise
  // 1310: '_tone_1226_GeneralUserGS_sf2_file', // 1226_GeneralUserGS_sf2_file.js
  // // DRUMS
  // drum_35: '_drum_35_0_Chaos_sf2_file',
  // drum_40: '_drum_40_0_SBLive_sf2',
  // drum_41: '_drum_41_0_SBLive_sf2',
  // drum_42: '_drum_42_0_SBLive_sf2',
  // drum_44: '_drum_44_0_SBLive_sf2',
  // drum_45: '_drum_45_0_SBLive_sf2',
  // drum_46: '_drum_46_0_SBLive_sf2',
  // drum_50: '_drum_50_0_SBLive_sf2',
  // drum_51: '_drum_51_0_SBLive_sf2',
  // drum_57: '_drum_57_0_SBLive_sf2',
  // drum_48: '_drum_48_0_SBLive_sf2',
  // drum_59: '_drum_59_0_SBLive_sf2',
  // drum_56: '_drum_56_0_SBLive_sf2',
  // drum_80: '_drum_80_0_SBLive_sf2',
} as const;

// ! % * ( ) +
// ! % * ( ) +

export const toneCodes = {
  // organ
  organ: 168,

  // Trombone
  tromb: 630,
  trombH: 626,
  trombM: 630,
  trombS: 629,

  // Trump
  trump: 618,
  trumpH: 617,
  trumpM: 618,
  trumpS: 619,
  'trump*H': 617,
  'trump*M': 618,
  'trump*S': 619,

  // Tuba
  tuba: 638,
  tubaH: 635,
  tubaM: 638,
  tubaS: 634,

  // Soprano Sax: 695 - 702 (ssax)
  ssax: 697,
  ssaxH: 702,
  ssaxM: 697,
  ssaxS: 696,

  // Alto Sax: 703 - 711 (saxa)
  asax: 706,
  asaxH: 707,
  asaxM: 706,
  asaxS: 704,

  // Tenor Sax: 712 - 720 (tsax)
  tsax: 714,
  tsaxH: 719,
  tsaxM: 714,
  tsaxS: 713,

  // Baritone Sax: 721 - 728 (bsax)
  bsax: 728,
  bsaxH: 725,
  bsaxM: 728,
  bsaxS: 726,

  // Piccolo: 762 - 770
  flute: 762,
  pflute: 762, // 768

  // Xylophone: 133 - 140
  xlphn: 136, // xylophone

  // Noise
  noise: 1310,

  //bass: 366,
  //panFlute: 790,
  //recorder: 781,
  //gdm: 320, // guitar drive mute
} as const;

// Pan Flute 790+
// Recorder 781

export const instrAlias = {
  ...toneCodes,
  ...drumCodes,
} as const;

export function getInstrCodeBy(val: number | string): number | string {
  val = val || '';

  if (!val) return val;

  if (typeof val === 'number') return val;

  val = val.replace('$', '').replace('@', '').trim();

  return instrAlias[val] || '';
}
