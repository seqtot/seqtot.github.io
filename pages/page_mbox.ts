import {
    Muse as m,
    TFileSettings,
    TTextBlock,
    TSongPartInfo,
    TRowInfo,
    LineModel,
    TStoredRow,
    TLine,
    TCell,
    TLineNote,
    TSongNode as SongNode,
    Sound,
} from '../libs/muse';

import { getWithDataAttr } from '../src/utils';
import { standardTicks as ticks } from './ticks';
import { getBassCells } from './get-bass-cells';
import {ideService, TSongInfo} from './ide/ide-service';
import { SongStore, MY_SONG } from './song-store';
import * as svg from './svg-icons';
import { ConfirmDialog, TrackDetailsDialog, TracksVolumeDialog, GetTrackDialog, NameDialog } from './dialogs';
import { WavRecorder } from './ide/wav-recorder';
import { KeyboardCtrl } from './keyboard-ctrl';
import { UserSettingsStore } from './user-settings-store';
import { appRouter, RouteInfo } from '../src/router';

const blankHalfRem = '<span style="width: .5rem; display: inline-block;"></span>'

const isDev = /localhost/.test(window.location.href);
const isDevUser = UserSettingsStore.GetUserSettings().userName === 'dev' || isDev;

export class Page_mbox {
    recorder: WavRecorder;
    playingTick = '';
    excludePartNio: number [] = [];
    pageData: SongNode;
    ns = '';
    isMy = false;

    get bpmValue(): number {
        return ideService.bpmValue;
    }

    set bpmValue(bpmValue: number) {
        ideService.bpmValue = bpmValue;
    }

    get pageId(): string {
        return this.props.data.id;
    }

    get songId(): string {
        return this.props.data.song;
    }

    get pageEl(): HTMLElement {
        return document.getElementById('app-route');
    }

    get outBlock(): TTextBlock {
        return  this.blocks.find((item) => item.id === 'out');
    }

    get blocks (): TTextBlock[] {
        return ideService.blocks;
    }

    get settings (): TFileSettings  {
        return ideService.settings;
    }

    get allSongParts(): string[] {
        const parts = ideService.songStore?.data.parts || [];

        const result = parts.map((item, i) => {
            return `${item.name} %${item.id} №${i+1}`;
        });

        console.log('allSongParts\n', result.join('\n'));

        return result;
    }

    getId(id: string): string {
        return this.pageId + '-' + id;
    }

    constructor(public props: RouteInfo<{id: string, song?: string}>) {}

    setPageData(info: TSongInfo): SongNode {
        let song: SongNode = {} as any;

        if (this.ns === MY_SONG) {
            song = SongStore.GetSong(this.songId, MY_SONG, true);
        }

        song.id = info.id;
        song.ns = info.ns;

        return song;
    }

    async initData(force: boolean) {
        let songInfo = await ideService.findSong(this.songId);
        songInfo = songInfo || {
            id: this.songId,
            dir: '',
            ns: MY_SONG,
            label: 'Song not found'
        };

        this.isMy = songInfo.ns === MY_SONG;
        this.ns   = songInfo.ns;

        const pageData = this.pageData = this.setPageData(songInfo);

        // load midi file
        if (!this.isMy) {
            const fileUrl = `motes/${songInfo.dir}/${songInfo.id}.midi`;

            try {
                const url = isDev ? `/${fileUrl}` : `/assets/${fileUrl}`;

                console.log('url', isDev, url);

                const res = await fetch(url); //  // motes/bandit/bell.notes.mid

                if (res.ok) {
                    const text = await res.text(); // res.json(); res.blob();
                    pageData.score = text;
                } else {
                    //throw new Error(`${res.status} ${res.statusText}`);
                }
            }
            catch (error){
                console.log('load notesText', error);
            }
        }

        if (!this.isMy) {
            const fileUrl = `motes/${songInfo.dir}/${songInfo.id}.json`;

            try {
                const url = isDev ? `/${fileUrl}` : `/assets/${fileUrl}`;
                const res = await fetch(url); //  // motes/bandit/bell.notes.json

                if (res.ok) {
                    const json = await res.json(); // res.json(); res.blob();
                    pageData.songNodeHard = SongStore.TransformOldDrums(json);
                } else {
                    // throw new Error(`${res.status} ${res.statusText}`);
                }
            }
            catch (error){
                console.log('load notesJson', error);
            }
        }


        let songData: SongNode;

        if (ideService?.songStore?.songId && ideService.songStore.songId === this.songId && !force) {
            // таже самая песня
        } else {
            ideService.blocks = m.getTextBlocks(pageData.score) || [];
            ideService.settings = m.getFileSettings(ideService.blocks);
            //ideService.pitchShift = getPitchShiftSetting(ideService.settings);
            ideService.pitchShift = 0;

            songData = pageData;

            if (!this.isMy) {
                songData = this.textModelToLineModel(this.songId, songData);
            }

            songData.ns = this.ns;

            ideService.songStore = new SongStore(this.songId, this.ns, songData);
            ideService.setDataByTracks(ideService.songStore.data);
        }
    }

    async onMounted() {
        console.log('onMounted', this.props);

        await this.initData(false);

        this.setRightPanelContent();
        this.setPageContent();
    }

    setRightPanelContent() {
        // dyName('panel-right-content').innerHTML = `
        //   <p data-name="action-info">табы</p>
        //   <p data-name="action-drums">барабан</p>
        // `;

        // dyName('panel-right-content').innerHTML = ``.trim();
    }

    getMetronomeContent(): string {
        let metronomeView = `
            <div style="padding-bottom: .5rem;">
                <a data-tick-trigger="1:4"><b>1:4</b></a>&emsp;
                <a data-tick-trigger="2:4"><b>2:4</b></a>&emsp;
                <a data-tick-trigger="3:8"><b>3:8</b></a>&emsp;
                <a data-tick-trigger="4:4"><b>4:4</b></a>&emsp;
                <a data-stop-action><b>stop</b></a>
            </div>
            ${this.getBpmContent()}
        `.trim();

        // if (this.pageData.hideMetronome) {
        //     metronomeView = '';
        // }

        return metronomeView;
    }

