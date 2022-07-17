// https://framework7.io/docs/init-app.html
// https://framework7.io/docs/kitchen-sink.html

// import { Page } from 'framework7/types/components/page/page';
import { Page } from 'framework7/types/components/page/page';
import { ComponentContext } from 'framework7/types/modules/component/component';
import { Props } from 'framework7/types/modules/component/snabbdom/modules/props';
import { byId, dyName } from './utils';
import { Player3 } from './muse/player3';
import { voiceAndDrumsSettings, MIDI_INSTR } from './muse/midi';
import * as un from './muse/utils-note';
import { Range } from 'framework7/types';
import { getInstrCodeBy } from './muse/midi';

import setE from './sets/set_E';
import setBattle from './sets/set_battle';
import setItsMyLife from './sets/set_ItsMyLife';
import setMy from './sets/set_My';
import setBlackNight from './sets/set_blackNight';

const ctx: AudioContext = new AudioContext();
const uniPlayer = new Player3();
uniPlayer.connect({ ctx });
uniPlayer.setSettings(voiceAndDrumsSettings);
uniPlayer.addMidiSound(366); // bass
uniPlayer.addMidiSound(697); // sax
uniPlayer.addMidiSound(776); // flute
uniPlayer.addMidiSound(762); // piccolo
uniPlayer.addMidiSound(790); // Pan Flute
uniPlayer.addMidiSound(781); // Recorder
uniPlayer.addMidiSound(320); // gdm guidar drive mute
uniPlayer.addMidiSound(137); // xlph xylophone

function getWithDataAttr<T extends HTMLElement = HTMLElement>(
  name: string,
  el?: HTMLElement
): T[] {
  return ((el || document).querySelectorAll(`[data-${name}]`) as any) || [];
}

const sets = {
  set_E: setE,
  set_Battle: setBattle,
  set_ItsMyLife: setItsMyLife,
  set_My: setMy,
  set_blackNight: setBlackNight,
};

export const setVc = (props: Props, context: any) => {
  let vc: SetVc;

  // context object contains a lot of useful helpers:
  // console.log('props', props);
  // console.log('context', context.$f7route.params);

  // Lifecicle hooks
  // $onBeforeMount	Called right before component will be added to DOM
  // $onMounted	Called right after component was be added to DOM
  // $onBeforeUpdate	Called right after component before VDOM will be patched/updated
  // $onUpdated	Called right after component VDOM has been patched/updated
  // $onBeforeUnmount	Called right before component will be unmounted (detached from the DOM)
  // $onUnmounted	Called when component unmounted and destroyed

  context['$on']('pageInit', (e: any, page: any) => {
    vc = new SetVc(props, context, page);
    vc.setContent();
  });

  // context['$onMounted'](() => {
  //   console.log('$onMounted');
  // });

  return () => context.$h`<div class="page"></div>`;
};

export class SetVc {
  view: 'info' | 'drums' = 'info';
  bpmMultiple = 100;

  constructor(
    public props: Props,
    public context: ComponentContext,
    public page: any
  ) {
    //console.log('props', props);
  }

  setContent() {
    this.setViewInfo();
    dyName('panel-right-content').innerHTML = `
      <p data-name="action-info">табы</p>
      <p data-name="action-drums">барабан</p>
    `;

    this.subscribePageEvents();
  }

  get setId(): string {
    return this.props.id;
  }

  get setInfo(): {
    content: string;
    break: string;
    drums: string;
    tracks: { key: string; value: string; name: string }[];
  } {
    return sets[this.setId];
  }

  getTracksContent(): string {
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

    this.page.$el.html(content);

    let bpmRange = this.context.$f7.range.create({
      el: dyName('slider', this.pageEl),
      on: {
        changed: (range: any) => {
          this.bpmMultiple = range.value;
        },
      },
    });

    this.subscribViewDrumsEvents();
  }

