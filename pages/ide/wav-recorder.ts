import { Sound } from '../../libs/muse';
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
    chunks = [];
    ctx: AudioContext;
    dest: MediaStreamAudioDestinationNode;
    mediaRecorder: MediaRecorder;
    private breakMe = false;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
    }

    downloadBlob(fileName: string = '', blob: Blob) {
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

    start(fileName: string = '') {
        fileName = fileName || 'record';

        this.chunks = [];
        this.dest = this.ctx.createMediaStreamDestination();
        this.mediaRecorder = new MediaRecorder(this.dest.stream);
        Sound.masterGain.connect(this.dest);

        this.mediaRecorder.ondataavailable = (evt) => {
            this.chunks.push(evt.data);
        };

        this.mediaRecorder.onstop = async (evt) => {
            if (this.breakMe) {
                return;
            }

            const blob = new Blob(this.chunks, { type: "audio/ogg; codecs=opus" });
            //const buffer = await getAudioBufferFromBlob(blob);

            function writeWavFile (channelData: any, sampleRate: number) {
                //let wavFile = wav.encode(channelData, {sampleRate: sampleRate, float: true, bitDepth: 32});
                //Fs.writeFileSync('D:/motes/hello.wav', new Buffer(wavFile)); jjkl
            }

            //writeWavFile([buffer.getChannelData(0), buffer.getChannelData(1)], this.ctx.sampleRate);

            this.downloadBlob(fileName, blob);
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