    getBpmContent(): string {
        let bpmView = `
            <number-stepper-cc data-page-bpm-input value="${this.bpmValue}" min="1" max="500"></number-stepper-cc>
        `.trim();

        return bpmView;
    }

    getSongPageContent(): string {
        return `
            <div style="padding: 1rem .5rem 1rem .5rem;">
                ${this.getMetronomeContent()}
            </div>

            <div
                data-tracks-content-wrapper
                style="
                    margin: 0;
                    padding: .5rem .5rem 1rem 1rem;                    
                    border-top: 1px solid gray;
                    border-bottom: 1px solid gray;"
            >
                ${this.getTrackListContent()}                
            </div>
                            
            ${this.getSongPartsContent()}
            
            <div data-name="pageContent">
                ${this.pageData.content}
            </div>
        `.trim();
    }

    setPageContent() {
        // SET BPM
        let bpmValue = this.bpmValue;

        if (this.songId === ideService.currentEdit.songId) {
            bpmValue = this.bpmValue;
        } else {
            bpmValue = ideService.songStore?.data?.bpmValue || 90;
        }

        this.bpmValue = bpmValue;

        //console.log('bpmValue', bpmValue);

        // CONTENT
        const wrapper = `
            <div style="
                padding-top: 0;
                padding-bottom: 2rem;"
            >%content%</div>`.trim();

        let content = '';
        content = wrapper.replace('%content%', this.getSongPageContent());
        this.pageEl.innerHTML = content;
        this.updatePartListView();

        setTimeout(() => {
            this.subscribeEvents();
            this.updateView();
        }, 100);
    }

    getTrackListContent(): string {
        let trackStyle = `
            display: inline-block;
            padding: .15rem;
            margin-right: .5rem; margin-top: .5rem;
            font-size: .9rem; font-weight: 400;
            user-select: none; touch-action: none;
            border: 1px solid gray; border-radius: .3rem;
        `.trim();

        let content = '';

        const createBass = (n: string = '') => {
            return `<span
                style="display: inline-block; border: 1px solid lightgray; border-radius: 0.25rem; user-select: none; padding: 0; margin: 0; margin-right: .4rem;"
                data-create-bass-track${n}-action
            >
                +B${n}
            </span>`
        };

        let actions = `
            <div style="margin: 1rem 0 0 0;">
                ${svg.uncheckBtn('data-uncheck-all-tracks-action', 'black', 24)}
                ${svg.checkBtn('data-check-all-tracks-action', 'black', 24)}
                ${svg.plusBtn('data-add-track-action', '', 24)}
                ${svg.minusBtn('data-delete-track-action', '', 24)}
                ${svg.editBtn('data-edit-track-action', '', 24)}
                ${svg.soundBtn('data-edit-tracks-volume-action', '', 24)}${blankHalfRem}
                ${svg.copyPasteBtn('data-clone-track-action', '', 24)}
                ${createBass()}
                ${isDevUser ? createBass('2') : ''}
            </div>
        `.trim();

        const tracks = ideService?.songStore?.data?.tracks || [];

        tracks.forEach(track => {
            const underline = track.isHardTrack ? 'text-decoration: underline;': '';

            content += `
                    <span style="${trackStyle} ${underline}" data-use-track-action="${track.name}">
                        ${track.name}:${track.volume}
                    </span>            
            `.trim();
        });

        content += actions;

        return content;
    }

    getSongPartsContent(): string {
        let allSongParts = this.allSongParts;

        const commandsWrapper = `
            <div style="margin: .5rem 1rem;">
                %content%
            </div>        
        `.trim();

        let fileCommands = `
            ${svg.downloadBtn('data-download-song-action', '', 24)}&emsp;        
            ${svg.playAndSaveBtn('data-play-and-download-ogg-action', '', 24)}&emsp;
        `.trim();

        let editCommands = '';
        if (this.isMy) {
            const addPartCommand = `${svg.plusBtn('data-add-part-action', '', 24)}`;

            editCommands = `
                <div style="margin-top: 1rem;">
                    ${svg.moveTopBtn('data-move-part-up-action', '', 24)}
                    ${svg.moveDownBtn('data-move-part-down-action', '', 24)}                    
                    ${svg.editBtn('data-edit-selected-parts-action', '', 24)}
                    ${addPartCommand}
                    ${svg.minusBtn('data-delete-part-action', '', 24)}
                    ${svg.renameBtn('data-rename-part-action', '', 24)}
                    ${svg.copyPasteBtn('data-clone-part-action', '', 24)}
                </div>            
            `.trim();

            if (!allSongParts.length) {
                editCommands = addPartCommand;
            }

            fileCommands += `
                ${svg.uploadBtn('data-upload-song-action', '', 24)}&nbsp;              
                <input style="display: none;" type="file" data-upload-song-input multiple />                                
            `.trim();
        } else {
            editCommands = `
                <div style="margin-top: 1rem;">
                    ${svg.editBtn('data-edit-selected-parts-action', '', 24)}
                </div>            
            `.trim();
        }

        fileCommands += `
                ${svg.saveBtn('data-save-song-action', '', 24)}&nbsp;
        `.trim();

        fileCommands = `<div style="margin: 1rem;">
            ${fileCommands}
        </div>`.trim();

        let allCommands = `
            <div>
                ${svg.uncheckBtn('data-unselect-all-parts-action', '', 24)}
                ${svg.checkBtn('data-select-all-parts-action', '', 24)}
                ${svg.stopBtn('data-stop-action', '', 24)}
                ${svg.playBtn('data-play-all-action', '', 24)}
                ${svg.playLoopBtn('data-loop-all-action', '', 24)}
            </div>
            ${editCommands}
        `.trim();

        allCommands = commandsWrapper.replace('%content%', allCommands);

        let tracks = allSongParts.reduce((acc, item, i) => {
            const info = m.getPartInfo(item);

            acc = acc + `
                <div style="margin: .5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div
                        style="font-weight: 700; font-size: 1rem; user-select: none;"
                        data-part-nio="${i+1}"
                        data-part-item="${info.ref}"                        
                    >${info.partNio}&nbsp;&nbsp;${info.ref}</div>
                    <div style="margin-right: 1rem;">   
                        ${svg.editBtn(`
                            data-edit-part-action                        
                            data-part-nio="${i+1}"
                            data-part-id="${info.partId}"                                                        
                        `, '', 24)}
                    </div>                    
                </div>
            `.trim();

                return acc;
            }, '');

        return allCommands + tracks  + (allSongParts.length > 5 ? allCommands : '') + fileCommands;
    }

