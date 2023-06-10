import { Props } from 'framework7/types/modules/component/snabbdom/modules/props';
import { ComponentContext } from 'framework7/modules/component/component';
import { Range } from 'framework7/types/components/range/range';
import { Dom7Array } from 'dom7';

import {byId, dyName, getWithDataAttr, getWithDataAttrValue} from '../src/utils';
import { Sound } from '../muse/sound';
import { MultiPlayer } from '../muse/multi-player';
import { Synthesizer } from '../muse/synthesizer';
import * as un from '../muse/utils/utils-note';
import { toneAndDrumPlayerSettings } from '../muse/keyboards';
import keyboardSet from './page_keyboard-utils';
import { getNoteByOffset, parseInteger } from '../muse/utils/utils-note';
import { standardTicks as ticks } from './ticks';
import {drumInfo, Drums} from '../muse/drums';

const multiPlayer = new MultiPlayer();
const metronome = new MultiPlayer();
const synthesizer = new Synthesizer();
synthesizer.connect({ ctx: Sound.ctx });
synthesizer.setSettings(toneAndDrumPlayerSettings);

type ViewType = 'bassSolo' | 'drums';

const ns = {
    setBmpAction: 'set-bmp-action',
    setNote: 'set-note',
};

const defaultNote = 'da';

export class BassSoloCtrl {

}

// const drumsMap = {
//     O: {
//         instr: 'drum_35',
//         note: 'bd',
//
//     },
//     V: {
//         note: 'sn',
//         instr: 'drum_40',
//     },
//     X: {
//         note: 'hc',
//         instr: 'drum_42',
//     },
// }


export class KeyboardPage {
    view: ViewType = 'bassSolo';
    ctrl: BassSoloCtrl = new BassSoloCtrl();

    bpmValue = 100;
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

    constructor(public props: Props, public context: ComponentContext) {
    }

    onMounted() {
        this.setRightPanelContent();
        this.setPageContent();
        setTimeout(() => {
            this.subscribeRightPanelEvents();
        }, 100);
    }

    // dyName('action-drums', dyName('panel-right-content')).addEventListener(
    //     'click',
    //     () => {
    //         //console.log('action-info');
    //         this.setViewDrums();
    //     }
    // );

    // dyName('action-info', dyName('panel-right-content')).addEventListener(
    //     'click',
    //     () => {
    //         //console.log('action-info');
    //         this.setViewInfo();
    //     }
    // );

    setPageContent(view?: ViewType) {
        view = view ||  this.view;
        this.view = view;

        if (this.view === 'bassSolo') {
            this.setBassSoloContent();
        }
        else
        {
            this.setDrumsContent();
        }

        setTimeout(() => {
            this.subscribeCommonPageEvents();
            this.subscribePageEvents();
        }, 100);
    }

