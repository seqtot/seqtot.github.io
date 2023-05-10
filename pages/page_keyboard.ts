import { Props } from 'framework7/types/modules/component/snabbdom/modules/props';
import { ComponentContext } from 'framework7/modules/component/component';
import { Range } from 'framework7/types/components/range/range';
import { Dom7Array } from 'dom7';

import { byId, dyName } from '../src/utils';
import { Sound } from '../muse/sound';
import { MultiPlayer } from '../muse/multi-player';
import { Synthesizer } from '../muse/synthesizer';
import * as un from '../muse/utils-note';
import { defaultSynthSettings } from '../muse/keyboards';
import keyboardSet from './page_keyboard-utils';
import {getNoteByOffset, parseInteger} from '../muse/utils-note';

const multiPlayer = new MultiPlayer();
const metronome = new MultiPlayer();
const synthesizer = new Synthesizer();
synthesizer.connect({ ctx: Sound.ctx });
synthesizer.setSettings(defaultSynthSettings);

// Sound.AddSound(366); // bass
// Sound.AddSound(697); // sax
// Sound.AddSound(776); // flute
// Sound.AddSound(762); // piccolo
// Sound.AddSound(790); // Pan Flute
// Sound.AddSound(781); // Recorder
// Sound.AddSound(320); // gdm guidar drive mute
// Sound.AddSound(137); // xlph xylophone

function getWithDataAttr<T extends HTMLElement = HTMLElement>(
  name: string,
  el?: HTMLElement
): T[] {
  return ((el || document).querySelectorAll(`[data-${name}]`) as any) || [];
}

const ns = {
  setBmpAction: 'set-bmp-action',
  setNote: 'set-note',
};

const tick14 = `
<beat@>
-             : 1 :
@cowbell      : 1 :
`.trim();

const tick24 = `
<beat@>
-             : 1   2   :
@cowbell      : 1       :
@nil          :     2   :
`.trim();

const tick34 = `
<beat@>
-             : 1   2   3   :
@cowbell      : 1           :
@nil          :     2   3   :
`.trim();

const tick44 = `
<beat@>
-             : 1   2   3   4   :
@cowbell      : 1               :
@nil          :     2   3   4   :
`.trim();

const ticks = {
  '1:4': tick14,
  '2:4': tick24,
  '3:4': tick34,
  '4:4': tick44,
};

const defaultNote = 'da';

export class KeyboardPage {
  view: 'info' | 'drums' = 'info';
  bpmMultiple = 100;
  playingTick = '';
  bpmRange: Range.Range;
  playingNote: { [key: string]: string } = {};

  fixedRelativeNote = defaultNote;
  lastRelativeNote = defaultNote;
  fixedQuickNote = defaultNote;

  get pageId(): string {
    return this.props.id;
  }

  get pageEl(): HTMLElement {
    return this.context.$el.value[0] as HTMLElement;
  }

  get el$(): Dom7Array {
    return this.context.$el.value;
  }

  get setInfo(): {
    content: string;
    break: string;
    drums: string;
    tracks: { key: string; value: string; name: string }[];
    hideMetronome?: boolean;
  } {
    return keyboardSet as any;
  }

  getId(id: string): string {
    return this.pageId + '-' + id;
  }

  constructor(public props: Props, public context: ComponentContext) {}

  onMounted() {
    this.setViewInfo();
    dyName('panel-right-content').innerHTML = `
      <p data-name="action-info">табы</p>
      <p data-name="action-drums">барабан</p>
    `;

    this.subscribePageEvents();
  }

  setViewInfo() {
    this.view = 'info';

    let metronomeView = `
        <div style="padding: 1rem .5rem 1rem .5rem;">
          &emsp;
          <a data-tick-trigger="1:4"><b>1:4</b></a>&emsp;
          <a data-tick-trigger="2:4"><b>2:4</b></a>&emsp;
          <a data-tick-trigger="3:4"><b>3:4</b></a>&emsp;
          <a data-tick-trigger="4:4"><b>4:4</b></a>&emsp;
          <a data-tick-trigger="stop"><b>stop</b></a>&emsp;
          <div 
            class="range-slider"
            data-name="slider"
            data-label="true"
            data-min="0"   
            data-max="200"
            data-step="1"
            data-value="100"
            data-scale="true"
            data-scale-steps="10"
            data-scale-sub-steps="5"
          >
          </div>
        </div>
        ${this.getTracksContent()}
    `;

    if (this.setInfo.hideMetronome) {
      metronomeView = '';
    }

    const content = `
      <div class="page-content" style="padding-top: 0; padding-bottom: 2rem;">
      ${metronomeView}
      <div data-name="setContent">
        ${this.setInfo.content}
      </div>
      </div>
    `;

    this.el$.html(content);

    this.bpmRange = (this.context.$f7 as any).range.create({
      // jjkl
      el: dyName('slider', this.pageEl),
      on: {
        changed: (range: any) => {
          // console.log('range.onChange', range); // jjkl
          this.bpmMultiple = range.value;

          if (this.playingTick) {
            this.playTick(this.playingTick);
          }
        },
      },
    });

    this.subscribViewInfoEvents();
  }

