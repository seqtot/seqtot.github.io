'use babel';

import { parseInteger } from './parse-integer';

import { getVolumeFromString, isPresent, negativeChar, vibratoChar, timeCharRE } from './utils-note';
import { WaveSlide } from '../types';

// дтрн мфвс злкб
// хлнм щшзв фжс
//
// бв-д-зклмн-рстф
// --г-ж-----п----хцчшщ
//

const pitchLetter = {
    'ха': 1, 'ла': 2, 'на': 3, 'ма': 4, 'ща': 5, 'ша': 6, 'за': 7, 'ва': 8, 'фа': 9, 'жа': 10, 'са': 11, 'я': 12,
    'йха': 13, 'йла': 14, 'йна': 15, 'йма': 16, 'йща': 17, 'йша': 18, 'йза': 19, 'йва': 20, 'йфа': 21, 'йжа': 22, 'йса': 23,  'йа': 24,
    'ху': -1, 'лу': -2, 'ну': -3, 'му': -4, 'щу': -5, 'шу': -6, 'зу': -7, 'ву': -8, 'фу': -9, 'жу': -10, 'су': -11, 'ю': -12,
    'йху': -13, 'йлу': -14, 'йну': -15, 'йму': -16, 'йщу': -17, 'йшу': -18, 'йзу': -19, 'йву': -20, 'йфу': -21, 'йжу': -22, 'йсу': -23,  'йу': -24,
}

/**
 *  pitch, -pitch, pitch.cent, pitch.-cent, -pitch.cent
 */
export function getPitchAndCent(val: string): {
    pitch: number,
    cent: number,
    pitchWithCent: number,
    asStringA: string,
    asStringB: string,
} {
    val = (val || '').trim();

    const arr = val.split('.');
    let pitchStr = (arr[0] || '');
    let centStr = (arr[1] || '');
    const isNeg = pitchStr.includes(negativeChar) || centStr.includes(negativeChar);

    pitchStr = pitchStr.replace(negativeChar, '');
    centStr = centStr.replace(negativeChar, '');

    let pitch = pitchLetter[pitchStr] as number;
    pitch = isPresent(pitch) ? pitch : parseInteger(pitchStr, 0);
    let cent = parseInteger(centStr, 0);
    let sign = '';

    if (isNeg) {
        pitch = pitch > 0 ? -pitch: pitch;
        cent = cent > 0 ? -cent : cent;
        sign = negativeChar;
    }

    const result = {
        pitch,
        cent,
        pitchWithCent: (pitch * 100) + cent,
        asStringA: sign + Math.abs(pitch) + '.' + Math.abs(cent),
        asStringB: (sign ? '' : negativeChar) + Math.abs(pitch) + '.' + Math.abs(cent),
    }

    return result;
}

// :~1.25=count=speed
//
export function buildVibratoSlides(durationQ: number, val: string): string | undefined {
    val = (val || '').trim();

    if (!val) {
        return undefined;
    }

    val = val.replace(vibratoChar, '');
    const pitch = getPitchAndCent(val.split(timeCharRE)[0]);
    const count = parseInteger(val.split(timeCharRE)[1], 0);
    const speedFactor = parseInteger(val.split(timeCharRE)[2], 2);

    if (!count || !pitch.pitchWithCent) {
        return undefined;
    }

    let durationByItemQ = parseInteger('' + durationQ/(count + 1));
    let speed = speedFactor ? parseInteger('' + durationByItemQ/speedFactor) : 0;
    let result = '' + durationByItemQ;
    let odd = false;

    for (let i = 0; i < count; i++) {
        odd = !odd;

        if(odd) {
            result = result + '_' + pitch.asStringA + '=' + durationByItemQ + '=' + speed;
        } else {
            result = result + '_' + pitch.asStringB + '=' + durationByItemQ + '=' + speed;
        }
    }

    return result;
}


// {
//     note: string,
//     durationQ: number,
//     durationForNextQ: number,
//     cent?: number,
//     volume?: number,
//     decor?: string,
//     vibrato?: string,
// }
export function getSlides (
    arr: string[],
    note: { durationQ: number }
): WaveSlide[] | undefined {
    if (!arr.length) {
        return undefined;
    }

    const result: WaveSlide[] = [];
    const plato = arr.shift() || '';
    let firstDuration = parseInteger(plato.split(':')[0], 0);
    let firstVolume = getVolumeFromString(plato.split(':')[1], null);
    let deltaCent = 0;
    let hasVolumeSlide = false;

    let pre: {
        deltaCent: number,
        speed: number,
        duration: number,
        volume?: number | null,
    }[] = [{
        deltaCent: 0,
        speed: 0,
        duration: firstDuration,
        volume: firstVolume,
    }];

    let totalDuration = 0;

    arr.forEach(item => {
        //console.log('item', item);

        // до=180_60_1=60=10_-1.5=60=10
        const topArr = item.split(':');
        const durArr = topArr[0].split('=');
        const volume = getVolumeFromString(topArr[1], null);
        const pitchInfo = getPitchAndCent(durArr[0]);
        let duration = parseInteger(durArr[1], 0);
        let speed = parseInteger(durArr[2], 0);

        deltaCent = deltaCent + pitchInfo.pitchWithCent;

        pre.push({
            deltaCent,
            duration,
            speed,
            volume,
        });
    });

    // Пример
    // до=240_60_1=120=10_2=120=20
    //        0_ 1_______ 2_________
    // 0: deltaCent: 0,   speed: 0,  duration: 60,  volume: null
    // 1: deltaCent: 100, speed: 10, duration: 120, volume: null
    // 2: deltaCent: 200, speed: 20, duration: 120, volume: null

    pre.filter((curr, i) => {
        // const next = pre[i+1] ? pre[i+1] : {
        //     deltaCent: curr.deltaCent,
        //     duration: 0,
        //     speed: 0,
        //     volume: null,
        // };
        const next = pre[i+1];
        let changeTime = next ? next.speed : 0;
        let startWhen = totalDuration;
        let durationRest = curr.duration - changeTime;

        durationRest = durationRest < 0 ? 0 : durationRest;
        totalDuration = totalDuration + durationRest +  changeTime;
        hasVolumeSlide = isPresent(curr.volume) || hasVolumeSlide;

        //console.log('curr, next', curr, next);
        //console.log('durations', durationRest, totalDuration);

        // ПЛАТО
        result.push({
            delta: curr.deltaCent,
            volume: curr.volume,
            endWhen: startWhen + durationRest,
            isPlato: true,
        });

        // ИЗМЕНЕНИЕ
        if (next) {
            result.push({
                delta: next.deltaCent,
                volume: next.volume,
                endWhen: startWhen + durationRest + changeTime,
            });
        }
        else {
            result.push({
                delta: curr.deltaCent,
                volume: null,
                endWhen: Math.max(totalDuration, note.durationQ),
                isPlato: true,
            });
        }
    });

    result[0].hasVolumeSlide = hasVolumeSlide;
    note.durationQ = Math.max(totalDuration, note.durationQ);

    //console.log('CALC SLIDES', note.durationQ, result);

    return result;
}
