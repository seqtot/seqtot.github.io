import {Props} from 'framework7/modules/component/snabbdom/modules/props';
import { ComponentContext } from 'framework7/modules/component/component';
import { Range } from 'framework7/components/range/range';
import { Dom7Array } from 'dom7';
import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import * as un from '../libs/muse/utils/utils-note';
import keyboardSet from './page_keyboard-utils';
import { getNoteByOffset, parseInteger } from '../libs/muse/utils/utils-note';
import { standardTicks as ticks } from './ticks';
import { DrumCtrl, DrumKeyboardType } from './drum-ctrl';
import {BassSoloCtrl, ToneKeyboardType} from './tone-bass-solo-ctrl';
import ideService from './ide/ide-service';
import {Synthesizer} from '@muse/synthesizer';
import {MultiPlayer} from '@muse/multi-player';

type ViewType = ToneKeyboardType | DrumKeyboardType;

const ns = {
    setBmpAction: 'set-bmp-action',
    setNote: 'set-note',
};

interface Page {
    bpmValue: number;
    pageEl: HTMLElement;
    getMetronomeContent(): string;
    stopTicker();
    stop();
    synthesizer: Synthesizer;
    multiPlayer: MultiPlayer;
    context: ComponentContext,
}

export class KeyboardPage implements Page {
    view: ViewType = 'drums'; // 'bassSolo';
    drumCtrl: DrumCtrl;
    toneCtrl: BassSoloCtrl;

    bpmValue = 100;
    playingTick = '';
    bpmRange: Range.Range;
    tickInfo = {
        quarterTime: 0,
        quarterNio: 0,
    }
    tickNode: AudioBufferSourceNode | null = null;
    synthesizer = ideService.synthesizer;
    multiPlayer = ideService.multiPlayer;

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

    constructor(
        public props: Props,
        public context: ComponentContext
    ) {}

    onMounted() {
        //console.log(ideService.currentEdit);
        this.setRightPanelContent();
        this.setPageContent();
        setTimeout(() => {
            this.subscribeRightPanelEvents();
        }, 100);
    }

    setPageContent(view?: ViewType) {
        view = view ||  this.view;
        this.view = view;

        if (this.view === 'bassSolo' || this.view === 'bass') {
            this.setToneContent(this.view);
        }
        else
        {
            this.setDrumsContent('drums');
        }

        setTimeout(() => {
            this.subscribeCommonPageEvents();
            this.subscribePageEvents();
            //this.bpmRange.setValue(this.bpmValue);
        }, 100);
    }

    setRightPanelContent() {
        dyName('panel-right-content').innerHTML = `
            <p data-action-set-view="bass">Bass</p>
            <p data-action-set-view="bassSolo">Harmonica</p>
            <p data-action-set-view="drums">Percussion</p>
            <p data-action-set-view="drums">Drums</p>
        `;
    }

    getMetronomeContent(): string {
        return `
            <a data-tick-trigger="1:4"><b>1:4</b></a>&emsp;
            <a data-tick-trigger="2:4"><b>2:4</b></a>&emsp;
            <a data-tick-trigger="3:4"><b>3:4</b></a>&emsp;
            <a data-tick-trigger="4:4"><b>4:4</b></a>&emsp;
            <a data-action-type="stop"><b>stop</b></a>&emsp;
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
        `;
    }