  subscribePageEvents() {
    dyName('action-drums', dyName('panel-right-content')).addEventListener(
      'click',
      () => {
        //console.log('action-info');
        this.setViewDrums();
      }
    );

    dyName('action-info', dyName('panel-right-content')).addEventListener(
      'click',
      () => {
        //console.log('action-info');
        this.setViewInfo();
      }
    );

    getWithDataAttr('tick-trigger', this.pageEl)?.forEach((el) => {
      el.addEventListener('click', (evt: MouseEvent) => {
        this.playTick(el?.dataset?.tickTrigger);
      });
    });

    getWithDataAttr('note-line', this.pageEl)?.forEach((el) => {
      el.addEventListener('click', (evt: MouseEvent) => {
        this.tryPlayTextLine({
          text: el?.dataset?.noteLine,
        });
      });
    });

    getWithDataAttr('relative-key', this.pageEl)?.forEach((el: HTMLElement) => {
      el.addEventListener('pointerdown', () => {
        const wrapper = dyName('relative-keyboard-wrapper');

        if (!wrapper) {
          return;
        }

        let baseNote = wrapper.dataset.relativeKeyboardBase || 'do';
        let note = un.getNoteByOffset(baseNote, el.dataset.relativeKey);

        if (!note) {
          return;
        }

        wrapper.dataset.relativeKeyboardBase = note;

        getWithDataAttr(ns.setNote, this.pageEl)?.forEach((el: HTMLElement) => {
          el.style.backgroundColor = 'white';
        });

        if (dyName(`set-note-${note}`, this.pageEl)) {
          dyName(`set-note-${note}`, this.pageEl).style.backgroundColor =
            'lightgray';
        }

        this.tryPlayTextLine({ text: `b60 ${note}-25` });
      });
    });

    getWithDataAttr(ns.setNote, this.pageEl)?.forEach((el: HTMLElement) => {
      el.addEventListener('pointerdown', () => {
        const wrapper = dyName('relative-keyboard-wrapper', this.pageEl);

        if (!wrapper) {
          return;
        }

        getWithDataAttr(ns.setNote, this.pageEl)?.forEach((el: HTMLElement) => {
          el.style.backgroundColor = 'white';
        });

        el.style.backgroundColor = 'lightgray';
        const note = el.innerText.trim();
        wrapper.dataset.relativeKeyboardBase = note;
        this.tryPlayTextLine({ text: `b60 ${note}-25` });
      });
    });

    getWithDataAttr(ns.setBmpAction, this.pageEl)?.forEach(
      (el: HTMLElement) => {
        el.addEventListener('pointerdown', () => {
          this.bpmRange.setValue(parseInt(el?.dataset?.bpm, 10) || 100);
          this.playTick(this.playingTick);
        });
      }
    );

    this.subscribeKeyboardEvents();
    this.subscribeRelativeKeyboardEvents();
  }

  setKeysColor() {
    const bassChar = (this.playingNote.bass || '')[0];
    const soloChar = (this.playingNote.solo || '')[0];

    getWithDataAttr('note-key', this.pageEl)?.forEach((el: HTMLElement) => {
      el.style.backgroundColor = 'white';
      const data = (el?.dataset || {}) as {
        keyboardId: string;
        noteLat: string;
      };
      const firstChar = data.noteLat[0];

      if (data.keyboardId === 'solo' && firstChar === bassChar) {
        el.style.backgroundColor = '#eee';
      }

      // if (data.keyboardId === 'bass' && firstChar === soloChar) {
      //   el.style.backgroundColor = 'lightgray';
      // }
    });
  }

