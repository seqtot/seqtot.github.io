import { Props } from 'framework7/modules/component/snabbdom/modules/props';
import { ComponentContext } from 'framework7/modules/component/component';
import { Range } from 'framework7/components/range/range';
import { Dialog } from 'framework7/components/dialog/dialog';
import { Dom7Array } from 'dom7';

import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import * as un from '../libs/muse/utils/utils-note';
import { standardTicks as ticks } from './ticks';
import {getMidiConfig, getTopOutList, MidiConfig} from '../libs/muse/utils/getMidiConfig';
import { RowInfo } from '../libs/muse/utils/getMidiConfig';
import {FileSettings, getFileSettings, getPitchShiftSetting} from '../libs/muse/utils/getFileSettings';
import {isPresent, parseInteger, SongPartInfo, TextBlock} from '../libs/muse/utils/utils-note';
import { LineModel } from './line-model';
import mboxes from '../mboxes';
import { ideService } from './ide/ide-service';
import {SongStore, SongPage, StoredRow} from './song-store';
import { sings } from './sings';

export class MBoxPage {
    view: 'list' | 'song' = 'list';
    bpmValue = 100;
    playingTick = '';
    bpmRange: Range.Range;
    blocks: un.TextBlock[] = [];
    settings: FileSettings = <any>{};
    pitchShift: number = 0;
    excludePartNio: number [] = [];
    excludeTrack: {[key: string]: any} = {};

    selectedSong = '';

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

    get pageData(): SongPage {

        if (mboxes[this.songId]) {
            return mboxes[this.songId];
        }

        return SongStore.getSong(this.songId, true);
    }

    get outBlock(): TextBlock {
        return  this.blocks.find((item) => item.id === 'out');
    }

    get isMy():boolean {
        return this.pageData.source === 'my';
    }

