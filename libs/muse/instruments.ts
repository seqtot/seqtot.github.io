'use babel';

//import '../waf-fonts';
import { parseInteger } from './utils';
import { drumCodes } from './drums';
import { WavePreset } from '../waf-player/otypes';

const toneChar = '$';
const drumChar = '@';
export const instruments: { [code: number | string]: WavePreset } = {};

// https://surikov.github.io/webaudiofont/examples/customsample.html
const instrAliasCodeVariable = [
    // voice
    'voice*ро:voice_ro_waf',
    'voice*хан:voice_han_waf',
    'voice*ла:voice_la_waf',
    'voice*лай:voice_lay_waf',
    // harm
    'harm:harmonica_waf',

    // organ
    'organ:162:_tone_0160_FluidR3_GM_sf2_file',
    'organ*p:176:_tone_0170_SoundBlasterOld_sf2',
    'organ*r:182:_tone_0180_FluidR3_GM_sf2_file',

    // bass guitar
    'cBass*s:366:_tone_0320_Aspirin_sf2_file', // slap
    'cBass*f:374:_tone_0322_GeneralUserGS_sf2_file', // pick
    'cBass*w:393:_tone_0350_Aspirin_sf2_file', // fretless

    'eBass*f:375:_tone_0330_Aspirin_sf2_file', // f 375 0330_Aspirin_sf2_file.js _tone_0330_Aspirin_sf2_file
    'eBass*m:388:_tone_0340_JCLive_sf2_file',  // m 388 0340_JCLive_sf2_file.js _tone_0340_JCLive_sf2_file
    'eBass*b:405:_tone_0360_JCLive_sf2_file',  // m 388 0340_JCLive_sf2_file.js _tone_0340_JCLive_sf2_file

    // v 393 0350_Aspirin_sf2_file.js _tone_0350_Aspirin_sf2_file

    // GUITAR OLD
    'guitar*EC:276:_tone_0260_FluidR3_GM_sf2_file', // electric clean guitar
    'guitar*ED:327:_tone_0291_LesPaul_sf2_file',    // guitar drive
    'guitar*EDM:321:_tone_0280_LesPaul_sf2_file',   // guitar mute drive
    'guit*ec:276:_tone_0260_FluidR3_GM_sf2_file', // electric clean guitar
    'guit*ed:327:_tone_0291_LesPaul_sf2_file',    // guitar drive
    'guit*edm:321:_tone_0280_LesPaul_sf2_file',   // guitar mute drive

    // GUITAR NEW
    // cl-1, cr-1, crt-1, crl-1, dr-2, drs-3, drp-1, drpm-1
    //
    // cl - clean
    'egit*cl:276:_tone_0260_FluidR3_GM_sf2_file', // electric clean guitar
    'egit*cl1:276:_tone_0260_FluidR3_GM_sf2_file', // electric clean guitar
    // cr - crunch
    'egit*cr:319:_tone_0290_JCLive_sf2_file',  // 319 + crunch (cr) 319 0290_JCLive_sf2_file.js _tone_0290_JCLive_sf2_file
    'egit*cr1:319:_tone_0290_JCLive_sf2_file',  // 319 + crunch (cr) 319 0290_JCLive_sf2_file.js _tone_0290_JCLive_sf2_file
    // crt - CRunch Toxic
    'egit*crt:317:_tone_0290_FluidR3_GM_sf2_file', // 317 + crunch toxic (crt) 317 0290_FluidR3_GM_sf2_file.js _tone_0290_FluidR3_GM_sf2_file
    'egit*crt1:317:_tone_0290_FluidR3_GM_sf2_file', // 317 + crunch toxic (crt) 317 0290_FluidR3_GM_sf2_file.js _tone_0290_FluidR3_GM_sf2_file
    // crl - CRunch Low
    'egit*crl:316:_tone_0290_Chaos_sf2_file', // 316 + crunch low (crl) 0290_Chaos_sf2_file.js _tone_0290_Chaos_sf2_file
    'egit*crl1:316:_tone_0290_Chaos_sf2_file', // 316 + crunch low (crl) 0290_Chaos_sf2_file.js _tone_0290_Chaos_sf2_file

    // dr - DRive
    'egit*dr:318:_tone_0290_GeneralUserGS_sf2_file', // 318 + drive high (dr) 0290_GeneralUserGS_sf2_file.js _tone_0290_GeneralUserGS_sf2_file
    'egit*dr1:318:_tone_0290_GeneralUserGS_sf2_file', // 318 + drive high (dr) 0290_GeneralUserGS_sf2_file.js _tone_0290_GeneralUserGS_sf2_file
    'egit*dr2:315:_tone_0290_Aspirin_sf2_file', // 315 + drive строй поправить (dr) 0290_Aspirin_sf2_file.js _tone_0290_Aspirin_sf2_file
    // drl - DRive Low
    // тихий 'egit*drl:322:_tone_0290_SBAWE32_sf2_file', // 322 + drive low (drl) 0290_SBAWE32_sf2_file.js _tone_0290_SBAWE32_sf2_file
    // тихий 'egit*drl1:322:_tone_0290_SBAWE32_sf2_file', // 322 + drive low (drl) 0290_SBAWE32_sf2_file.js _tone_0290_SBAWE32_sf2_file
    // drs - DRive Synt
    'egit*drs:323:_tone_0290_SBLive_sf2', // 323 + drive synt (drs) 0290_SBLive_sf2.js _tone_0290_SBLive_sf2
    'egit*drs1:323:_tone_0290_SBLive_sf2', // 323 + drive synt (drs) 0290_SBLive_sf2.js _tone_0290_SBLive_sf2
    'egit*drs2:324:_tone_0290_SoundBlasterOld_sf2', // 324 + drive synt (drs) 0290_SoundBlasterOld_sf2.js _tone_0290_SoundBlasterOld_sf2
    'egit*drs3:328:_tone_0291_SBAWE32_sf2_file', // 328 + drive synt (drs) 0291_SBAWE32_sf2_file.js _tone_0291_SBAWE32_sf2_file
    // drp - DRive Power
    'egit*drp:327:_tone_0291_LesPaul_sf2_file', // 327 + drive power (drp) 0291_LesPaul_sf2_file.js _tone_0291_LesPaul_sf2_file
    'egit*drp1:327:_tone_0291_LesPaul_sf2_file', // 327 + drive power (drp) 0291_LesPaul_sf2_file.js _tone_0291_LesPaul_sf2_file
    // дубль 327 'egit*drp2:326:_tone_0291_LesPaul_sf2', // 326 + drive power (drp) 0291_LesPaul_sf2.js _tone_0291_LesPaul_sf2
    // drpm - DRive Power Mute
    'egit*drpm:321:_tone_0290_LesPaul_sf2_file', // 321 + drive mute low (drlm) 0290_LesPaul_sf2_file.js _tone_0290_LesPaul_sf2_file
    'egit*drpm1:321:_tone_0290_LesPaul_sf2_file', // 321 + drive mute low (drlm) 0290_LesPaul_sf2_file.js _tone_0290_LesPaul_sf2_file

    // такой же 'egit*drm:305:_tone_0280_LesPaul_sf2_file',    // guitar mute drive
    // такой же 'egit*drm1:305:_tone_0280_LesPaul_sf2_file',   // guitar mute drive
    // такой же но тихий 'egit*drpm2:320:_tone_0290_LesPaul_sf2', // 320 + drive mute low (drlm) 0290_LesPaul_sf2.js _tone_0290_LesPaul_sf2
    // drm - DRive Mute

    // dn-5, dnt-1, dns-4, dfl-4
    // dn - DistortioN
    'egit*dn:334:_tone_0300_Chaos_sf2_file', // 334 + distortion (dn) 0300_Chaos_sf2_file.js _tone_0300_Chaos_sf2_file
    'egit*dn1:334:_tone_0300_Chaos_sf2_file', // 334 + distortion (dn) 0300_Chaos_sf2_file.js _tone_0300_Chaos_sf2_file
    'egit*dn2:333:_tone_0300_Aspirin_sf2_file', // 333 + distortion (dn) поправить строй 0300_Aspirin_sf2_file.js _tone_0300_Aspirin_sf2_file
    'egit*dn3:336:_tone_0300_GeneralUserGS_sf2_file', // 336 + distortion (dn) 0300_GeneralUserGS_sf2_file.js _tone_0300_GeneralUserGS_sf2_file
    'egit*dn4:338:_tone_0300_LesPaul_sf2', // 338 + distortion (dn) 0300_LesPaul_sf2.js _tone_0300_LesPaul_sf2
    'egit*dn5:339:_tone_0300_LesPaul_sf2_file', // 339 + distortion (dn) 0300_LesPaul_sf2_file.js _tone_0300_LesPaul_sf2_file
    // dnt - DistortioN Toxic
    'egit*dnt:346:_tone_0301_JCLive_sf2_file', // 346 ++ distortion toxic сухой резкий (dnt) 0301_JCLive_sf2_file.js _tone_0301_JCLive_sf2_file
    'egit*dnt1:346:_tone_0301_JCLive_sf2_file', // 346 ++ distortion toxic сухой резкий (dnt) 0301_JCLive_sf2_file.js _tone_0301_JCLive_sf2_file
    // dns - DistortioN Synt
    'egit*dns:335:_tone_0300_FluidR3_GM_sf2_file', // 335 + distortion synt (dns) 0300_FluidR3_GM_sf2_file.js _tone_0300_FluidR3_GM_sf2_file
    'egit*dns1:335:_tone_0300_FluidR3_GM_sf2_file', // 335 + distortion synt (dns) 0300_FluidR3_GM_sf2_file.js _tone_0300_FluidR3_GM_sf2_file
    'egit*dns2:341:_tone_0300_SBLive_sf2', // 341 + distortion synt (dns) 0300_SBLive_sf2.js _tone_0300_SBLive_sf2
    'egit*dns3:342:_tone_0300_SoundBlasterOld_sf2', // 342 + distortion synt (dns) 0300_SoundBlasterOld_sf2.js _tone_0300_SoundBlasterOld_sf2
    'egit*dns4:349:_tone_0302_Aspirin_sf2_file', // 349 - distortion synt (dns) 0302_Aspirin_sf2_file.js _tone_0302_Aspirin_sf2_file

    // dfl -
    'egit*dfl:356:_tone_0310_FluidR3_GM_sf2_file', // 356 + 0310_FluidR3_GM_sf2_file.js _tone_0310_FluidR3_GM_sf2_file
    'egit*dfl1:356:_tone_0310_FluidR3_GM_sf2_file', // 356 + 0310_FluidR3_GM_sf2_file.js _tone_0310_FluidR3_GM_sf2_file
    'egit*dfl2:359:_tone_0310_LesPaul_sf2', // 359 + 0310_LesPaul_sf2.js _tone_0310_LesPaul_sf2
    'egit*dfl3:360:_tone_0310_LesPaul_sf2_file', // 360 + 0310_LesPaul_sf2_file.js _tone_0310_LesPaul_sf2_file
    'egit*dfl4:361:_drum_80_0_SBLive_sf2', // 361 + 12880_0_SBLive_sf2.js _drum_80_0_SBLive_sf2

    // accordion
    'accordion:235:_tone_0230_JCLive_sf2_file',
    'bayan:235:_tone_0230_JCLive_sf2_file',

    // vio
    'vio:466:_tone_0420_JCLive_sf2_file', // 0420_JCLive_sf2_file.js

    // Trombone (все не очень)
    'tromb:626:_tone_0570_FluidR3_GM_sf2_file',    // hrd 0570_FluidR3_GM_sf2_file.js
    //'tromb:630:_tone_0161_FluidR3_GM_sf2_file',  // mdl 0570_SoundBlasterOld_sf2.js
    //'trombH:626:_tone_0570_FluidR3_GM_sf2_file', // hrd 0570_FluidR3_GM_sf2_file.js
    //'trombS:629:_tone_0160_FluidR3_GM_sf2_file', // sft 0570_SBLive_sf2.js

    // Trumpet 617 - 623 (trump) 617 618 619
    'trump:617:_tone_0560_Aspirin_sf2_file', // hrd 0560_Aspirin_sf2_file.js
    //'trump:618:_tone_0560_Chaos_sf2_file', // mdl 0560_Chaos_sf2_file.js
    //'trumpM:618:_tone_0560_Chaos_sf2_file', // mdl 0560_Chaos_sf2_file.js
    //'trump*M:618:_tone_0560_Chaos_sf2_file', // mdl 0560_Chaos_sf2_file.js
    //'trumpH:617:_tone_0560_Aspirin_sf2_file', // hrd 0560_Aspirin_sf2_file.js
    //'trump*H:617:_tone_0560_Aspirin_sf2_file', // hrd 0560_Aspirin_sf2_file.js
    //'trumpS:619:_tone_0560_FluidR3_GM_sf2_file', // sft 0560_FluidR3_GM_sf2_file.js
    //'trump*S:619:_tone_0560_FluidR3_GM_sf2_file', // sft 0560_FluidR3_GM_sf2_file.js

    // Tuba: 632 - 639 (tuba)
    'tuba:635:_tone_0580_GeneralUserGS_sf2_file',    // hrd 0580_GeneralUserGS_sf2_file.js
    //'tubaM:638:_tone_0580_SoundBlasterOld_sf2',    // mdl 0580_SoundBlasterOld_sf2.js
    //'tubaH:635:_tone_0580_GeneralUserGS_sf2_file', // hrd 0580_GeneralUserGS_sf2_file.js
    //'tubaS:634:_tone_0580_FluidR3_GM_sf2_file',    // sft 0580_FluidR3_GM_sf2_file.js

    // Soprano Sax: 695 - 702 (ssax)
    //'ssaxS:696:_tone_0640_Chaos_sf2_file',      // sft 0640_Chaos_sf2_file.js
    //'ssax:697:_tone_0640_FluidR3_GM_sf2_file', // mdl 0640_FluidR3_GM_sf2_file.js
    //'ssaxM:697:_tone_0640_FluidR3_GM_sf2_file', // mdl 0640_FluidR3_GM_sf2_file.js
    //'ssaxH:702:_tone_0641_FluidR3_GM_sf2_file', // hrd 0641_FluidR3_GM_sf2_file.js

    // Alto Sax: 703 - 711 (saxa)
    //'asaxS:704:_tone_0650_Chaos_sf2_file',         // sft 0650_Chaos_sf2_file.js
    //'asaxH:707:_tone_0650_JCLive_sf2_file',        // hrd 0650_JCLive_sf2_file.js
    //'asax:706:_tone_0650_GeneralUserGS_sf2_file', // mdl 0650_GeneralUserGS_sf2_file.js
    //'asaxM:706:_tone_0650_GeneralUserGS_sf2_file', // mdl 0650_GeneralUserGS_sf2_file.js

    // Tenor Sax: 712 - 720 (tsax)
    //'tsaxH:719:_tone_0661_FluidR3_GM_sf2_file', // hrd 0661_FluidR3_GM_sf2_file.js
    //'tsax:714:_tone_0660_FluidR3_GM_sf2_file', // mdl 0660_FluidR3_GM_sf2_file.js
    //'tsaxM:714:_tone_0660_FluidR3_GM_sf2_file', // mdl 0660_FluidR3_GM_sf2_file.js
    //'tsaxS:713:_tone_0660_Chaos_sf2_file',      // sft 0660_Chaos_sf2_file.js

    // Baritone Sax: 721 - 728 (bsax)
    //'bsaxH:725:_tone_0670_JCLive_sf2_file',     // hrd 0670_JCLive_sf2_file.js
    //'bsax:728:_tone_0671_FluidR3_GM_sf2_file', // mdl 0671_FluidR3_GM_sf2_file.js
    //'bsaxM:728:_tone_0671_FluidR3_GM_sf2_file', // mdl 0671_FluidR3_GM_sf2_file.js
    //'bsaxS:726:_tone_0670_SBLive_sf2',          // sft 0670_SBLive_sf2.js

    // Piccolo: 762 - 770
    'flute:790:_tone_0750_Chaos_sf2_file',       // 0720_Aspirin_sf2_file.js
    'picFlute:762:_tone_0720_Aspirin_sf2_file',  // 0720_Aspirin_sf2_file.js
    'panFlute:790:_tone_0750_Chaos_sf2_file',    // 0720_Aspirin_sf2_file.js

    // Xylophone: 133 - 140
    'xlphn:136:_tone_0130_GeneralUserGS_sf2_file', // 0130_GeneralUserGS_sf2_file.js
    'xylo:136:_tone_0130_GeneralUserGS_sf2_file', // 0130_GeneralUserGS_sf2_file.js

    // Noise
    'noise:1310:_tone_1226_GeneralUserGS_sf2_file', // 1226_GeneralUserGS_sf2_file.js
    // Sound
    'gun:1384:_tone_1270_FluidR3_GM_sf2_file', // // 1384:_tone_1270_FluidR3_GM_sf2_file:1270_FluidR3_GM_sf2_file.js

    // DRUMS
    'drum_35:_:_drum_35_0_Chaos_sf2_file',
    'drum_40:_:_drum_40_0_SBLive_sf2',
    'drum_41:_:_drum_41_0_SBLive_sf2',
    'drum_42:_:_drum_42_0_SBLive_sf2',
    'drum_44:_:_drum_44_0_SBLive_sf2',
    'drum_45:_:_drum_45_0_SBLive_sf2',
    'drum_46:_:_drum_46_0_SBLive_sf2',
    'drum_50:_:_drum_50_0_SBLive_sf2',
    'drum_51:_:_drum_51_0_SBLive_sf2',
    'drum_57:_:_drum_57_0_SBLive_sf2',
    'drum_48:_:_drum_48_0_SBLive_sf2',
    'drum_59:_:_drum_59_0_SBLive_sf2',
    'drum_56:_:_drum_56_0_SBLive_sf2',
    'drum_80:_:_drum_80_0_SBLive_sf2',
] as const;