  subscribeKeyboardEvents() {
    getWithDataAttr('note-key', this.pageEl)?.forEach((el: HTMLElement) => {
      const keyboardId = el?.dataset?.keyboardId;
      const keyOrNote = el?.dataset?.noteLat || '';

      el.addEventListener('pointerdown', (evt: MouseEvent) => {
        synthesizer.playSound(
          {
            keyOrNote: this.playingNote[keyboardId],
            id: keyboardId,
            onlyStop: true,
          },
          true
        );
        this.playingNote[keyboardId] = keyOrNote;

        //el.style.backgroundColor = 'lightgray';

        synthesizer.playSound({
          keyOrNote,
          id: keyboardId,
          // instrCode: 366,
        });

        this.setKeysColor();

        // const wrapper = dyName('relative-keyboard-wrapper', this.pageEl);
        //
        // if (!wrapper) {
        //     return;
        // }
        //
        // wrapper.dataset.relativeKeyboardBase = el?.dataset?.noteLat;
      });

      el.addEventListener('pointerup', (evt: MouseEvent) => {
        synthesizer.playSound(
          {
            //keyOrNote: this.playingNote[keyboardId],
            keyOrNote,
            id: keyboardId,
            onlyStop: true,
          },
          true
        );

        this.playingNote[keyboardId] = undefined;
      });
    });

    const clearColor = () => {
      getWithDataAttr('note-key', this.pageEl)?.forEach((el: HTMLElement) => {
        el.style.backgroundColor = 'white';
      });
    };

    // очистка цвета
    let el = dyName('clear-keys-color', this.pageEl);
    if (el) {
      el.addEventListener('click', () => clearColor());
    }

    el = dyName('select-random-key', this.pageEl);
    if (el) {
      el.addEventListener('click', () => {
        const val =
          un.getRandomElement('dtrnmfvszlkb') + un.getRandomElement('uoa');

        const key = dyName(
          `note-key-${val}`,
          dyName(`keyboard-solo`, this.pageEl)
        );

        if (key) {
          clearColor();
          key.style.backgroundColor = 'lightgray';
        }
      });
    }
  }

  subscribeRelativeKeyboardEvents() {
    const fixEl = dyName('relative-command-fix');
    const zeroEl = dyName('relative-note-0');

    dyName('relative-command-fixQuickNote')?.addEventListener('pointerdown', (evt: MouseEvent) => {
      this.fixedRelativeNote = this.lastRelativeNote;
      this.fixedQuickNote = this.lastRelativeNote;
      fixEl.innerText = this.fixedQuickNote;
      const el = dyName('relative-command-setQuickNote');
      el.innerText = this.fixedQuickNote;
      zeroEl.innerText = this.fixedQuickNote;
    });

    dyName('relative-command-setQuickNote')?.addEventListener('pointerdown', (evt: MouseEvent) => {
      this.fixedRelativeNote = this.fixedQuickNote;
      this.lastRelativeNote = this.fixedQuickNote;
      fixEl.innerText = this.fixedQuickNote;
      zeroEl.innerText = this.fixedQuickNote;
    });

    dyName('relative-command-setDa')?.addEventListener('pointerdown', (evt: MouseEvent) => {
      this.fixedRelativeNote = defaultNote;
      this.lastRelativeNote = defaultNote;
      fixEl.innerText = defaultNote;
      zeroEl.innerText = defaultNote;
    });

    fixEl.addEventListener('pointerdown', (evt: MouseEvent) => {
      const keyboardId = fixEl?.dataset?.keyboardId;

      synthesizer.playSound(
          {
            keyOrNote: this.playingNote[keyboardId],
            id: keyboardId,
            onlyStop: true,
          },
          true
      );

      if (!this.lastRelativeNote) {
        return;
      }

      this.fixedRelativeNote = this.lastRelativeNote;
      this.playingNote[keyboardId] = this.lastRelativeNote;
      zeroEl.innerText = this.lastRelativeNote;

      synthesizer.playSound({
        keyOrNote: this.lastRelativeNote,
        id: keyboardId,
      });

    });

    fixEl.addEventListener('pointerup', (evt: MouseEvent) => {
      const keyboardId = fixEl?.dataset?.keyboardId;

      synthesizer.playSound(
          {
            keyOrNote: this.lastRelativeNote,
            id: keyboardId,
            onlyStop: true,
          },
          true
      );

      this.playingNote[keyboardId] = undefined;
    });

    getWithDataAttr('is-relative-note', this.pageEl)?.forEach((el: HTMLElement) => {
      if (!el?.dataset?.pitchOffset) {
        return;
      }

      const keyboardId = el?.dataset?.keyboardId;
      const offset = parseInteger(el?.dataset?.pitchOffset, null);

      if (offset === null) {
        return;
      }

      //console.log(offset, keyboardId);

      el.addEventListener('pointerdown', (evt: MouseEvent) => {
        const note = getNoteByOffset(this.fixedRelativeNote, offset);

        synthesizer.playSound(
            {
              keyOrNote: this.playingNote[keyboardId],
              id: keyboardId,
              onlyStop: true,
            },
            true
        );
        this.playingNote[keyboardId] = note;
        this.lastRelativeNote = note;

        if (!note) {
          return;
        }

        if (fixEl) {
          fixEl.innerText = note;
        }

        synthesizer.playSound({
          keyOrNote: note,
          id: keyboardId,
        });

        //this.setKeysColor();
      });

      el.addEventListener('pointerup', (evt: MouseEvent) => {
        const note = getNoteByOffset(this.fixedRelativeNote, offset);

        synthesizer.playSound(
            {
              keyOrNote: note,
              id: keyboardId,
              onlyStop: true,
            },
            true
        );

        this.playingNote[keyboardId] = undefined;
      });
    });

    // const clearColor = () => {
    //   getWithDataAttr('note-key', this.pageEl)?.forEach((el: HTMLElement) => {
    //     el.style.backgroundColor = 'white';
    //   });
    // };
    //
    // // очистка цвета
    // let el = dyName('clear-keys-color', this.pageEl);
    // if (el) {
    //   el.addEventListener('click', () => clearColor());
    // }
    //
    // el = dyName('select-random-key', this.pageEl);
    // if (el) {
    //   el.addEventListener('click', () => {
    //     const val =
    //         un.getRandomElement('dtrnmfvszlkb') + un.getRandomElement('uoa');
    //
    //     const key = dyName(
    //         `note-key-${val}`,
    //         dyName(`keyboard-solo`, this.pageEl)
    //     );
    //
    //     if (key) {
    //       clearColor();
    //       key.style.backgroundColor = 'lightgray';
    //     }
    //   });
    // }
  }