    stopMetronome() {
        ideService.metronome.stopAndClearMidiPlayer();
    }

    stopMultiplayer() {
        ideService.multiPlayer.stopAndClearMidiPlayer();
    }

    playTick(name?: string) {
        this.stopMetronome();

        name = name || '';
        this.playingTick = name;

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
            cb: (type, data) => {
                console.log(type, data);
            }
        });
    }

    subscribeEvents() {
        this.subscribePageEvents();
        this.subscribeMetronomeEvents();
        this.subscribeSongsAndPartsActions();
        this.subTracksEvents();
    }

    getSelectedTracks(): string[] {
        const result = [];

        getWithDataAttr('use-track-action', this.pageEl).forEach((el) => {
            let trackName = el.dataset.useTrackAction
            let track = ideService.songStore.data.tracks.find(track => track.name === trackName);

            if (track && !track?.isExcluded) {
                result.push(track.name);
            }
        });

        return result;
    }

    subTracksEvents() {
        getWithDataAttr('add-track-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.addTrack());
        });

        getWithDataAttr('edit-tracks-volume-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.editTracksVolume());
        });

        getWithDataAttr('edit-track-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => {
                const tracks = this.getSelectedTracks();

                if (tracks.length > 1) return;

                this.editTrack(tracks[0]);
            });
        });

        getWithDataAttr('delete-track-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => {
                const tracks = this.getSelectedTracks();

                if (tracks.length > 1) return;

                const track = ideService.songStore.data.tracks.find(track => track.name === tracks[0]);

                if (!track || track.isHardTrack) return;

                const action = () => {
                    if (SongStore.DeleteTrack(ideService.songStore.data, track.name)) {
                        this.renderTracksView();
                        ideService.songStore.save();
                    }
                }

                new ConfirmDialog().openConfirmDialog('Удалить трэк?', ok => ok && action());
            });
        });

        getWithDataAttr('uncheck-all-tracks-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => {
                getWithDataAttr('use-track-action', this.pageEl).forEach((el) => {
                    ideService.songStore.data.tracks.forEach(track => {
                        track.isExcluded = true;
                    });
                });

                this.update_TracksView();
                ideService.songStore.save();
                ideService.setDataByTracks();
            })
        });

        getWithDataAttr('check-all-tracks-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => {
                getWithDataAttr('use-track-action', this.pageEl).forEach((el) => {
                    ideService.songStore.data.tracks.forEach(track => {
                        track.isExcluded = false;
                    });
                });

                this.update_TracksView();
                ideService.songStore.save();
                ideService.setDataByTracks();
            })
        });

        getWithDataAttr('use-track-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => {
                const trackName = el.dataset.useTrackAction;
                const track = ideService.songStore.data.tracks.find(track => track.name === trackName);

                if (!track) return;

                track.isExcluded = !track.isExcluded;

                this.update_TracksView();
                ideService.songStore.save();
                ideService.setDataByTracks();
            });
        });

        getWithDataAttr('clone-track-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.cloneTrack());
        });

        getWithDataAttr('create-bass-track-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.createBassTrack());
        });

        getWithDataAttr('create-bass-track2-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.createBassTrack2());
        });
    }

    update_TracksView() {
        getWithDataAttr('use-track-action', this.pageEl).forEach((el) => {
            const trackName = el.dataset.useTrackAction;
            const track = ideService.songStore.data.tracks.find(track => track.name === trackName);

            el.style.backgroundColor = track?.isExcluded ? 'white' : 'lightgray';
        });
    }

    renderTracksView() {
        const content = this.getTrackListContent();

        getWithDataAttr('tracks-content-wrapper', this.pageEl).forEach((el) => {
            el.innerHTML = content;
        });

        this.subTracksEvents();
        this.update_TracksView();
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
        let partNio = m.utils.parseInteger(pPartNio, null);
        let editPartsNio: number[] = [];
        const isMy = this.isMy;

        if (partNio) {
            editPartsNio = [partNio];
        } else {
            editPartsNio = this.getSelectedPartsNio();
        }

        if (!editPartsNio.length) return;

        ideService.setDataByTracks(ideService.songStore.data);
        ideService.editedItems = [];

        ideService.currentEdit.songId = this.songId;
        ideService.currentEdit.allSongParts = this.allSongParts;
        ideService.currentEdit.blocks = this.blocks;
        ideService.currentEdit.editPartsNio = editPartsNio;
        ideService.currentEdit.freezeStructure = !isMy;
        ideService.currentEdit.settings = this.settings;
        ideService.currentEdit.ns = isMy ? MY_SONG : this.pageData.ns || '';

        //console.log('currentEdit', ideService.currentEdit);

        appRouter.navigate('/page/page_keyboard');
    }

    subscribeSongsAndPartsActions() {
        // PART ACTIONS
        getWithDataAttr('part-item', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.selectPart(el.dataset.partNio));
        });

        getWithDataAttr('edit-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.gotoEditPart(el.dataset.partNio));
        });

        getWithDataAttr('delete-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.deletePart());
        });

        getWithDataAttr('rename-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.renamePart());
        });

        getWithDataAttr('clone-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.clonePart());
        });

        getWithDataAttr('move-part-up-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.movePart(-1));
        });

        getWithDataAttr('move-part-down-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.movePart(1));
        });

        getWithDataAttr('download-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.downloadFile());
        });

        getWithDataAttr('play-and-download-ogg-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.playAll(1, true));
        });

        getWithDataAttr('upload-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.uploadFileClick());
        });

        getWithDataAttr('save-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.saveSong());
        });

        getWithDataAttr('upload-song-input', this.pageEl).forEach((el) => {
            el.addEventListener('change', (evt) => this.uploadFile(evt));
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

    getOneSelectedPartInfo(parts?: string[]): TSongPartInfo {
        parts = Array.isArray(parts) ? parts: this.allSongParts;
        const partNio = this.getOneSelectedPartNio(parts);

        if (!partNio) return null;

        return m.getPartInfo(parts[partNio - 1]);
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
        partNio = m.utils.parseInteger(partNio, null);

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
        const songStore = ideService.songStore;

        if (!songStore) return;

        const part = this.getOneSelectedPartInfo();

        if (!part) return;

        const isChanged = SongStore.MovePart(songStore.data, part.partId, offset);

        if (isChanged) {
            const allSongParts = this.allSongParts;
            this.excludePartNio = [];

            allSongParts.forEach((item, i) => {
                if (m.getPartInfo(item).partId !== part.partId) {
                    this.excludePartNio.push(i + 1);
                }
            });

            this.setPageContent();
            ideService.songStore.save();
        }
    }

    updateView() {
        this.update_TracksView();
        this.updatePartListView();
    }

    updatePartListView() {
        getWithDataAttr('part-item', this.pageEl).forEach(el => {
            const partNio = m.utils.parseInteger(el.dataset.partNio, 0);

            if (this.excludePartNio.includes(partNio)) {
                el.style.fontWeight = '400';
            } else {
                el.style.fontWeight = '700';
            }
        });
    }

    editTracksVolume() {
        const cb = (ok: boolean) => {
            if (ok) {
                this.renderTracksView();
                ideService.songStore.save();

                //console.log(ideService.songStore.data);
            }
        }

        new TracksVolumeDialog().openTrackDialog(cb);
    }

    editTrack(trackName: string) {
        const cb = (ok: boolean) => {
            if (ok) {
                this.renderTracksView();
                ideService.songStore.save();
            }
        }

        new TrackDetailsDialog().openTrackDialog(
            ideService.songStore?.data,
            trackName,
            cb
        );
    }

    addTrack() {
        const cb = (ok: boolean) => {
            if (ok) {
                this.renderTracksView();
                ideService.songStore.save();
            }
        }

        new TrackDetailsDialog().openTrackDialog(
            ideService.songStore.data,
            '',
            cb
        );
    }

    clonePart() {
        const song = ideService.songStore?.data;
        const part = this.getOneSelectedPartInfo();

        if (!song || !part) return;

        const newPart = SongStore.ClonePart(song, part.partId);

        this.setPageContent();
        ideService.songStore.save();
    }

    getUniqTrackName(song: SongNode, name: string): string {
        let i = 0;

        while (true) {
            i++;

            if (song.tracks.find(item => item.name === `${name}${i}`)) {
                continue;
            }

            break;
        }

        return `${name}${i}`;
    }


    getFullLineModel(song: SongNode): { rowInPartId: string, lines: TLine[], durQ: number, blockOffsetQ: number}[] {
        const result: {rowInPartId: string, lines: TLine[], durQ: number, blockOffsetQ: number}[] = [];

        song.dynamic.forEach(item => {
            let curr = result.find(iItem => iItem.rowInPartId === item.rowInPartId)

            if (!curr) {
                curr = {
                    rowInPartId: item.rowInPartId,
                    lines: [],
                    durQ: 0,
                    blockOffsetQ: 0,
                };

                result.push(curr);
            }

            if (item.lines.length > curr.lines.length) {
                curr.lines = item.lines.map(line => {
                    return <TLine>{
                        durQ: line.durQ,
                        rowInPartId: item.rowInPartId,
                        startOffsetQ: line.startOffsetQ,
                        blockOffsetQ: 0,
                        cells: [],
                        cellSizeQ: line.cellSizeQ,
                        endLine: line.endLine,
                    }
                });
            }
        });

        KeyboardCtrl.Sort_ByPartAndRowNio(result);

        let blockOffsetQ = 0;
        let blockDurationQ = 0;

        result.forEach(item => {
            blockDurationQ = 0;

            item.lines.forEach(line => {
                blockDurationQ += line.durQ;
                line.blockOffsetQ = blockOffsetQ;
            });

            item.durQ = blockDurationQ;
            item.blockOffsetQ = blockOffsetQ;

            blockOffsetQ += blockDurationQ;
        });

        return result;
    }

    createBassTrack2() {
        const song = ideService.songStore?.data;

        if (!song) return;

        const allLines = this.getFullLineModel(song);
        const totalDurQ = allLines.reduce((acc, item) => (acc + item.durQ), 0)

        let drumsTrackName = '@drums';
        let bassTrackName = '$bass';
        let headTrackName = '$H';

        let itemsByBass = song.dynamic.filter(item => item.track === drumsTrackName);
        let bassTrack = song.tracks.find(item => item.name === drumsTrackName);
        let itemsByHead = song.dynamic.filter(item => item.track === headTrackName);
        let headTrack = song.tracks.find(item => item.name === headTrackName);

        if (!bassTrack || !headTrack) return null;

        drumsTrackName = this.getUniqTrackName(song, drumsTrackName);
        bassTrackName = this.getUniqTrackName(song, bassTrackName);

        itemsByBass = JSON.parse(JSON.stringify(itemsByBass));
        let allItemsByDrums: ReturnType<this['getFullLineModel']> = JSON.parse(JSON.stringify(allLines));
        bassTrack = JSON.parse(JSON.stringify(bassTrack));
        itemsByHead = JSON.parse(JSON.stringify(itemsByHead));
        let allItemsByHead: ReturnType<this['getFullLineModel']> = JSON.parse(JSON.stringify(allLines));

        bassTrack.name = bassTrackName;
        bassTrack.isHardTrack = false;
        bassTrack.board = 'bassGuitar';

        KeyboardCtrl.Sort_ByPartAndRowNio(itemsByHead);
        KeyboardCtrl.Sort_ByPartAndRowNio(itemsByBass);

        const headCells: (TCell & {blockOffsetQ?: number})[] = [];

        itemsByHead.forEach(item => {
            const itemInAll = allItemsByHead.find(iItem => iItem.rowInPartId === item.rowInPartId);

            item.lines.forEach((line, i) => {
                const cells: TCell[] = [];

                line.cells.forEach(cell => {
                    (cell as any).blockOffsetQ = itemInAll.blockOffsetQ;

                    const existedCell = cells.find(iCell => iCell.startOffsetQ === cell.startOffsetQ);

                    if (!existedCell) {
                        cells.push(cell);

                        return;
                    }

                    existedCell.notes = [...existedCell.notes, ...cell.notes];
                });

                LineModel.SortByStartOffsetQ(cells);
                itemInAll.lines[i].cells = cells;

                headCells.push(...cells);
            });
        });

        const bassCells: (TCell & {blockOffsetQ?: number})[] = [];

        itemsByBass.forEach(item => {
            const itemInAll = allItemsByDrums.find(iItem => iItem.rowInPartId === item.rowInPartId);

            item.lines = item.lines.map(line => {
                line.blockOffsetQ = itemInAll.blockOffsetQ;

                const cells: TCell[] = [];

                line.cells.forEach(cell => {
                    (cell as any).blockOffsetQ = itemInAll.blockOffsetQ;

                    cell.notes = cell.notes.filter(note => {
                        return note.instName === '@bd' || note.instName === '@sn';
                    });

                    if (!cell.notes.length) return;

                    const existedCell = cells.find(iCell => iCell.startOffsetQ === cell.startOffsetQ);

                    if (!existedCell) {
                        cells.push(cell);

                        return;
                    }

                    existedCell.notes = [...existedCell.notes, ...cell.notes];
                })

                LineModel.SortByStartOffsetQ(cells);
                line.cells = cells;

                bassCells.push(...cells);

                return line;
            });
        });

        headCells.forEach((currCell, i) => {
            let nextCell: typeof currCell = null;

            if (!currCell.notes.length) {
                return;
            }

            for (let j = i + 1; j < headCells.length; j++) {
                if (!headCells[j].notes.length) {
                    continue;
                }

                nextCell = headCells[j];

                break;
            }

            //nextCell = nextCell ?? headCells[headCells.length - 1];

            const startOffsetQ = currCell.blockOffsetQ + currCell.startOffsetQ;
            const endOffsetQ = nextCell ? nextCell.blockOffsetQ + nextCell.startOffsetQ : totalDurQ;

            nextCell = nextCell ? nextCell : currCell;

            const lBassCells: TCell[] = [];

            for (let drumCell of bassCells) {
                if (
                    ((drumCell.startOffsetQ + drumCell.blockOffsetQ) >= startOffsetQ) &&
                    ((drumCell.startOffsetQ + drumCell.blockOffsetQ) < endOffsetQ)
                ) {
                    if (drumCell.notes.length) {
                        lBassCells.push(drumCell);
                    }
                }
            }

            //console.log(startOffsetQ, endOffsetQ);

            getBassCells({curr: currCell, next: nextCell}, lBassCells, endOffsetQ);
        });

        itemsByBass.forEach(item => {
            item.track = bassTrackName;
            item.type = 'tone';

            LineModel.ClearBlockOffset(item.lines);

            item.lines.forEach(line => {
                line.cells.forEach(cell => {
                    ['blockOffsetQ', 'durQ', 'line'].forEach(key => {
                        delete (cell as any)[key];
                    });

                    cell.notes = cell.notes.filter(note => {
                        return !!note.durQ;
                    });
                });

                line.cells = line.cells.filter(cell => !!cell.notes.length);
            });
        });

        // console.log('createBassTrack2.bassCells', bassCells);
        // console.log('createBassTrack2.headCells', headCells);
        // console.log('createBassTrack.headTrack', headTrack);
        // console.log('createBassTrack.bassTrack', bassTrack);
        //console.log('createBassTrack.itemsByHead', itemsByHead);
        //console.log('createBassTrack2.itemsByBass', itemsByBass);

        itemsByBass.forEach(item => song.dynamic.push(item));
        song.tracks.push(bassTrack);
        m.sortTracks(ideService.songStore.data.tracks);
        this.setPageContent();
        ideService.songStore.save();
    }

    createBassTrack() {
        const song = ideService.songStore?.data;

        if (!song) return;

        const allLines = this.getFullLineModel(song);

        let drumsTrackName = '@drums';
        let bassTrackName = '$bass';
        let headTrackName = '$H';

        let itemsByBass = song.dynamic.filter(item => item.track === drumsTrackName);
        let bassTrack = song.tracks.find(item => item.name === drumsTrackName);
        let itemsByHead = song.dynamic.filter(item => item.track === headTrackName);
        let headTrack = song.tracks.find(item => item.name === headTrackName);

        if (!bassTrack || !headTrack) return null;

        drumsTrackName = this.getUniqTrackName(song, drumsTrackName);
        bassTrackName = this.getUniqTrackName(song, bassTrackName);

        itemsByBass = JSON.parse(JSON.stringify(itemsByBass));
        let allItemsByDrums: ReturnType<this['getFullLineModel']> = JSON.parse(JSON.stringify(allLines));
        bassTrack = JSON.parse(JSON.stringify(bassTrack));
        itemsByHead = JSON.parse(JSON.stringify(itemsByHead));
        let allItemsByHead: ReturnType<this['getFullLineModel']> = JSON.parse(JSON.stringify(allLines));

        bassTrack.name = bassTrackName;
        bassTrack.isHardTrack = false;
        bassTrack.board = 'bassGuitar';

        KeyboardCtrl.Sort_ByPartAndRowNio(itemsByHead);
        KeyboardCtrl.Sort_ByPartAndRowNio(itemsByBass);

        const headCells: (TCell & {blockOffsetQ?: number})[] = [];

        itemsByHead.forEach(item => {
            const itemInAll = allItemsByHead.find(iItem => iItem.rowInPartId === item.rowInPartId);

            item.lines.forEach((line, i) => {
                const cells: TCell[] = [];

                line.cells.forEach(cell => {
                    (cell as any).blockOffsetQ = itemInAll.blockOffsetQ;

                    const existedCell = cells.find(iCell => iCell.startOffsetQ === cell.startOffsetQ);

                    if (!existedCell) {
                        cells.push(cell);

                        return;
                    }

                    existedCell.notes = [...existedCell.notes, ...cell.notes];
                });

                LineModel.SortByStartOffsetQ(cells);
                itemInAll.lines[i].cells = cells;

                headCells.push(...cells);
            });
        });

        const bassCells: (TCell & {blockOffsetQ?: number})[] = [];

        itemsByBass.forEach(item => {
            const itemInAll = allItemsByDrums.find(iItem => iItem.rowInPartId === item.rowInPartId);

            item.lines = item.lines.map(line => {
                line.blockOffsetQ = itemInAll.blockOffsetQ;

                const cells: TCell[] = [];

                line.cells.forEach(cell => {
                    (cell as any).blockOffsetQ = itemInAll.blockOffsetQ;

                    cell.notes = cell.notes.filter(note => {
                        return note.instName === '@bd' || note.instName === '@sn';
                    });

                    if (!cell.notes.length) return;

                    const existedCell = cells.find(iCell => iCell.startOffsetQ === cell.startOffsetQ);

                    if (!existedCell) {
                        cells.push(cell);

                        return;
                    }

                    existedCell.notes = [...existedCell.notes, ...cell.notes];
                })

                LineModel.SortByStartOffsetQ(cells);
                line.cells = cells;

                bassCells.push(...cells);

                return line;
            });
        });


        bassCells.forEach((cell, i) => {
            const nextCell = bassCells[i+1];

            if (nextCell) {
                cell.notes.forEach(note => {
                   note.durQ = (nextCell.blockOffsetQ + nextCell.startOffsetQ) - (cell.blockOffsetQ + cell.startOffsetQ);
                });
            }  else {
                cell.notes.forEach(note => {
                    note.durQ = 30; // jjkl
                });
            }

            let headCell: TCell;

            for (let j = 0; j < headCells.length; j++) {
               if ((headCells[j].startOffsetQ + headCells[j].blockOffsetQ) <= (cell.startOffsetQ + cell.blockOffsetQ)) {
                   headCell = headCells[j];
               }

                if ((headCells[j].startOffsetQ + headCells[j].blockOffsetQ) > (cell.startOffsetQ + cell.blockOffsetQ) ) {
                    break;
                }
            }

            if (headCell && headCell.notes.length) {
                let note = (cell.notes.find(note => note.instName === '@bd') || cell.notes.find(note => note.instName === '@sn')) as TLineNote;

                if (!note) {
                    cell.notes = [];

                    return;
                }

                note = {
                    durQ: note.durQ,
                    volume: 50,
                    id: note.id,
                    lineOffsetQ: note.lineOffsetQ,
                    instCode: '',
                    instName: note.instName,
                } as TLineNote;

                let latNote = '';

                if (note.instName === '@bd') {
                    latNote = Sound.GetNoteLat(headCell.notes[0].note);
                    note.note = latNote[0] + 'u';
                } else {
                    latNote = m.utils.getRandomElement(headCell.notes).note;
                    note.note = latNote[0] + 'y';
                }

                if (!latNote) {
                    //note.durQ = 0;
                    cell.notes = [];

                    return;
                } else {
                    note.durQ = note.durQ > 10 ? note.durQ - 10 : note.durQ;
                }

                note.instName = '$cBass*f';
                note.instCode = '';

                cell.notes = [note];
            } else {
                cell.notes = [];
            }
        });

        itemsByBass.forEach(item => {
            item.track = bassTrackName;
            item.type = 'tone';

            LineModel.ClearBlockOffset(item.lines);

            item.lines.forEach(line => {
                line.cells.forEach(cell => {
                    delete (cell as any).blockOffsetQ;
                    delete (cell as any).durQ;

                    cell.notes = cell.notes.filter(note => {
                        return !!note.durQ;
                    });
                });

                line.cells = line.cells.filter(cell => !!cell.notes.length);
            });
        });

        // LineModel.ClearBlockOffset(itemsByDrums);
        // console.log('createBassTrack.bassCells', bassCells);
        // console.log('createBassTrack.headCells', headCells);
        // console.log('createBassTrack.itemsByHead', itemsByHead);
        console.log('createBassTrack.headTrack', headTrack);
        console.log('createBassTrack.bassTrack', bassTrack);
        console.log('createBassTrack.itemsByBass', itemsByBass);

        itemsByBass.forEach(item => song.dynamic.push(item));
        song.tracks.push(bassTrack);
        m.sortTracks(ideService.songStore.data.tracks);
        this.setPageContent();
        ideService.songStore.save();
    }

    cloneTrack() {
        const selectedTracks = this.getSelectedTracks();

        if (selectedTracks.length > 1) return;

        const trackName = selectedTracks[0];
        const song = ideService.songStore?.data;

        if (!song || !trackName) return;

        if (SongStore.CloneAndAddTrack(song, trackName)) {
            m.sortTracks(ideService.songStore.data.tracks);
            this.setPageContent();
            ideService.songStore.save();
        }
    }

    renamePart() {
        const songId = (this.songId || '').trim();
        const part = this.getOneSelectedPartInfo();

        if (!songId || !part) return;

        new NameDialog().openNameDialog({name: part.name}, ({name}) => {
            if (name !== part.name) {
                SongStore.RenamePart(ideService.songStore.data, part.partId, name.trim());
                this.setPageContent();
                ideService.songStore.save();
            }
        });
    }

    deletePart() {
        const part = this.getOneSelectedPartInfo();

        if (!part) return;

        const partId = part.partId;

        const action = () => {
            if (SongStore.DeletePart(ideService.songStore.data, partId)) {
                this.setPageContent();
                ideService.songStore.save();
            }
        }

        new ConfirmDialog().openConfirmDialog('Удалить?', ok => ok && action());
    }

    addPart(name: string) {
        if (SongStore.AddPartToSong(ideService.songStore.data, name)) {
            this.setPageContent();
            ideService.songStore.save();
        }
    }

    subscribePageEvents() {
        getWithDataAttr('add-part-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => {
                new NameDialog().openNameDialog({name: ''}, ({name}) => {
                    if (name) {
                        this.addPart(name);
                    }
                });
            });
        });

        getWithDataAttr('note-line', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerup', () => {
                this.tryPlayTextLine({
                    text: el?.dataset?.noteLine,
                });
            });
        });

        getWithDataAttr('stop-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.stop());
        });

        getWithDataAttr('play-all-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.playAll());
        });

        getWithDataAttr('loop-all-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.playAll(100));
        });

        getWithDataAttr('select-all-parts-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.selectAllParts());
        });

        getWithDataAttr('unselect-all-parts-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.unselectAllParts());
        });

        getWithDataAttr('edit-selected-parts-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.gotoEditPart());
        });

        getWithDataAttr('page-bpm-input', this.pageEl).forEach((el) => {
            el.addEventListener('valuechanged', (e: any) => {
                getWithDataAttr('page-bpm-input', this.pageEl).forEach((el) => {
                    el.setAttribute('value', e.detail.value);
                });

                if (this.bpmValue !== e.detail.value) {
                    this.bpmValue = e.detail.value;

                    if (this.playingTick) {
                        this.playTick(this.playingTick);
                    }
                }
            });
        });
    }

    subscribeMetronomeEvents() {
        getWithDataAttr('tick-trigger', this.pageEl)?.forEach((el) => {
            el.addEventListener('pointerup', (evt: MouseEvent) => {
                this.playTick(el?.dataset?.tickTrigger);
            });
        });
    }

    async tryPlayTextLine({ text, repeat }: { text: string; repeat?: number }) {
        return ideService.multiPlayer.tryPlayTextLine({ text, repeat });
    }

    buildBlocksForMySong(blocks: TTextBlock[]): TTextBlock[] {
        //console.log('buildBlocksForMySong.blocks', blocks);

        blocks = []; // jjkl

        const song = ideService.songStore.clone();
        const hash = {};
        const list: {id: string, rows: TStoredRow[][]}[] = [];
        const selectedParts = this.getSelectedParts();

        selectedParts.forEach(partStr => {
            const part = m.getPartInfo(partStr);
            const partRows = song.dynamic.filter(row => {
                const iPartId = (row.partId || '').trim();
                const iPartNio = m.utils.parseInteger(row.rowInPartId.split('-')[0], 0);

                if (part.partId && iPartId) {
                    return part.partId === iPartId;
                }

                return part.partNio === iPartNio;
            });

            partRows.sort((a, b) => {
                const iRowNioA = m.utils.parseInteger(a.rowInPartId.split('-')[1], 0);
                const iRowNioB = m.utils.parseInteger(b.rowInPartId.split('-')[1], 0);

                if (iRowNioA < iRowNioB) return -1;
                if (iRowNioA > iRowNioB) return 1;

                return 0;
            });

            partRows.forEach(row => {
                const iPartNio = m.utils.parseInteger(row.rowInPartId.split('-')[0], 0);
                const iRowNio = m.utils.parseInteger(row.rowInPartId.split('-')[1], 0);

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

                    const block = m.getTextBlocks(notes)[0];

                    blocks = [...blocks, block];

                    maxDurQ = durQ > maxDurQ ? durQ: maxDurQ;

                    rowRefs.push(guid);
                });

                const headBlock = m.getTextBlocks(`<${headGuid} $>\n$organ: ${maxDurQ}`)[0];

                blocks = [...blocks, headBlock];

                partSetRows.push(rowRefs.join(' '));
            });

            topOutBlocks.push(partSetRows);
        });

        topOutBlocks.forEach(part => {
            const partBlock = m.getTextBlocks(part.join('\n'))[0];
            blocks = [...blocks, partBlock];
        });

        return blocks;
    }

    getNotes(id: string, item: TStoredRow): string {
        item.lines.forEach(line => {
            line.blockOffsetQ = 0;
        });

        if (item.type === 'drums' || item.track.startsWith(m.drumChar)) {
            const trackName = item.track || m.drumsTrack;

            return LineModel.GetDrumNotes(id, trackName, item.lines);
        }

        return LineModel.GetToneNotes({
            blockName: id,
            rows: item.lines,
            instrName: '$organ',
            track: item.track || '$unknown',
        });
    }

    textModelToLineModel(songId: string, songNodeInput: SongNode): SongNode {
        const ns = songNodeInput.ns;

        const song = m.textModelToLineModel({
            songId,
            ns,
            settings: ideService.settings,
            blocks: ideService.blocks,
            sourceSong: songNodeInput,
            targetSong: SongStore.GetOldSong(songId, ns, true)
        });

        SongStore.SetSong(songId, song, songNodeInput.ns);

        return song;
    }

    playAll(repeatCount = 1, saveWav = false) {
        this.stop();

        let currRowInfo: TRowInfo = { first: 0, last: 0}; // индекс в текущем блоке
        let blocks = this.buildBlocksForMySong(this.blocks);

        const x = {
            blocks,
            currBlock: null as TTextBlock,
            currRowInfo: currRowInfo,
            excludeIndex: this.excludePartNio,
            midiBlockOut: null as TTextBlock,
            playBlockOut: '' as string | TTextBlock,
            topBlocksOut: [],
        };

        const rows = this.getSelectedParts().map(row => `> ${row}`);

        x.excludeIndex = []; // либо надо билдить ВСЕ части
        x.currBlock = m.createOutBlock({
            id: 'out',
            type: 'text',
            bpm: this.bpmValue,
            rows,
            volume: ideService.outVolume,
        });

        //console.log('BLOCK', blocks);

        m.getMidiConfig(x);

        const playBlock = x.playBlockOut as TTextBlock;

        //console.log('getMidiConfig', x);

        blocks = [...x.blocks];

        // DYNAMIC
        // if (!this.useLineModel && this.pageData.dynamic?.['@drums']) {
        //     const map = this.pageData.dynamic?.['@drums'];
        //
        //     playBlock.rows.forEach((row, i) => {
        //         let rowInPartId = un.getPartInfo(row).rowInPartId;
        //
        //         if (!rowInPartId || !map[rowInPartId] || !map[rowInPartId].items && !map[rowInPartId].items.length) {
        //             return;
        //         }
        //
        //         let rows = map[rowInPartId].items[0].rows;
        //
        //         if (Array.isArray(rows)) {
        //              rows = LineModel.CloneLines(rows);
        //              rows.forEach(row => (row.blockOffsetQ = 0));
        //         } else {
        //             return;
        //         }
        //
        //         const notes = LineModel.GetDrumNotes('temp' + ideService.guid.toString(), rows);
        //
        //         if (notes) {
        //             const block = un.getTextBlocks(notes)[0];
        //             blocks = [...blocks, block];
        //             playBlock.rows[i] = playBlock.rows[i] + ' ' + block.id;
        //         }
        //     });
        // }

        //console.log('getDataByTrack', this.getDataByTracks());
        //console.log('IDE_SERVICE', ideService);

        if (x.playBlockOut) {
            ideService.multiPlayer.tryPlayMidiBlock({
                blocks,
                playBlock,
                cb: (type: string, data: any) => {
                    //if (type === 'break' || type === 'finish') {
                    if (type === 'finish') {
                        if (this.recorder) {
                            this.recorder.stopAndSave();
                            this.recorder = null;
                        }
                        // this.playingWithMidi = false;
                    }
                    //console.log(type, data);
                },
                dataByTracks: ideService.dataByTracks,
                //pitchShift: getPitchShiftSetting(this.settings),
                bpm: this.bpmValue,
                repeatCount,
                //beatsWithOffsetMs: un.getBeatsByBpmWithOffset(90, 8),
            });

            if (saveWav) {
                if (this.recorder) {
                    this.recorder.break();
                    this.recorder = null;
                }

                this.recorder = new WavRecorder(m.Sound.ctx);
                this.recorder.start(this.songId);
            }

            return;
        }

        this.stopMultiplayer();
    }

    stop() {
        this.stopMultiplayer();
        this.stopMetronome();

        if (this.recorder) {
            this.recorder.break();
            this.recorder = null;
        }
    }

    async play(text: string, repeatCount?: number) {
        ideService.multiPlayer.tryPlayMidiBlock({
            blocks: text,
            repeatCount,
            //bpmMultiple: this.bpmMultiple,
        });
    }

    replaceSong(val: string) {
        val = (val || '').trim();

        if (!val) return null;

        let songNode: SongNode;

        songNode = JSON.parse(val) as SongNode;
        //songNode = SongStore.Transform(val);

        songNode.tracks.forEach(track => {
           track.isHardTrack = false;
        });

        SongStore.SetSong(this.songId, songNode, this.ns);

        this.initData(true);
        this.setPageContent();
    }

    uploadFile(evt: Event) {
        const fileList = evt.target['files'];

        const loadText = async (file: File) => {
            const reader = new FileReader();
            // reader.readAsDataURL(file);
            reader.readAsText(file);

            reader.addEventListener('load', async (event) => {
                //console.log('ON LOAD TEXT 1', event);

                const result = event.target.result as string;

                this.replaceSong(result);
            });
        }

        if (fileList[0]) {
            loadText(fileList[0]);
        }
    }

    uploadFileClick() {
        getWithDataAttr('upload-song-input', this.pageEl).forEach((el) => {
            el.click();
        });
    }

    saveSong() { // save-song-action
        const songStore = ideService.songStore;

        if (!songStore) return;

        songStore.data.bpmValue = this.bpmValue;
        songStore.save();
    }

    async choiceTracks(): Promise<any> {
        const songStore = ideService.songStore;

        if (!songStore) return Promise.resolve(null);

        return new Promise((resolve, reject) => {
            const dlg = new GetTrackDialog();

            dlg.openTrackDialog(songStore.data, (tracks) => {
                resolve(tracks || []);
            })
        });
    }

    async downloadFile() {
        const tracks: string[] = await this.choiceTracks();

        if (!tracks.length) return;

        // https://webtips.dev/download-any-file-with-javascript
        let songId = this.songId;

        if (!songId) return;

        let song = ideService?.songStore?.data!;

        if (!song) return;

        song = JSON.parse(JSON.stringify(song));
        song.tracks = song.tracks.filter(track => tracks.includes(track.name));
        song.dynamic = song.dynamic.filter(item => tracks.includes(item.track));

        let data = JSON.stringify(song, null, 2);
        //let type = 'application/json';
        let type = 'application/text';
        let name = `${songId}.txt`;

        //console.log('songNode', songNode);

        function downloadURI(uri, name) {
            let link = document.createElement("a");
            link.download = name;
            link.href = uri;
            link.click();
        }

        function downloader(data, type, name) {
            let blob = new Blob([data], {type});
            let url = (window as any).URL.createObjectURL(blob);
            downloadURI(url, name);
            (window as any).URL.revokeObjectURL(url);
        }

        downloader(data, type, name)
    }
}