export const hardcodedInstruments: {[key: string | number]: string} = {};
const toneCodeByAlias: {[key: string]: number} = {};

function getIdFromArray(arr: string[]): number | null {
    for (let item of arr) {
        let id = parseInteger(item, null);
        if (id) {
            return id;
        }
    }

    return null;
}

{
    let tempId = 100000;
    instrAliasCodeVariable.forEach(str => {

        let arr = str.split(':').map(item => (item || '').trim()).filter(item => item);
        if (arr.length <= 1) {
            return;
        }

        const varName = arr.pop();
        let id: number;
        // инструмент с id (тональный)
        if (!arr.find(val => val === '_')) {
            id = getIdFromArray(arr) || tempId++;
            hardcodedInstruments[id] = varName;
            arr.forEach(val => {
                if (toneCodeByAlias[val] || val === id.toString()) {
                    return;
                }

                toneCodeByAlias[val] = id;
            });
        } else {
            // инструмент без id (ударные)
            hardcodedInstruments[arr[0]] = varName;
        }
    });
}

const instrCodeByAlias = {
    ...toneCodeByAlias,
    ...drumCodes,
} as const;

export function getInstrCodeBy(val: number | string): number | string {
    val = val || '';

    if (!val) return val;

    if (typeof val === 'number') return val;

    val = val.replace(toneChar, '').replace(drumChar, '').trim();

    return instrCodeByAlias[val] || '';
}

export function getInstrumentObj(val: any, useDefault = false): WavePreset {
    let instr = instruments[val];
    if (instr) return instr;

    let defInstr = useDefault ?  instruments[0]: null;

    val = val === null || val === undefined ? null: val;

    if (instr === null) return defInstr;

    if (typeof val === 'object') return  val;

    if (typeof val === 'number') instruments[val] || defInstr;

    val = val.toString().trim();
    val = val.replace(toneChar, '').replace(drumChar, '').trim();

    return instruments[instrCodeByAlias[val]] || defInstr;
}


