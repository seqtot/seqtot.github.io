import { Props } from 'framework7/modules/component/snabbdom/modules/props';
import { ComponentContext } from 'framework7/modules/component/component';
import { Range } from 'framework7/components/range/range';
import { Dom7Array } from 'dom7';

import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import * as un from '../libs/muse/utils/utils-note';
import { standardTicks as ticks } from './ticks';
import { getMidiConfig, getTopOutList } from '../libs/muse/utils/getMidiConfig';
import { RowInfo } from '../libs/muse/utils/getMidiConfig';
import { FileSettings, getFileSettings } from '../libs/muse/utils/getFileSettings';
import { isPresent, parseInteger, TextBlock } from '../libs/muse/utils/utils-note';
import { LineModel } from './line-model';
import mboxes from '../mboxes';
import ideService from './ide/ide-service';

const ns = {
    setBmpAction: 'set-bmp-action',
    setNote: 'set-note',
};

export class MBoxPage {
    view: 'info' | 'drums' = 'info';
    bpmValue = 100;
    playingTick = '';
    bpmRange: Range.Range;
    blocks: un.TextBlock[] = [];
    settings: FileSettings = <any>{};
    pitchShift: number = 0;
    excludePartNio: number [] = [];
    excludeInstrument: {[key: string]: any} = {};

    get pageId(): string {
        return this.props.id;
    }

    get songId(): string {
        return this.props.song;
    }

    get pageEl(): HTMLElement {
        return this.context.$el.value[0] as HTMLElement;
    }

    get el$(): Dom7Array {
        return this.context.$el.value;
    }

    get pageData(): {
        content: string;
        break: string;
        drums: string;
        tracks: { key: string; value: string; name: string }[];
        hideMetronome?: boolean;
        score: string;
        dynamic: {[key: string]: {
            [key: string]: {
                    items: any[]
                }
            }
        }
    } {
        return mboxes[this.songId];
    }

    get outBlock(): TextBlock {
        return  this.blocks.find((item) => item.id === 'out');
    }

    get topOutParts(): string[] {
        return  getTopOutList({topBlock: this.outBlock});
    }

    getId(id: string): string {
        return this.pageId + '-' + id;
    }

    constructor(
        public props: Props,
        public context: ComponentContext,
    ) {}

    onMounted() {
        this.setRightPanelContent();
        this.setPageContent();
    }

    setRightPanelContent() {
        // dyName('panel-right-content').innerHTML = `
        //   <p data-name="action-info">табы</p>
        //   <p data-name="action-drums">барабан</p>
        // `;

        dyName('panel-right-content').innerHTML = ``.trim();
    }

    getMetronomeContent(): string {
        let metronomeView = `&emsp;
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
            ></div>
        `.trim();

        if (this.pageData.hideMetronome) {
            metronomeView = '';
        }

        return metronomeView;
    }

    setPageContent() {
        this.view = 'info';
        this.blocks = un.getTextBlocks(this.pageData.score) || [];
        this.settings = getFileSettings(this.blocks);
        this.pitchShift = un.parseInteger(this.settings.pitchShift[0]);

        //console.log('settings', this.settings);
        //console.log('this.blocks', this.blocks);

        const content = `
            <div class="page-content" style="padding-top: 0; padding-bottom: 2rem;">
                <div style="padding: 1rem .5rem 1rem .5rem;">
                    ${this.getMetronomeContent()}
                </div>
                
                ${this.getInstrumentsContent()}                
                ${this.getTracksContent()}
                
                <div data-name="pageContent">
                    ${this.pageData.content}
                </div>
            </div>
        `.trim();

        this.el$.html(content);

        this.bpmRange = (this.context.$f7 as any).range.create({ // jjkl
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

        setTimeout(() => {
            this.subscribeViewInfoEvents();
            this.bpmValue = this.outBlock.bpm;
            this.bpmRange.setValue(this.bpmValue);
        }, 100);
    }

    getInstrumentsContent(): string {
        let items = '';

        Object.keys(this.settings.metaByLines).forEach(key => {
            items = items + `
                <span
                    style="font-weight: 700;"                  
                    data-action-use-instrument="${key}"
                >
                    ${key}
                </span>&emsp;            
            `.trim();
        })

        return `
            <div style="margin: .5rem 1rem;">
                ${items}                
            </div>        
        `.trim();
    }

    getTracksContent(): string {
        let topOutParts = this.topOutParts;

        let stopAndPlayActions = `
            <div style="margin: .5rem 1rem;">
                <a data-action-type="select-all"><b>selectAll</b></a>&emsp;
                <a data-action-type="unselect-all"><b>unselect</b></a>&emsp;
                <a data-action-type="stop"><b>stop</b></a>&emsp;                                                
                <a data-action-type="play-all"><b>play</b></a>&emsp;
                <a data-action-type="edit-selected"><b>edit</b></a>&emsp;                
            </div>`.trim();

        let tracks = topOutParts.reduce((acc, item, i) => {
            acc = acc + `
                <div class="row">
                    <span
                        style="margin-left: 1rem; font-weight: 700; user-select: none;"
                        data-part-nio="${i+1}"
                        data-part-ref="${item}"                        
                    >${item}</span>
                    <span
                        style="margin-right: 1rem; user-select: none;"
                        data-part-nio="${i+1}"
                        data-edit-part-link="${i+1}"                                           
                    >edit</span>                    
                </div>
            `.trim();

                return acc;
            }, '');

        return stopAndPlayActions + tracks  + stopAndPlayActions;
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
        });
    }

