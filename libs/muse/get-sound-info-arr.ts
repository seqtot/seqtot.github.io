import * as un from './utils';
import { freqInfoHash } from './freq';
import { TWaveZone } from './font/otypes';
import { Sound } from './sound';
import {drumMidiCodeByAlias} from './drums';
import {DEFAULT_VOLUME} from './utils';

export type TMidiCodeAndZone = {
    code: number,
    zone?: TWaveZone,
    volume: number,
}

export function getSoundsInfoArr(notes: string): TMidiCodeAndZone[] {
    const result: TMidiCodeAndZone[] = [];

    //ifDef = (ifDef || '').replace(un.toneChar, '').replace(un.drumChar, '').trim();
    notes = (notes || '').trim();
    //notes = notes === 'DEF' ? ifDef: notes;

    if (!notes) return [];

    let subArr = notes.split('+');

    subArr.forEach((note) => {
        note = note.replace(un.toneChar, '').replace(un.drumChar, '').trim();
        note = Sound.GetNoteSame(note);

        //console.log('getSoundInfoArr', notes, ifDef, note, this.keysAndNotes);

        if (!note) return;

        const noteLat = Sound.GetNoteLat(note);

        let soundInfo: {code: number, volume: number};

        if (freqInfoHash[noteLat]) {
            soundInfo = freqInfoHash[noteLat];
        }
        else if (drumMidiCodeByAlias[noteLat]) {
            soundInfo = {
                code: drumMidiCodeByAlias[noteLat],
                volume: 1,
            }
        } else {
            soundInfo = {
                code: 0,
                volume: 1
            }
        }

        result.push({
            code: soundInfo.code,
            volume: DEFAULT_VOLUME * soundInfo.volume,
        });
    });

    return result.filter((item) => !!item);
}