    subscribeMetronomeEvents() {
        getWithDataAttr('tick-trigger', this.pageEl)?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => {
                this.playTick(el?.dataset?.tickTrigger);
            });
        });

        getWithDataAttrValue('action-type', 'tick', this.pageEl)?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => this.playTick3());
        });

        getWithDataAttrValue('action-type', 'test', this.pageEl)?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => this.playTick3());
        });

        getWithDataAttr(ns.setBmpAction, this.pageEl)?.forEach(
            (el: HTMLElement) => {
                el.addEventListener('pointerdown', () => {
                    this.bpmRange.setValue(parseInt(el?.dataset?.bpm, 10) || 100);
                    this.playTick(this.playingTick);
                });
            }
        );
    }

    setDrumsContent(type: DrumKeyboardType) {
        this.drumCtrl = new DrumCtrl(this);

        this.view = 'drums';
        this.el$.html(this.drumCtrl.getContent('drums'));

        //console.log('setDrumContent', this.bpmValue);

        this.bpmRange = (this.context.$f7 as any).range.create({
            el: dyName('slider', this.pageEl),
            on: {
                changed: (range: any) => {
                    this.bpmValue = range.value;
                },
            },
        });

        setTimeout(() => {
            //  this.subscribeViewInfoEvents();
            //  this.bpmValue = this.outBlock.bpm;
            this.bpmRange.setValue(this.bpmValue);
        }, 100);
    }

    setToneContent(type: ToneKeyboardType) {
        this.toneCtrl = new BassSoloCtrl(this, <ToneKeyboardType>this.view);

        const content = `
            <div class="page-content" style="padding-top: 0; padding-bottom: 2rem;">
                ${this.getTracksContent()}                
                <div data-name="setContent">
                    ${this.toneCtrl.getContent(type)}
                </div>
            </div>`.trim();

        //${this.setInfo.content}

        this.el$.html(content);

        this.bpmRange = (this.context.$f7 as any).range.create({
            // jjkl
            el: dyName('slider', this.pageEl),
            on: {
                changed: (range: any) => {
                    //console.log('range.onChange', range); // jjkl
                    this.bpmValue = range.value;

                    if (this.playingTick) {
                        this.playTick(this.playingTick);
                    }
                },
            },
        });
    }

    subscribeRightPanelEvents() {
        getWithDataAttr('action-set-view', dyName('panel-right-content'))?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => {
                this.setPageContent(<any>el.dataset.actionSetView);
            });
        });
    }

    subscribeCommonPageEvents() {
        getWithDataAttrValue('action-type', 'stop', this.pageEl)?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => this.stop());
        });
    }

    subscribePageEvents() {
        if (this.view === 'bassSolo' || this.view === 'bass') {
            this.toneCtrl.subscribeEvents();
            //this.toneCtrl.subscribeRelativeKeyboardEvents();
        }
        else if (this.view === 'drums') {
            this.subscribeMetronomeEvents();
            this.drumCtrl.subscribeEvents();
        }

        // getWithDataAttr('note-line', this.pageEl)?.forEach((el) => {
        //     el.addEventListener('click', (evt: MouseEvent) => {
        //         this.tryPlayTextLine({
        //             text: el?.dataset?.noteLine,
        //         });
        //     });
        // });
        //
        // getWithDataAttr('relative-key', this.pageEl)?.forEach((el: HTMLElement) => {
        //     el.addEventListener('pointerdown', () => {
        //         const wrapper = dyName('relative-keyboard-wrapper');
        //
        //         if (!wrapper) {
        //             return;
        //         }
        //
        //         let baseNote = wrapper.dataset.relativeKeyboardBase || 'do';
        //         let note = un.getNoteByOffset(baseNote, el.dataset.relativeKey);
        //
        //         if (!note) {
        //             return;
        //         }
        //
        //         wrapper.dataset.relativeKeyboardBase = note;
        //
        //         getWithDataAttr(ns.setNote, this.pageEl)?.forEach((el: HTMLElement) => {
        //             el.style.backgroundColor = 'white';
        //         });
        //
        //         if (dyName(`set-note-${note}`, this.pageEl)) {
        //             dyName(`set-note-${note}`, this.pageEl).style.backgroundColor =
        //                 'lightgray';
        //         }
        //
        //         this.tryPlayTextLine({ text: `b60 ${note}-25` });
        //     });
        // });
        //
        // getWithDataAttr(ns.setNote, this.pageEl)?.forEach((el: HTMLElement) => {
        //     el.addEventListener('pointerdown', () => {
        //         const wrapper = dyName('relative-keyboard-wrapper', this.pageEl);
        //
        //         if (!wrapper) {
        //             return;
        //         }
        //
        //         getWithDataAttr(ns.setNote, this.pageEl)?.forEach((el: HTMLElement) => {
        //             el.style.backgroundColor = 'white';
        //         });
        //
        //         el.style.backgroundColor = 'lightgray';
        //         const note = el.innerText.trim();
        //         wrapper.dataset.relativeKeyboardBase = note;
        //         this.tryPlayTextLine({ text: `b60 ${note}-25` });
        //     });
        // });
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

    stopTicker() {
        ideService.ticker.stop();
        ideService.synthesizer.playSound({
            keyOrNote: 'cowbell',
            id: 'ticker',
            onlyStop: true,
        });

        if (this.tickNode) {
            this.tickNode.stop();
            this.tickNode = null;
        }
    }

    playTick3() {
        this.stopTicker();

        const cb = (x: {ab: AudioBufferSourceNode, startTimeMs: number}) => {
            this.tickNode = x.ab;
            this.drumCtrl.tickStartMs = x.startTimeMs;
            //console.log('start');
            // setTimeout(() => {
            //     x.ab.stop(0);
            //     x.ab.stop(0);
            // }, 2000);
        }

        ideService.ticker.createTickSource({
            qms: Math.round(60000/ this.bpmValue),
            preset: ideService.synthesizer.instruments['drum_56'],
            repeat: 100,
            cb,
        });
    }

    playTick2(name?: string) {
        this.tickInfo = {
            quarterTime: Date.now(),
            quarterNio: -1,
        }

        ideService.ticker.tickByBpm({
            bpm: this.bpmValue,
        }, () => {
            ideService.synthesizer.playSound({
                keyOrNote: 'cowbell',
                id: 'ticker',
                onlyStop: true,
            });
            ideService.synthesizer.playSound({
                keyOrNote: 'cowbell',
                id: 'ticker',
                onlyStop: false,
            });
            this.tickInfo = {
                quarterTime: Date.now(),
                quarterNio: this.tickInfo.quarterNio + 1,
            }
        });
    }

    playTick(name?: string) {
        name = name || '';
        this.playingTick = name;

        ideService.metronome.stopAndClearMidiPlayer();

        const tick = ticks[this.playingTick];

        if (!tick) {
            this.playingTick = '';

            return;
        }

        const blocks = `
        <out r1000000>
        tick

        ${tick}
        `;

        ideService.metronome.tryPlayMidiBlock({
            blocks,
            bpm: this.bpmValue,
            // cb: (type, data) => {
            //     if (type === 'tick' && !data.isVirtTick) {
            //         this.tickTime = Date.now();
            //     }
            //
            //     //console.log(type, this.tickCount, data);
            // }
        });
    }

    async tryPlayTextLine({ text, repeat }: { text: string; repeat?: number }) {
        return ideService.multiPlayer.tryPlayTextLine({ text, repeat });
    }

    stop() {
        ideService.multiPlayer.stopAndClearMidiPlayer();
        ideService.metronome.stopAndClearMidiPlayer();
        this.stopTicker();
    }

    async play(text: string, repeatCount?: number) {
        ideService.multiPlayer.tryPlayMidiBlock({
            blocks: text,
            repeatCount,
            //bpmMultiple: this.bpmMultiple,
        });
    }
}
