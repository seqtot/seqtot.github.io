import { Sound } from '../../libs/muse';
import {Deferred} from '../../libs/common';
//import * as wav from '../../libs/muse/utils/node-wav'

// https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
export async function decodeArrayBufferToAudio(
    arrayBuffer: ArrayBuffer
): Promise<AudioBuffer> {
    return await Sound.ctx.decodeAudioData(arrayBuffer);
}

export async function getAudioBufferFromBlob(blob: Blob): Promise<AudioBuffer> {
    let arrayBuffer = await blob.arrayBuffer();
    return decodeArrayBufferToAudio(arrayBuffer);
}

export class WavRecorder {
    chunks: number[] = [];
    ctx: AudioContext;
    dest: MediaStreamAudioDestinationNode;
    mediaRecorder: MediaRecorder;
    private breakMe = false;
    private result: Deferred;
    isRecording = false;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
    }

    static DownloadBlob(fileName: string = '', blob: Blob) {
        let link = document.createElement("a"); // Or maybe get it from the current document
        link.href = URL.createObjectURL(blob)
        link.innerHTML = "Click here to download the file";

        setTimeout(function () {
            //console.log()
            URL.revokeObjectURL(link.href)
        }, 4E4); // 40s

        setTimeout(function () {
            link.dispatchEvent(new MouseEvent('click'))
            //link.click()
        }, 0);

        link.download = `${fileName}.ogg`;

        document.body.appendChild(link);
    }

    async initMic(): Promise<boolean> {
        const dfr = new Deferred();

        if (!navigator.mediaDevices.getUserMedia) {
            dfr.resolve(false);
        }

        const constraints = { audio: true };

        let onSuccess = (stream: any) => {
            this.mediaRecorder = new MediaRecorder(stream);
            dfr.resolve(true);
        };

        let onError = (err: Error) => {
            console.log('The following error occured: ' + err);
            dfr.resolve(false);
        };

        navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

        return dfr.promise;
    } // initialize

    prepareMicRecord() {
        this.result = new Deferred();

        this.mediaRecorder.ondataavailable = (e: any) => {
            this.chunks.push(e.data);
        };

        this.mediaRecorder.onstop = (evt: any) => {
            this.mediaRecorder.onstop = null;
            this.mediaRecorder.ondataavailable = null;
            this.result.resolve(this.chunks);
        };

        this.isRecording = true;
        this.chunks = [];
    }

    startMic(): Promise<number[]> {
        this.mediaRecorder.start();

        return this.result.promise;
    }

    stopMic(): Promise<number[]> {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
        this.isRecording = false;

        return this.result.promise;
    }

    start(fileName: string = '') {
        fileName = fileName || 'record';

        this.chunks = [];
        this.dest = this.ctx.createMediaStreamDestination();
        this.mediaRecorder = new MediaRecorder(this.dest.stream);
        Sound.masterGain.connect(this.dest);

        this.mediaRecorder.ondataavailable = (evt) => {
            this.chunks.push(evt.data as any);
        };

        this.mediaRecorder.onstop = async (evt) => {
            if (this.breakMe) {
                return;
            }

            const blob = new Blob((this.chunks as any), { type: "audio/ogg; codecs=opus" });
            //const buffer = await getAudioBufferFromBlob(blob);

            function writeWavFile (channelData: any, sampleRate: number) {
                //let wavFile = wav.encode(channelData, {sampleRate: sampleRate, float: true, bitDepth: 32});
                //Fs.writeFileSync('D:/motes/hello.wav', new Buffer(wavFile)); jjkl
            }

            //writeWavFile([buffer.getChannelData(0), buffer.getChannelData(1)], this.ctx.sampleRate);

            WavRecorder.DownloadBlob(fileName, blob);
        };

        this.mediaRecorder.start();
    }

    stopAndSave() {
       this.mediaRecorder.stop();
       Sound.masterGain.disconnect(this.dest);
       this.clear();
    }

    break() {
        this.breakMe = true;
        this.stopAndSave();
    }

    private clear() {
        this.chunks = [];
        this.dest = null;
        this.mediaRecorder = null;
    }
}