    subscribeViewInfoEvents() {
        this.subscribePageEvents();
        this.subscribeMetronomeEvents();
        this.subscribeTrackEvents();
        this.subscribeInstrumentEvents();
    }

    subscribeInstrumentEvents() {
        getWithDataAttr('action-use-instrument', this.pageEl)?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => {
                let el: HTMLElement = evt.target as any;
                let key = el.dataset.actionUseInstrument;

                if (this.excludeInstrument[key]) {
                    this.excludeInstrument[key] = null;
                    el.style.fontWeight = '700';
                }
                else {
                    this.excludeInstrument[key] = key;
                    el.style.fontWeight = '400';
                }
            });
        });
    }

    gotoEdit(partNio?: number) {
        let editPartsNio: number[] = [];

        if (partNio) {
            editPartsNio = [partNio];
        } else {
            editPartsNio = this.topOutParts
                .map((item, i) => (i+1))
                .filter(nio => !this.excludePartNio.includes(nio));
        }

        if (!editPartsNio.length) return;

        ideService.currentEdit.name = this.songId;
        ideService.currentEdit.topOutParts = this.topOutParts;
        ideService.currentEdit.blocks = this.blocks;
        ideService.currentEdit.outBlock = this.outBlock;
        ideService.currentEdit.metaByLines = this.getMetaByLines();
        ideService.currentEdit.freezeStructure = true;
        ideService.currentEdit.editPartsNio = editPartsNio;

        this.context.$f7router.navigate('/page/page_keyboard/');
    }

    subscribeTrackEvents() {
        getWithDataAttr('part-ref', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', (evt ) => {
                //let el: HTMLElement = evt.target as any;
                let partNio = parseInteger(el.dataset.partNio, null);

                if (!isPresent(partNio)) {
                    return;
                }

                if (this.excludePartNio.includes(partNio)) {
                    this.excludePartNio = this.excludePartNio.filter(item => item !== partNio );
                    el.style.fontWeight = '700';
                }
                else {
                    this.excludePartNio.push(partNio);
                    el.style.fontWeight = '400';
                }
            });
        });

        getWithDataAttr('edit-part-link', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerdown', () => {
                let partNio = parseInteger(el.dataset.partNio, null);

                if (!isPresent(partNio)) {
                    return;
                }

                this.gotoEdit(partNio);
            });
        });

        // this.pageData.tracks.forEach((item) => {
        //     byId(`${this.getId('action-play-' + item.key)}`).addEventListener(
        //         'click',
        //         (evt: MouseEvent) => {
        //             //console.log('subscribViewDrumsEvents', item.key);
        //
        //             const track = this.pageData.tracks.find(
        //                 (track) => track.key === item.key
        //             );
        //
        //             if (!track) return;
        //
        //             this.play(track.value);
        //         }
        //     );
        // });
    }

    subscribePageEvents() {
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
        //         this.setPageContent();
        //     }
        // );

        getWithDataAttr('note-line', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerdown', () => {
                this.tryPlayTextLine({
                    text: el?.dataset?.noteLine,
                });
            });
        });

        getWithDataAttrValue('action-type', 'stop', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerdown', () => this.stop());
        });

        getWithDataAttrValue('action-type', 'play-all', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerdown', () => this.playAll(0));
        });

        getWithDataAttrValue('action-type', 'select-all', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerdown', () => {
                this.excludePartNio = [];

                getWithDataAttr('part-ref', this.pageEl).forEach(el => {
                    el.style.fontWeight = '700';
                });
            });
        });

        getWithDataAttrValue('action-type', 'unselect-all', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerdown', () => {
                const topOutParts = this.topOutParts;

                getWithDataAttr('part-ref', this.pageEl).forEach(el => {
                    el.style.fontWeight = '400';
                });

                this.excludePartNio = topOutParts.map((item, i) => i+1);
            });
        });

        getWithDataAttrValue('action-type', 'edit-selected', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerdown', () => this.gotoEdit());
        });
    }

    subscribeMetronomeEvents() {
        getWithDataAttr('tick-trigger', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
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

    async tryPlayTextLine({ text, repeat }: { text: string; repeat?: number }) {
        return ideService.multiPlayer.tryPlayTextLine({ text, repeat });
    }

    getMetaByLines(): {[key: string]: string} {
        const metaByLines = {
            ...this.settings.metaByLines
        };

        Object.keys(metaByLines).forEach(key => {
            if (this.excludeInstrument[key]) {
                metaByLines[key] = 'v0';
            }
        })

        //console.log(this.settings, metaByLines);

        return metaByLines;
    }

    playAll(index: number | string = 0) {
        this.stop();

        index = parseInteger(index, 0);

        let currRowInfo: RowInfo = { first: index, last: index}; // индекс в текущем блоке

        const x = {
            blocks: this.blocks,
            currBlock: null as un.TextBlock,
            currRowInfo: currRowInfo,
            excludeIndex: this.excludePartNio,
            midiBlockOut: null as un.TextBlock,
            playBlockOut: '' as string | un.TextBlock,
            topBlocksOut: [],
        };

        x.currBlock = x.blocks.find((item) => item.id === 'out');
        getMidiConfig(x);
        const playBlock = x.playBlockOut as TextBlock;

        //console.log('getMidiConfig', x);

        let blocks = [...x.blocks];

        // DYNAMIC
        if (this.pageData.dynamic?.['@drums']) {
            const map = this.pageData.dynamic?.['@drums'];

            playBlock.rows.forEach((row, i) => {
                let rowPartNio = un.getNFromString(row).text;

                if (!rowPartNio || !map[rowPartNio] || !map[rowPartNio].items && !map[rowPartNio].items.length) {
                    return;
                }

                let rows = map[rowPartNio].items[0].rows;

                if (Array.isArray(rows)) {
                     rows = LineModel.CloneRows(rows);
                     rows.forEach(row => (row.blockOffsetQ = 0));
                } else {
                    return;
                }

                const notes = LineModel.GetDrumNotes('temp' + ideService.guid.toString(), rows);

                if (notes) {
                    const block = un.getTextBlocks(notes)[0];
                    blocks = [...blocks, block];
                    playBlock.rows[i] = playBlock.rows[i] + ' ' + block.id;
                }
            });
        }

        if (x.playBlockOut) {
            ideService.multiPlayer.tryPlayMidiBlock({
                blocks,
                playBlock,
                cb: (type: string, data: any) => {
                    if (type === 'break' || type === 'finish') {
                        // this.playingWithMidi = false;
                    }
                    //console.log(type, data);
                },
                excludeLines: this.settings.exclude,
                metaByLines: this.getMetaByLines(),
                pitchShift: un.parseInteger(this.settings.pitchShift[0]),
                bpm: this.bpmValue,
                //beatsWithOffsetMs: un.getBeatsByBpmWithOffset(90, 8),
            });

            return;
        }

        ideService.multiPlayer.stopAndClearMidiPlayer();
    }

    stop() {
        ideService.multiPlayer.stopAndClearMidiPlayer();
    }

    async play(text: string, repeatCount?: number) {
        ideService.multiPlayer.tryPlayMidiBlock({
            blocks: text,
            repeatCount,
            //bpmMultiple: this.bpmMultiple,
        });
    }
}
