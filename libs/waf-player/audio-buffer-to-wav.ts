'use babel';

// https://github.com/Jam3/audiobuffer-to-wav
export class Deferred<T = any> {
    promise: Promise<T>;
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

export function audioBufferToWav (buffer, opt?) {
    opt = opt || {}

    var numChannels = buffer.numberOfChannels
    var sampleRate = buffer.sampleRate
    var format = opt.float32 ? 3 : 1
    var bitDepth = format === 3 ? 32 : 16

    var result
    if (numChannels === 2) {
        result = interleave(buffer.getChannelData(0), buffer.getChannelData(1))
    } else {
        result = buffer.getChannelData(0)
    }

    return encodeWAV(result, format, sampleRate, numChannels, bitDepth)
}

function encodeWAV (samples, format, sampleRate, numChannels, bitDepth) {
    var bytesPerSample = bitDepth / 8
    var blockAlign = numChannels * bytesPerSample

    var buffer = new ArrayBuffer(44 + samples.length * bytesPerSample)
    var view = new DataView(buffer)

    /* RIFF identifier */
    writeString(view, 0, 'RIFF')
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * bytesPerSample, true)
    /* RIFF type */
    writeString(view, 8, 'WAVE')
    /* format chunk identifier */
    writeString(view, 12, 'fmt ')
    /* format chunk length */
    view.setUint32(16, 16, true)
    /* sample format (raw) */
    view.setUint16(20, format, true)
    /* channel count */
    view.setUint16(22, numChannels, true)
    /* sample rate */
    view.setUint32(24, sampleRate, true)
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * blockAlign, true)
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, blockAlign, true)
    /* bits per sample */
    view.setUint16(34, bitDepth, true)
    /* data chunk identifier */
    writeString(view, 36, 'data')
    /* data chunk length */
    view.setUint32(40, samples.length * bytesPerSample, true)
    if (format === 1) { // Raw PCM
        floatTo16BitPCM(view, 44, samples)
    } else {
        writeFloat32(view, 44, samples)
    }

    return buffer
}

function interleave (inputL, inputR) {
    var length = inputL.length + inputR.length
    var result = new Float32Array(length)

    var index = 0
    var inputIndex = 0

    while (index < length) {
        result[index++] = inputL[inputIndex]
        result[index++] = inputR[inputIndex]
        inputIndex++
    }
    return result
}

function writeFloat32 (output, offset, input) {
    for (var i = 0; i < input.length; i++, offset += 4) {
        output.setFloat32(offset, input[i], true)
    }
}

function floatTo16BitPCM (output, offset, input) {
    for (var i = 0; i < input.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]))
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
}

function writeString (view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
    }
}

export function dataURItoBlob(dataURI: string): Blob {
    // convert base64 to raw binary data held in a string
    let byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    let mimeString = dataURI
        .split(',')[0]
        .split(':')[1]
        .split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    let arrayBuffer = new ArrayBuffer(byteString.length);
    let _ia = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        _ia[i] = byteString.charCodeAt(i);
    }

    let dataView = new DataView(arrayBuffer);
    let blob = new Blob([dataView], { type: mimeString });

    return blob;
}

// https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
// AudioContext: decodeAudioData,

// audi
export async function getAudioBufferFromArrayBuffer(
    arrayBuffer: ArrayBuffer
): Promise<AudioBuffer> {
    const audioContext = new AudioContext();
    return await audioContext.decodeAudioData(arrayBuffer);
}

export async function getAudioBufferFromBlob(blob: Blob): Promise<AudioBuffer> {
    let arrayBuffer = await blob.arrayBuffer();

    return getAudioBufferFromArrayBuffer(arrayBuffer);
}

export async function getAudioBufferFromBlobString(blobStr: string): Promise<AudioBuffer> {
    const blob = dataURItoBlob(blobStr);

    return getAudioBufferFromBlob(blob);
}

export async function getAudioBufferFromString(audioFile: string, ctx?: AudioContext): Promise<AudioBuffer> {
    const dfr = new Deferred();
    let arrayBuffer = new ArrayBuffer(audioFile.length);
    let view = new Uint8Array(arrayBuffer);
    let decoded = atob(audioFile);
    let b;
    for (let i = 0; i < decoded.length; i++) {
        b = decoded.charCodeAt(i);
        view[i] = b;
    }

    ctx = ctx || new AudioContext();
    ctx.decodeAudioData(arrayBuffer, async (val) => dfr.resolve(val));

    return dfr.promise;
}

// {
//     let arrayBuffer: ArrayBuffer;
//     arrayBuffer = new ArrayBuffer(audioFile.length);
//     let view = new Uint8Array(arrayBuffer);
//     let decoded = atob(audioFile);
//     let b;
//
//     for (let i = 0; i < decoded.length; i++) {
//         b = decoded.charCodeAt(i);
//         view[i] = b;
//     }
//
//     ctx.decodeAudioData(arrayBuffer, async (val) => {
//         audioBuffer = val;
//console.log('audioBuffer', audioBuffer);
//
//         //const blob = await getBlobFromAudioBuffer(audioBuffer);
//         //console.log('BLOB', blob);
//         //const blobString = await getBlobString(blob);
//         //console.log('BLOB STRING', blobString);
//     });
// }



/**
 * FileReader.readAsDataURL
 */
export async function getBlobString(blob: Blob): Promise<string> {
    const dfr = new Deferred();

    // blob.text().then(val => {
    //console.log('blobText', val);
    // });
    const reader = new FileReader();

    reader.onload = event => {
        const result = '' + event.target.result;
        //console.log(dataURItoBlob(result)); // Blob

        dfr.resolve(result);
    };

    reader.readAsDataURL(blob);

    return dfr.promise;
}

export function getBlobFromAudioBuffer(audioBuffer: AudioBuffer): Blob {
    return new Blob([audioBufferToWav(audioBuffer)], { type: 'audio/wav' });
    // blob = new Blob(<any>bufferAsBlob, { type: 'audio/wav' }); // 'audio/webm;codecs=opus', 'audio/ogg; codecs=opus', 'audio/wav'
}