  getTracksContent(): string {
    if (!this.setInfo?.tracks?.length) {
      return '';
    }

    return this.setInfo.tracks.reduce(
      (acc, item) => {
        acc =
          acc +
          `
        <div class="row">
          <button id="${this.getId(
            'action-play-' + item.key
          )}" class="button col">${item.name || item.key}</button>
          </div>
        `;

        return acc.trim();
      },
      `
        <div class="row">
          <button id="${this.getId(
            'action-stop'
          )}" class="button col">stop</button>
        </div>                  
    `
    );
  }

  playTick(name?: string) {
    name = name || '';
    this.playingTick = name;

    metronome.clearMidiPlayer();

    const beat = ticks[this.playingTick];

    if (!beat) {
      this.playingTick = '';

      return;
    }

    const blocks = `
        <out r1000000>
        beat@

        ${beat}
      `;

    metronome.tryPlayMidiBlock({
      blocks,
      bpm: this.bpmMultiple,
    });
  }

  subscribViewInfoEvents() {
    this.subscribViewDrumsEvents();
  }

  subscribViewDrumsEvents() {
    setTimeout(() => {
      byId(this.getId('action-stop'))?.addEventListener(
        'click',
        (evt: MouseEvent) => {
          this.stop();
        }
      );

      this.setInfo.tracks.forEach((item) => {
        byId(`${this.getId('action-play-' + item.key)}`).addEventListener(
          'click',
          (evt: MouseEvent) => {
            //console.log('subscribViewDrumsEvents', item.key);

            const track = this.setInfo.tracks.find(
              (track) => track.key === item.key
            );

            //console.log(track);

            if (!track) return;

            this.play(track.value);
          }
        );
      });
    }, 550);
  }

  setViewDrums() {
    this.view = 'drums';

    const content = `
      <div class="page-content" style="padding-top: 0; padding-bottom: 2rem;">
        <div style="padding: 1rem .5rem 1rem .5rem;">
          % ускорения
          <div 
            class="range-slider"
            data-name="slider"
            data-label="true"
            data-min="0"   
            data-max="200"
            data-step="1"
            data-value="100"
            data-scale="true"
            data-scale-steps="10"
            data-scale-sub-steps="5"
          >
          </div>
        </div>
        ${this.getTracksContent()}
      </div>
    `;

    this.el$.html(content);

    this.bpmRange = (this.context.$f7 as any).range.create({
      el: dyName('slider', this.pageEl),
      on: {
        changed: (range: any) => {
          this.bpmMultiple = range.value;
        },
      },
    });

    this.subscribViewDrumsEvents();
  }

  async tryPlayTextLine({ text, repeat }: { text: string; repeat?: number }) {
    return multiPlayer.tryPlayTextLine({ text, repeat });
  }

  stop() {
    multiPlayer.clearMidiPlayer();
  }

  async play(text: string, repeatCount?: number) {
    multiPlayer.tryPlayMidiBlock({
      blocks: text,
      repeatCount,
      bpmMultiple: this.bpmMultiple,
    });
  }
}