    get allSongParts(): string[] {
        if (this.isMy) {
            const song = SongStore.getSong(this.songId, true);

            return song.parts.map((item, i) => {
                return `${item.name} %${item.id} №${i+1}`;
            });
        }

        if (!Array.isArray(this.blocks) || !this.blocks.length) {
            return [];
        }

        return getTopOutList({topBlock: this.outBlock, printN: true});
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

    getListPageContent(): string {
        let content = this.pageData.content;
        let songListContent = '';
        let commands = '';
        const btnStl = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;
        const isMy = this.isMy;

        if (this.isMy) {
            songListContent = '';
            const songs = SongStore.getSongs();

            songs.forEach(song => {
                content += `<div class="row" style="margin: .5rem;">
                    <div>
                        <span
                            style="font-weight: 400; user-select: none;"
                            data-song-id="${song.id}"
                            data-song-item="${song.id}"                        
                        >${song.name}</span>
                    </div>
                    <div>
                        <span
                            style="${btnStl} margin-right: .5rem;"
                            data-song-id="${song.id}"
                            data-edit-song-action="${song.id}"
                        >${sings.edit}</span>                                           
                    </div>
                </div>`;
            });

            commands = `
            <div style="margin: .5rem; margin-top: 1rem;">
                <span
                    style="${btnStl} margin-right: .5rem;"
                    data-move-song-up-action
                >&nbsp;&uarr;&nbsp;</span>
                <span
                    style="${btnStl} margin-right: .5rem;"
                    data-move-song-down-action
                >&nbsp;&darr;&nbsp;</span>                        
                <span
                    style="${btnStl} margin-right: 1rem;"
                    data-rename-song-action
                >name</span>
                <span 
                    style="${btnStl} margin-right: 1rem;"
                    data-add-song-action="add-song"
                >${sings.add}</span>                                    
                <span
                    style="${btnStl} color: red;"
                    data-delete-song-action
                >${sings.delete}</span>
            </div>
        `.trim();
        }

        let metronome = `
            <div style="padding: 1rem .5rem 1rem .5rem;">${this.getMetronomeContent()}</div>        
        `.trim();

        return `
            ${metronome}
            ${commands}
            ${songListContent}
            <div data-name="pageContent">${content}</div>
        `.trim();
    }

    getSongPageContent(): string {
        return `
            <div style="padding: 1rem .5rem 1rem .5rem;">
                ${this.getMetronomeContent()}
            </div>
            
            ${this.getInstrumentsContent()}                
            ${this.getSongPartsContent()}
            
            <div data-name="pageContent">
                ${this.pageData.content}
            </div>
        `.trim();
    }

    setPageContent() {
        this.view = this.pageData.isSongList ? 'list' : 'song';

        this.blocks = un.getTextBlocks(this.pageData.score) || [];
        this.settings = getFileSettings(this.blocks);
        this.pitchShift = getPitchShiftSetting(this.settings);

        const wrapper = `
            <div
                class="page-content"
                data="page-content"
                style="padding-top: 0;
                padding-bottom: 2rem;"
            >%content%</div>
        `.trim();
        let content = '';

        if (this.pageData.isSongList) {
            content = wrapper.replace('%content%', this.getListPageContent());
            this.el$.html(content);
            this.updateSongListView();
        }
        else {
            content = wrapper.replace('%content%', this.getSongPageContent());
            this.el$.html(content);
            this.updatePartListView();
        }

        this.bpmRange = (this.context.$f7 as any).range.create({
            el: dyName('slider', this.pageEl),
            on: {
                changed: (range: any) => {
                    this.bpmValue = range.value;

                    if (this.playingTick) {
                        this.playTick(this.playingTick);
                    }
                },
            },
        });

        setTimeout(() => {
            this.subscribeEvents();
            this.bpmValue = this.outBlock?.bpm || 100;
            this.bpmRange.setValue(this.bpmValue);
        }, 100);
    }

    getInstrumentsContent(): string {
        let items = '';


        if (this.isMy) {
            const song = SongStore.getSong(this.songId, true);
            song.tracks.forEach(track => {
                items = items + `
                <span
                    style="font-weight: 700;"                  
                    data-use-track-action="${track.name}"
                >
                    ${track.name}
                </span>&emsp;            
            `.trim();
            });
        } else {
            Object.keys(this.settings.dataByTracks).forEach(key => {
                items = items + `
                <span
                    style="font-weight: 700;"                  
                    data-use-track-action="${key}"
                >
                    ${key}
                </span>&emsp;            
            `.trim();
            });
        }

        const result =  `
            <div style="margin: .5rem 1rem;">
                ${items}                
            </div>        
        `.trim();

        return result;
    }


    getSongPartsContent(): string {
        let allSongParts = this.allSongParts;
        const isMy = this.pageData.source === 'my';

        const btnStl = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1.2rem; user-select: none; touch-action: none;`;
        let addPart = `<span style="${btnStl}" data-action-type="add-part">${sings.add}</span>&emsp;`;
        addPart = isMy ? addPart : '';

        const commandsWrapper = `
            <div style="margin: .5rem 1rem;">
                %content%
            </div>        
        `.trim();

        let commands = `
            <div>
                <span style="${btnStl}" data-action-type="unselect-all">${sings.unselect}</span>&emsp;            
                <span style="${btnStl}" data-action-type="select-all">${sings.select}</span>&emsp;
                <span style="${btnStl}" data-action-type="edit-selected">${sings.edit}</span>&emsp;
                ${addPart}                                
                <span style="${btnStl} color: gray;" data-action-type="stop">${sings.stop}</span>&emsp;                                                
                <span style="${btnStl} color: blue;" data-action-type="play-all">${sings.play}</span>&emsp;
            </div>
            <div style="margin-top: 1rem;">
                <span
                    style="${btnStl} margin-right: .5rem;"
                    data-move-part-up-action
                >&nbsp;&uarr;&nbsp;</span>
                <span
                    style="${btnStl} margin-right: .5rem;"
                    data-move-part-down-action
                >&nbsp;&darr;&nbsp;</span>
                <span
                    style="${btnStl} margin-right: 1rem;"
                    data-rename-part-action                                           
                >name</span>                                    
                <span
                    style="${btnStl} margin-right: 1rem;"
                    data-clone-part-action                                           
                >clone</span>
                <span
                    style="${btnStl} color: red;"
                    data-delete-part-action                                          
                >${sings.delete}</span>
            </div>
        `.trim();

        if (!allSongParts.length) {
            commands = addPart;
        }

        commands = commandsWrapper.replace('%content%', commands);

        let tracks = allSongParts.reduce((acc, item, i) => {
            const info = un.getPartInfo(item);

            acc = acc + `
                <div class="row" style="margin: .5rem;">
                    <span
                        style="font-weight: 700; user-select: none;"
                        data-part-nio="${i+1}"
                        data-part-item="${info.ref}"                        
                    >${info.partNio}&nbsp;&nbsp;${info.ref}</span>
                    <div>                                            
                        <span
                            style="${btnStl} margin-right: .5rem;"
                            data-part-nio="${i+1}"
                            data-part-id="${info.partId}"
                            data-edit-part-action="${i+1}"                                           
                        >${sings.edit}</span>
                    </div>                    
                </div>
            `.trim();

                return acc;
            }, '');

        return commands + tracks  + (allSongParts.length > 5 ? commands : '');
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

    subscribeEvents() {
        this.subscribePageEvents();
        this.subscribeMetronomeEvents();
        this.subscribeSongsAndPartsActions();
        this.subscribeInstrumentEvents();
    }

    subscribeInstrumentEvents() {
        getWithDataAttr('use-track-action', this.pageEl)?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => {
                let el: HTMLElement = evt.target as any;
                let key = el.dataset.useTrackAction

                if (this.excludeTrack[key]) {
                    this.excludeTrack[key] = null;
                    el.style.fontWeight = '700';
                }
                else {
                    this.excludeTrack[key] = key;
                    el.style.fontWeight = '400';
                }
            });
        });
    }

    gotoEditSong(songId?: string) {
        songId = (songId || '').trim();

        if(!songId) return;

        console.log('songId', songId); // jjkl

        this.context.$f7router.navigate(`/mbox/${songId}/`);
    }

    getSelectedParts(): string[] {
        const parts =  this.allSongParts
            .filter((nio, i) => !this.excludePartNio.includes(i + 1));

        return parts;
    }

    getSelectedPartsNio(): number[] {
        return this.allSongParts
            .map((item, i) => (i+1))
            .filter(nio => !this.excludePartNio.includes(nio));
    }

    gotoEditPart(pPartNio?: number | string) {
        let partNio = parseInteger(pPartNio, null);
        let editPartsNio: number[] = [];
        const isMy = this.pageData.source === 'my';

        if (partNio) {
            editPartsNio = [partNio];
        } else {
            editPartsNio = this.getSelectedPartsNio();
        }

        if (!editPartsNio.length) return;

        ideService.currentEdit.songId = this.songId;
        ideService.currentEdit.allSongParts = this.allSongParts;
        ideService.currentEdit.blocks = this.blocks;
        ideService.currentEdit.bpmValue = this.bpmValue;
        ideService.currentEdit.dataByTracks = this.getDataByTracks();
        ideService.currentEdit.editPartsNio = editPartsNio;
        ideService.currentEdit.source = this.pageData.source;
        ideService.currentEdit.freezeStructure = !isMy;
        ideService.editedItems = [];
        ideService.currentEdit.settings = this.settings;

        //console.log('currentEdit', ideService.currentEdit);

        this.context.$f7router.navigate('/page/page_keyboard/');
    }

    subscribeSongsAndPartsActions() {
        // SONG ACTIONS
        getWithDataAttr('delete-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.deleteSong(this.selectedSong));
        });

        getWithDataAttr('edit-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.gotoEditSong(el.dataset.songId));
        });

        getWithDataAttr('rename-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.renameSong(this.selectedSong));
        });

        getWithDataAttr('move-song-up-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.moveSong(this.selectedSong, -1));
        });

        getWithDataAttr('move-song-down-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.moveSong(this.selectedSong, 1));
        });

        getWithDataAttr('song-item', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.selectSong(el.dataset.songId));
        });

        // PART ACTIONS
        getWithDataAttr('part-item', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.selectPart(el.dataset.partNio));
        });

        getWithDataAttr('edit-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.gotoEditPart(el.dataset.partNio));
        });

        getWithDataAttr('delete-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.deletePart());
        });

        getWithDataAttr('rename-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.renamePart());
        });

        getWithDataAttr('clone-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.clonePart());
        });

        getWithDataAttr('move-part-up-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.movePart(-1));
        });

        getWithDataAttr('move-part-down-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.movePart(1));
        });
    }

    getOneSelectedPartNio(parts?: string[]): number {
        const allSongParts = Array.isArray(parts) ? parts : this.allSongParts;

        if ((allSongParts.length - this.excludePartNio.length) !== 1 ){
            return 0;
        } else {
            for (let i = 0; i < allSongParts.length; i++) {
                if (!this.excludePartNio.includes(i+1)) {
                    return i+1;
                }
            }
        }

        return 0;
    }

    getOneSelectedPartInfo(parts?: string[]): SongPartInfo {
        parts = Array.isArray(parts) ? parts: this.allSongParts;
        const partNio = this.getOneSelectedPartNio(parts);

        if (!partNio) return null;

        return un.getPartInfo(parts[partNio - 1]);
    }

    selectAllParts() {
        this.excludePartNio = [];
        this.updatePartListView();
    }

    unselectAllParts() {
        const allSongParts = this.allSongParts;

        this.excludePartNio = allSongParts.map((item, i) => i+1);
        this.updatePartListView();
    }

    selectPart(partNio: number | string) {
        partNio = parseInteger(partNio, null);

        if (!partNio) return;

        if (this.excludePartNio.includes(partNio)) {
            this.excludePartNio = this.excludePartNio.filter(item => item !== partNio );
        }
        else {
            this.excludePartNio.push(partNio);
        }

        this.updatePartListView();
    }

    movePart(offset: number) {
        const songId = (this.songId || '').trim();
        const part = this.getOneSelectedPartInfo();

        if (!songId || !part) return;

        if (SongStore.movePart(songId, part.partId, offset)) {
            const allSongParts = this.allSongParts;
            this.excludePartNio = [];

            allSongParts.forEach((item, i) => {
                if (un.getPartInfo(item).partId !== part.partId) {
                    this.excludePartNio.push(i + 1);
                }
            });
        }

        this.setPageContent();
    }

    updatePartListView() {
        getWithDataAttr('part-item', this.pageEl).forEach(el => {
            const partNio = parseInteger(el.dataset.partNio, 0);

            if (this.excludePartNio.includes(partNio)) {
                el.style.fontWeight = '400';
            } else {
                el.style.fontWeight = '700';
            }
        });
    }

    updateSongListView() {
        getWithDataAttr('song-item', this.pageEl).forEach(el => {
           el.style.fontWeight = '400';
           if (el.dataset.songId === this.selectedSong) {
               el.style.fontWeight = '700';
           }
        });
    }

    selectSong(songId: string) {
        this.selectedSong = this.selectedSong === songId ? '' : songId;
        this.updateSongListView();
    }

    moveSong(songId: string, offset: number) {
        SongStore.moveSong(songId, offset);
        this.setPageContent();
    }

    renameSong(songId: string) {
        songId = (songId || '').trim();

        if (!songId) return;

        this.prompt = (this.context.$f7 as any).dialog.prompt(
            'Название',
            'Наименование',
            (newName: string) => {
                SongStore.renameSong(songId, newName.trim());
                this.setPageContent();
            },
        );

        this.prompt.open();
    }

    deleteSong(songId: string) {
        songId = (songId || '').trim();

        if (!songId) return;

        this.confirm = (this.context.$f7 as any).dialog.confirm(
            '',
            'Удалить?',
            () => {
                SongStore.deleteSong(songId);
                this.setPageContent();
            },
            () => {}, // cancel
        );

        this.confirm.open();
    }

    clonePart() {
        const songId = (this.songId || '').trim();
        const part = this.getOneSelectedPartInfo();

        if (!songId || !part) return;

        const newPart = SongStore.clonePart(this.songId, part.partId);
        this.setPageContent();

        console.log(songId, part, newPart);

        // this.prompt = (this.context.$f7 as any).dialog.prompt(
        //     'Название только буквами, цифрами, знаками - или _ (без пробелов)',
        //     'Наименование',
        //     (newName: string) => {
        //         SongStore.renamePart(songId, part.partId, newName.trim());
        //         this.setPageContent();
        //     },
        // );
        //
        // this.prompt.open();
    }

    renamePart() {
        const songId = (this.songId || '').trim();
        const part = this.getOneSelectedPartInfo();

        if (!songId || !part) return;

        this.prompt = (this.context.$f7 as any).dialog.prompt(
            'Название только буквами, цифрами, знаками - или _ (без пробелов)',
            'Наименование',
            (newName: string) => {
                SongStore.renamePart(songId, part.partId, newName.trim());
                this.setPageContent();
            },
        );

        this.prompt.open();
    }

    deletePart() {
        const part = this.getOneSelectedPartInfo();

        if (!part) return;

        const partId = part.partId;
        const partNio = part.partNio;

        // https://framework7.io/docs/dialog
        // app.dialog.confirm(text, title, callbackOk, callbackCancel)- create Confirm Dialog and open it
        this.confirm = (this.context.$f7 as any).dialog.confirm(
            '',
            'Удалить?',
            () => {
                SongStore.deletePart(this.songId, partId);
                this.setPageContent();
            },
            () => {}, // cancel
        );

        this.confirm.open();
    }

    dialog: Dialog.Dialog;
    prompt: Dialog.Dialog;
    confirm: Dialog.Dialog;

    addSong(name: string) {
        const song = SongStore.addSong(name);
        this.setPageContent();
    }

    addPart(name: string) {
        const part = SongStore.addPart(this.songId, name);
        this.setPageContent();
    }

    subscribePageEvents() {
        getWithDataAttrValue('action-type', 'add-part', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => {
                // this.dialog = (this.context.$f7 as any).dialog.create({
                //     text: 'Hello World',
                //     on: {
                //         opened: function () {
                //             console.log('Dialog opened')
                //         }
                //     }
                // });

                this.prompt = (this.context.$f7 as any).dialog.prompt(
                    'Название только буквами, цифрами, знаками - или _ (без пробелов)',
                    'Наименование',
                    (name) => this.addPart(name),
                    () => {}, // cancel
                    ''
                );

                this.prompt.open();
            });
        });

        getWithDataAttr('add-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => {
                // this.dialog = (this.context.$f7 as any).dialog.create({
                //     text: 'Hello World',
                //     on: {
                //         opened: function () {
                //             console.log('Dialog opened')
                //         }
                //     }
                // });

                this.prompt = (this.context.$f7 as any).dialog.prompt(
                    'Название только буквами, цифрами, знаками - или _ (без пробелов)',
                    'Наименование',
                    (name) => this.addSong(name),
                    () => {}, // cancel
                    ''
                );

                this.prompt.open();
            });
        });

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
            el.addEventListener('pointerdown', () => this.selectAllParts());
        });

        getWithDataAttrValue('action-type', 'unselect-all', this.pageEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.unselectAllParts());
        });

        getWithDataAttrValue('action-type', 'edit-selected', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerdown', () => this.gotoEditPart());
        });
    }

    subscribeMetronomeEvents() {
        getWithDataAttr('tick-trigger', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                this.playTick(el?.dataset?.tickTrigger);
            });
        });

        getWithDataAttr('set-bmp-action', this.pageEl)?.forEach(
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

    getDataByTracks(): {[key: string]: string} {
        const dataByTracks = {
            ...this.settings.dataByTracks
        };

        Object.keys(dataByTracks).forEach(key => {
            if (this.excludeTrack[key]) {
                dataByTracks[key] = 'v0';
            }
        })

        //console.log(this.settings, metaByLines);

        return dataByTracks;
    }


    buildBlocksForMySong(blocks: TextBlock[]): TextBlock[] {
        const songId = this.songId;
        const song = SongStore.getSong(songId);
        const hash = {};
        const list: {id: string, rows: StoredRow[][]}[] = [];
        const selectedParts = this.getSelectedParts();

        selectedParts.forEach(partStr => {
            const part = un.getPartInfo(partStr);
            const partRows = song.dynamic.filter(row => {
                const iPartId = (row.partId || '').trim();
                const iPartNio = un.parseInteger(row.rowInPartId.split('-')[0], 0);

                if (part.partId && iPartId) {
                    return part.partId === iPartId;
                }

                return part.partNio === iPartNio;
            });

            partRows.sort((a, b) => {
                const iRowNioA = un.parseInteger(a.rowInPartId.split('-')[1], 0);
                const iRowNioB = un.parseInteger(b.rowInPartId.split('-')[1], 0);

                if (iRowNioA < iRowNioB) return -1;
                if (iRowNioA > iRowNioB) return 1;

                return 0;
            });

            partRows.forEach(row => {
                const iPartNio = un.parseInteger(row.rowInPartId.split('-')[0], 0);
                const iRowNio = un.parseInteger(row.rowInPartId.split('-')[1], 0);

                if (!hash[iPartNio]) {
                    hash[iPartNio] = {
                        id: part.partId,
                        rows: [],
                    };
                    list.push(hash[iPartNio]);
                }

                if (!hash[iPartNio][iRowNio]) {
                    hash[iPartNio][iRowNio] = [];
                    hash[iPartNio].rows.push(hash[iPartNio][iRowNio]);
                }

                hash[iPartNio][iRowNio].push(row);
            });

        });

        let topOutBlocks: string[][] = [];

        list.forEach(part => {
            let partSetRows: string[] = [`<${part.id} set>`];

            part.rows.forEach(row => {
                let maxDurQ = 0;
                let targetDurQ = 0;
                let headGuid = `head_${ideService.guid.toString()}`;
                let rowRefs: string[] = [headGuid];

                row.forEach(item => {
                    const guid = `temp_${ideService.guid.toString()}`;
                    const durQ = LineModel.GetDurationQByLines(item.lines);

                    let notes = this.getNotes(guid, item);

                    if(!notes) {
                        notes = `<${guid} $>\n$organ: ${durQ}`;
                    }

                    const block = un.getTextBlocks(notes)[0];

                    blocks = [...blocks, block];

                    maxDurQ = durQ > maxDurQ ? durQ: maxDurQ;

                    rowRefs.push(guid);
                });

                const headBlock = un.getTextBlocks(`<${headGuid} $>\n$organ: ${maxDurQ}`)[0];

                blocks = [...blocks, headBlock];

                partSetRows.push(rowRefs.join(' '));
            });

            topOutBlocks.push(partSetRows);
        });

        topOutBlocks.forEach(part => {
            const partBlock = un.getTextBlocks(part.join('\n'))[0];
            blocks = [...blocks, partBlock];
        });

        return blocks;
    }

    getNotes(id: string, item: StoredRow): string {
        item.lines.forEach(line => {
            line.blockOffsetQ = 0;
        });

        if (item.type === 'drums') {
            return LineModel.GetDrumNotes(id, item.lines);
        }

        return LineModel.GetToneNotes({
            blockName: id,
            rows: item.lines,
            instrName: '$organ',
            track: item.track || '$unknown',
        });
    }

    playAll(index: number | string = 0) {
        const isMy = this.pageData.source === 'my';

        this.stop();
        index = parseInteger(index, 0);
        let currRowInfo: RowInfo = { first: index, last: index}; // индекс в текущем блоке

        let blocks = isMy ? this.buildBlocksForMySong(this.blocks) : [...this.blocks];

        const x = {
            blocks,
            currBlock: null as un.TextBlock,
            currRowInfo: currRowInfo,
            excludeIndex: this.excludePartNio,
            midiBlockOut: null as un.TextBlock,
            playBlockOut: '' as string | un.TextBlock,
            topBlocksOut: [],
        };

        if (isMy) {
            const rows = this.getSelectedParts().map(row => `> ${row}`);

            x.excludeIndex = []; // либо надо билдить ВСЕ части
            x.currBlock = un.createOutBlock({
                id: 'out',
                bpm: this.bpmValue,
                rows,
                volume: 50,
                type: 'text'
            });
        } else {
            x.currBlock = x.blocks.find((item) => item.id === 'out');
        }

        //console.log('BLOCK', blocks);

        getMidiConfig(x);

        const playBlock = x.playBlockOut as TextBlock;

        console.log('getMidiConfig', x);

        blocks = [...x.blocks];

        // DYNAMIC
        if (!isMy && this.pageData.dynamic?.['@drums']) {
            const map = this.pageData.dynamic?.['@drums'];

            playBlock.rows.forEach((row, i) => {
                let rowInPartId = un.getPartInfo(row).rowInPartId;

                if (!rowInPartId || !map[rowInPartId] || !map[rowInPartId].items && !map[rowInPartId].items.length) {
                    return;
                }

                let rows = map[rowInPartId].items[0].rows;

                if (Array.isArray(rows)) {
                     rows = LineModel.CloneLines(rows);
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
                dataByTracks: this.getDataByTracks(),
                pitchShift: getPitchShiftSetting(this.settings),
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

// action-type:
// add-song  add-part
// stop
// select-all  unselect-all  play-all  edit-selected