  setViewInfo() {
    this.view = 'info';

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
      <div data-name="setContent">
        ${this.setInfo.content}
      </div>
      </div>
    `;

    this.page.$el.html(content);

    let bpmRange = this.context.$f7.range.create({
      el: dyName('slider', this.pageEl),
      on: {
        changed: (range: any) => {
          this.bpmMultiple = range.value;
        },
      },
    });

    this.subscribViewInfoEvents();
  }

  get pageEl(): HTMLElement {
    return this.page.$el[0];
  }

  getId(id: string): string {
    return this.setId + '-' + id;
  }

  subscribViewDrumsEvents() {
    setTimeout(() => {
      byId(this.getId('action-stop')).addEventListener(
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

  subscribViewInfoEvents() {
    this.subscribViewDrumsEvents();
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

    getWithDataAttr('note-line', this.pageEl)?.forEach((el) => {
      el.addEventListener('click', (evt: MouseEvent) => {
        this.tryPlayTextLine({
          text: el?.dataset?.noteLine,
        });
      });
    });

    getWithDataAttr('note-key', this.pageEl)?.forEach((el: HTMLElement) => {
      el.addEventListener('pointerdown', (evt: MouseEvent) => {
        el.style.backgroundColor = 'lightgray';

        this.tryPlayTextLine({
          text: el?.dataset?.noteKey,
        });
      });
    });

    const clearColor = () => {
      // console.log(window.location.href);

      getWithDataAttr('note-key', this.pageEl)?.forEach((el: HTMLElement) => {
        el.style.backgroundColor = 'white';
      });
    };

    // очистка цвета
    let el = dyName('clear-keys-color');
    if (el) {
      el.addEventListener('click', () => clearColor());
    }

    el = dyName('select-random-key');
    if (el) {
      el.addEventListener('click', () => {
        const val =
          un.getRandomElement('dtrnmfvszlkb') + un.getRandomElement('uoa');

        const key = dyName(`note-val-${val}`);

        if (key) {
          clearColor();
          key.style.backgroundColor = 'lightgray';
        }
      });
    }

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

        getWithDataAttr('set-note', this.pageEl)?.forEach((el: HTMLElement) => {
          el.style.backgroundColor = 'white';
        });

        if (dyName(`set-note-${note}`)) {
          dyName(`set-note-${note}`).style.backgroundColor = 'lightgray';
        }

        this.tryPlayTextLine({ text: `b60 ${note}-25` });
      });
    });

    getWithDataAttr('set-note', this.pageEl)?.forEach((el: HTMLElement) => {
      el.addEventListener('pointerdown', () => {
        const wrapper = dyName('relative-keyboard-wrapper');

        if (!wrapper) {
          return;
        }

        getWithDataAttr('set-note', this.pageEl)?.forEach((el: HTMLElement) => {
          el.style.backgroundColor = 'white';
        });

        el.style.backgroundColor = 'lightgray';
        const note = el.innerText.trim();
        wrapper.dataset.relativeKeyboardBase = note;
        this.tryPlayTextLine({ text: `b60 ${note}-25` });
      });
    });
  }

  async tryPlayTextLine({ text, repeat }: { text: string; repeat?: number }) {
    repeat = repeat || 1;
    text = (text || '').trim();

    uniPlayer.clear();
    const noteLine = un.clearNoteLine(text);
    const bpm = un.getBpmFromString(noteLine);

    const loopId = uniPlayer.addLoop({
      noteLine,
      bpm,
      isDrum: false, // isDrum,
      repeat,
      instrCode: MIDI_INSTR, // instrAlias[key],
    }).id;

    await uniPlayer.waitLoadingAllInstruments();

    uniPlayer.play([loopId]);
  }

  stop() {
    uniPlayer.clear();
    uniPlayer.stop();
  }

  async play(text: string, repeatCount?: number) {
    uniPlayer.clear();

    const allBlocks = un.getBlocks(text);

    const out = un.findBlockById(allBlocks, 'out');

    let bpm = un.getOutBpm(out.rows); // 130
    bpm = Math.round((bpm * this.bpmMultiple) / 100);

    const repeat = repeatCount || un.getOutRepeat(out.rows); // 2
    const outBlocks = un.getOutBlocksInfo(allBlocks);

    //console.log('outBlocks', outBlocks);

    const outLoops = outBlocks.map((block) => {
      return Object.keys(block.instrs).map((instrKey) => {
        const noteLine = block.instrs[instrKey];
        const isDrum = instrKey.startsWith('@');
        const loopRepeat = un.getRepeatCount(noteLine);

        let instrCode: string | number = instrKey.split('-')[0];
        instrCode = isDrum ? undefined : getInstrCodeBy(instrCode);

        return uniPlayer.addLoop({
          noteLine,
          bpm,
          isDrum,
          repeat: block.repeat,
          instrCode,
        }).id;
      });
    });

    //console.log('allBlocks', allBlocks);
    //console.log('outBlocks', outBlocks);
    //console.log('getOutDrumBlockInstrs.outLoops', outLoops);
    //console.log('LOOPS', uniPlayer.loops);

    let breakLoop: boolean = false;

    await uniPlayer.waitLoadingAllInstruments();

    for (let i = 0; i < repeat; i++) {
      if (breakLoop) break;

      for (let loops of outLoops) {
        breakLoop = await uniPlayer.play(loops);

        if (breakLoop) break;
      }
    }
  }
}
