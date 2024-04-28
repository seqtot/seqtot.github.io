//appContents.style.display = "none";
import { Sound } from '../../libs/muse';
import { isPresent } from '../../libs/common';

export class WaveSource {
  vol: GainNode;
  osc: OscillatorNode;
  dest: AudioDestinationNode;

  constructor() {
    this.vol = Sound.ctx.createGain();
    this.vol.gain.value = 0;

    this.osc = Sound.ctx.createOscillator();
    this.osc.detune.value = 0; // value in cents
    this.osc.frequency.value = 0;
    this.osc.connect(this.vol);
  }

  connect(dest: AudioDestinationNode) {
    if (this.dest) {
      if (this.dest !== dest) {
        this.vol.disconnect(this.dest);
      } else {
        return;
      }
    }

    if (this.dest && this.dest !== dest) {
      this.vol.disconnect(this.dest);
    }

    this.dest = dest;
    this.vol.connect(dest);
  }

  disconnect() {
    if (this.dest) {
      this.vol.disconnect(this.dest);
    }

    this.dest = null;
  }

  setFreqAndVol(freq, vol) {
    this.setFreq(freq);
    this.setVol(vol);
  }

  setFreq(freq) {
    if (isPresent(freq)) {
      this.osc.frequency.value = freq;
    }
  }

  setVol(vol) {
    if (isPresent(vol)) {
      this.vol.gain.value = vol;
    }
  }

  start() {
    this.osc.start(0);
  }
}

export class WaveSource2 {
  type1: OscillatorType;
  type2: OscillatorType;
  volRatio: number = 50;

  vol1: GainNode;
  osc1: OscillatorNode;
  vol2: GainNode;
  osc2: OscillatorNode;
  dest: AudioDestinationNode;

  constructor(type1: OscillatorType = 'sine', type2: OscillatorType = 'sine') {
    this.type1 = type1 || 'sine';
    this.type2 = type2 || this.type1;

    this.vol1 = Sound.ctx.createGain();
    this.vol1.gain.value = 0;

    // this.vol2 = Sound.ctx.createGain();
    // this.vol2.gain.value = 0;

    this.osc1 = Sound.ctx.createOscillator();
    this.osc1.detune.value = 0; // value in cents
    this.osc1.frequency.value = 0;
    this.osc1.type = this.type1;
    this.osc1.connect(this.vol1);

    // this.osc2 = Sound.ctx.createOscillator();
    // this.osc2.detune.value = 0; // value in cents
    // this.osc2.frequency.value = 0;
    // this.osc2.type = this.type2;
    // this.osc2.connect(this.vol2);
  }

  connect(dest: AudioDestinationNode) {
    if (this.dest) {
      if (this.dest !== dest) {
        this.vol1.disconnect(this.dest);
        //this.vol2.disconnect(this.dest);
      } else {
        return;
      }
    }

    this.dest = dest;
    this.vol1.connect(dest);
    //this.vol2.connect(dest);
  }

  disconnect() {
    if (this.dest) {
      this.vol1.disconnect(this.dest);
      //this.vol2.disconnect(this.dest);
    }

    this.dest = null;
  }

  setFreqAndVol(freq, vol) {
    this.setFreq(freq);
    this.setVol(vol);
  }

  setFreq(freq) {
    if (isPresent(freq)) {
      this.osc1.frequency.value = freq;
      //this.osc2.frequency.value = freq;
    }
  }

  setVol(vol) {
    if (isPresent(vol)) {
      this.vol1.gain.value = vol;
      //this.vol2.gain.value = vol / this.volRatio;
    }
  }

  start() {
    this.osc1.start(0);
    //this.osc2.start(0);
  }

  setType1(type) {
    this.type1 = type || this.type1 || 'sine';
    this.osc1.type = this.type1;
  }

  setType2(type) {
    // this.type2 = type || this.type1 || 'sine';
    // this.osc2.type = this.type2;
  }

  toggleType2() {
    // sine, square, sawtooth, triangle

    // let type = this.type2 || this.type1 || 'sine';
    //
    // if (this.type2 === 'sine') {
    //   type = 'square';
    // }
    // else if (this.type2 === 'square') {
    //   type = 'sawtooth';
    // }
    // else if (this.type2 === 'sawtooth') {
    //   type = 'triangle';
    // }
    // else if (this.type2 === 'triangle') {
    //   type = 'sine';
    // }
    //
    // this.setType2(type);
  }
}