    setRightPanelContent() {
        dyName('panel-right-content').innerHTML = `
      <p data-action-set-view="bassSolo">bassSolo</p>
      <p data-action-set-view="drums">drums</p>
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

        getWithDataAttr(ns.setBmpAction, this.pageEl)?.forEach(
            (el: HTMLElement) => {
                el.addEventListener('pointerdown', () => {
                    this.bpmRange.setValue(parseInt(el?.dataset?.bpm, 10) || 100);
                    this.playTick(this.playingTick);
                });
            }
        );
    }

    setDrumsContent() {
        this.view = 'drums';

        const topRowHeight = 7;
        const midRowHeight = 10;

        let metronome = `
            <div style="padding: 1rem .5rem 1rem .5rem;">
                &emsp;${this.getMetronomeContent()}
            </div>`.trim();

        let drums = Object.keys(drumInfo).reduce((acc, key) => {
            const info = drumInfo[key];
            const label = key === info.noteLat ? key: `${key}:${info.noteLat}`;

            acc = acc + `
                <a data-action-drum="${info.noteLat}" style="user-select: none;">${label}</a>&emsp;            
            `.trim();

            return acc;
        }, '');

        const content = `
            <div class="page-content" style="padding-top: 0; padding-bottom: 2rem;">
                ${metronome}
                
                <div style="display: flex; user-select: none; touch-action: none;">
                    <div style="width: 66%;">
                        <div style="display: flex; width: 100%;">
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; background-color: lightcyan; user-select: none; touch-action: none;"
                                data-action-drum="cowbell"
                            >
                                bpm
                            </div>
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; background-color: lightyellow; user-select: none; touch-action: none;"
                                data-action-drum="cowbell"                                
                            >
                                2
                            </div>
                        </div>                        
                        
                        <div 
                            style="width: 100%; height: ${midRowHeight}rem; background-color: whitesmoke; user-select: none; touch-action: none;"
                            data-action-drum="hc"
                        >
                    <pre style="font-family: monospace; font-size: 1.6rem; margin: 0; padding: 0; padding-left: 0;">
QoxoAoq_
X_qoA_xv
Q_q_Aoxo
X_x_A_xv</pre>
                        </div>
                        <div
                            style="width: 100%; height: ${topRowHeight}rem; background-color: tan; user-select: none; touch-action: none;"
                            data-action-drum="bd"                
                        >
                            O-o<br/>(Q-q)
                        </div>                    
                    </div>

                    <div style="width: 33%; user-select: none; touch-action: none;">
                        <div
                            style="height: ${topRowHeight + midRowHeight}rem; width: 100%; background-color: lightpink; user-select: none; touch-action: none;"
                            data-action-drum="sn"
                        >
                            V-v<br/>(A-a)
                        </div>
                        <div style="width: 100%; height: ${topRowHeight}rem; border: 1px solid black; user-select: none; touch-action: none;">
                            stop
                        </div>
                    </div>                    
                </div>

                <div style="margin: .5rem; user-select: none; touch-action: none;">
                    <span style="font-size: 1.5rem; user-select: none; touch-action: none;" data-action="clear">
                        clr&nbsp;&nbsp;
                    </span>                
                </div>
                
                
                <div style="margin: .5rem; user-select: none;">
                    <pre style="font-family: monospace; font-size: 1.7rem; margin: .5rem;">
O-k-T-k-O---O-kt
O-k-T-k-O---B---
O-ktK-v-O---O---
O-k-|-k-O-k-V---
O---|-k-O---B---
O---T-k-O---A---
O---T-k-O---O---</pre>                                                        
                </div>

                
                <div style="margin: .5rem; user-select: none;">
                    <pre style="font-family: monospace; font-size: 1.7rem; margin: .5rem;">
QoxoAoq_X_qoA_xv
Q_q_AoxoX_x_A_xv</pre>                                                        
                </div>
                                    
                <div style="margin: .5rem; user-select: none;">
                    <pre style="font-family: monospace; font-size: 1.7rem; margin: .5rem;">
Q_q_Aoq_X_q_A_xv
Q_q_AoxoX_qoA_xv</pre>
                </div>
                
            <div style="font-size: 1.5rem;">
                ${drums}            
            </div>
                
            </div>`.trim();

        this.el$.html(content);

        this.bpmRange = (this.context.$f7 as any).range.create({
            el: dyName('slider', this.pageEl),
            on: {
                changed: (range: any) => {
                    this.bpmValue = range.value;
                },
            },
        });
    }

    setBassSoloContent() {
        const content = `
            <div class="page-content" style="padding-top: 0; padding-bottom: 2rem;">
                ${this.getTracksContent()}                
                <div data-name="setContent">
                    ${this.setInfo.content}
                </div>
            </div>`.trim();

        this.el$.html(content);

        this.bpmRange = (this.context.$f7 as any).range.create({
            // jjkl
            el: dyName('slider', this.pageEl),
            on: {
                changed: (range: any) => {
                    // console.log('range.onChange', range); // jjkl
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
        if (this.view === 'bassSolo') {
            this.subscribeBassSoloEvents();
        }
        else if (this.view === 'drums') {
            this.subscribeMetronomeEvents();
            this.subscribeDrumsEvents();
        }

        //this.subscribeRelativeKeyboardEvents();

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

    subscribeDrumsEvents() {
        getWithDataAttr('action-drum', this.pageEl)?.forEach((el: HTMLElement) => {
            //const info = drumsMap[el.dataset['actionDrum']];
            const keyOrNote = el.dataset['actionDrum'];
            const volume = keyOrNote === 'cowbell' ? 0.30 : undefined

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                synthesizer.playSound({
                    keyOrNote,
                    id: 'drum',
                    //instrCode: info.instr,
                    onlyStop: false,
                    volume
                });
            });
            //
            el.addEventListener('pointerup', (evt: MouseEvent) => {
                synthesizer.playSound({
                    keyOrNote,
                    id: 'drum',
                    //instrCode: info.instr,
                    onlyStop: true,
                });
            });
        });

    }

    subscribeBassSoloEvents() {
        getWithDataAttr('note-key', this.pageEl)?.forEach((el: HTMLElement) => {
            const keyboardId = el?.dataset?.keyboardId;
            const keyOrNote = el?.dataset?.noteLat || '';

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                synthesizer.playSound({
                    keyOrNote: this.playingNote[keyboardId],
                    id: keyboardId,
                    onlyStop: true,
                });

                this.playingNote[keyboardId] = keyOrNote;

                synthesizer.playSound({
                    keyOrNote,
                    id: keyboardId,
                    // instrCode: 366,
                });

                this.setKeysColor();
            });

            el.addEventListener('pointerup', (evt: MouseEvent) => {
                synthesizer.playSound({
                    keyOrNote,
                    id: keyboardId,
                    onlyStop: true,
                });

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

        fixEl?.addEventListener('pointerdown', (evt: MouseEvent) => {
            const keyboardId = fixEl?.dataset?.keyboardId;

            synthesizer.playSound({
                keyOrNote: this.playingNote[keyboardId],
                id: keyboardId,
                onlyStop: true,
            });

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

        fixEl?.addEventListener('pointerup', (evt: MouseEvent) => {
            const keyboardId = fixEl?.dataset?.keyboardId;

            synthesizer.playSound({
                keyOrNote: this.lastRelativeNote,
                id: keyboardId,
                onlyStop: true,
            });

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

                synthesizer.playSound({
                    keyOrNote: this.playingNote[keyboardId],
                    id: keyboardId,
                    onlyStop: true,
                });
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

                synthesizer.playSound({
                    keyOrNote: note,
                    id: keyboardId,
                    onlyStop: true,
                });

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

        metronome.stopAndClearMidiPlayer();

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

        metronome.tryPlayMidiBlock({
            blocks,
            bpm: this.bpmValue,
        });
    }

    async tryPlayTextLine({ text, repeat }: { text: string; repeat?: number }) {
        return multiPlayer.tryPlayTextLine({ text, repeat });
    }

    stop() {
        multiPlayer.stopAndClearMidiPlayer();
    }

    async play(text: string, repeatCount?: number) {
        multiPlayer.tryPlayMidiBlock({
            blocks: text,
            repeatCount,
            //bpmMultiple: this.bpmMultiple,
        });
    }
}
