import { Props } from 'framework7/modules/component/snabbdom/modules/props';
import { ComponentContext } from 'framework7/modules/component/component';
import { Range } from 'framework7/components/range/range';
import { Dom7Array } from 'dom7';

import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import { Synthesizer } from '../libs/muse/synthesizer';
import { MultiPlayer } from '../libs/muse/multi-player';
import { standardTicks as ticks } from './ticks';
import { DrumCtrl } from './keyboard-drum-ctrl';
import { ToneCtrl } from './keyboard-tone-ctrl';
import { ToneKeyboardType, DrumKeyboardType, KeyboardType, toneBoards, drumBoards } from './keyboard-ctrl';
import { ideService, defaultTracks } from './ide/ide-service';
import keyboardSet from './page_keyboard-utils';
import {MY_SONG, SongStore, TrackInfo} from './song-store';
import {UserSettings, UserSettingsStore} from './user-settings-store';

// import { getDevice } from 'framework7';
//
// console.log('getDevice', getDevice().desktop);

const MAX_BOARD_WIDTH = 400;

const DEF_SONG = '_empty_'

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
    userSettings: UserSettings = UserSettingsStore.GetUserSettings();
    keyboardType: KeyboardType = ideService.lastBoardView;
    trackName = ideService.lastTrackName;

    drumCtrl: DrumCtrl;
    toneCtrl: ToneCtrl;

    playingTick = '';
    bpmRange: Range.Range;
    tickInfo = {
        quarterTime: 0,
        quarterNio: 0,
    }
    tickNode: AudioBufferSourceNode | null = null;
    synthesizer = ideService.synthesizer;
    multiPlayer = ideService.multiPlayer;

    get bpmValue(): number {
        return ideService.bpmValue;
    }

    set bpmValue(bpmValue: number) {
        ideService.bpmValue = bpmValue;
    }

    get songId(): string {
        return ideService.currentEdit.songId || DEF_SONG;
    }

    get isMy(): boolean {
        return !!(ideService.currentEdit && ideService.currentEdit.source === 'my');
    }

    get ns(): string {
        return (ideService.currentEdit && ideService.currentEdit.ns) || '';
    }

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

    onWindowResize = () => {
        console.log('onWindowResize');
    }

    constructor(
        public props: Props,
        public context: ComponentContext
    ) {}

    clearAppHeaderSecondRowArea() {
        dyName('app-header-second-row-area').innerHTML = null;
    }

    onClosePage() {
        //console.log('onClosePage');
        this.clearAppHeaderSecondRowArea();
        this.setTrackName();
        this.addTracksLink();
        window.removeEventListener('resize', this.onWindowResize);
    }

    initData() {
        if (this.songId === DEF_SONG) {
            ideService.songStore = new SongStore(DEF_SONG, MY_SONG, SongStore.GetSong(DEF_SONG, MY_SONG, true));
        }
    }

    onMounted() {
        this.initData();

        window.addEventListener('resize', this.onWindowResize);

        this.el$.html(`
            <div 
                class="page-content"
                style="padding-top: 0; padding-bottom: 10rem;"
            >
                <div
                    style="display: flex;"
                    data-name="keyboard-page-wrapper"
                >
                </div>
            </div>`
        .trim());

        setTimeout(() => this.setContent(), 50);
    }


    getTracks(): TrackInfo[] {
        const song = ideService?.songStore?.data;

        return song ? song.tracks : defaultTracks;
    }

    getTrackByName(trackName: string): TrackInfo {
        return this.getTracks().find(item => item.name === trackName);
    }

    addTracksLink(add = false) {
        const wrapper = getWithDataAttr('app-right-header-area')[0];

        if (!wrapper) return;

        wrapper.innerHTML = add ?
            `<a data-track-links style="user-select: none; touch-action: none;">
                <b>TRACK</b>
            </a>`.trim()
        : null;

        getWithDataAttr('track-links', wrapper).forEach(el => {
            el.addEventListener('pointerup', () => {
                if (getWithDataAttr('track-list-content')[0]) {
                    const wrapper = dyName('app-header-second-row-area');

                    if (wrapper) {
                        wrapper.innerHTML = null;
                    }
                } else {
                    this.setTrackListContent();
                    this.updateTrackList();
                }
            });
        });
    }

    setTrackName(name?: string) {
        const href = this.songId ? `href="/mbox/${this.songId}/"`: '';
        const mainLink = '<a class="panel-open" data-panel=".panel-left" style="user-select: none; touch-action: none;"><b>MAIN</b></a>';
        const backLink = href ? `&emsp;<a style="user-select: none; touch-action: none;" ${href}><b>BACK</b></a>` : '';

        getWithDataAttr('app-center-header-area').forEach(el => {
            if (name) {
                el.innerHTML = `<a style="user-select: none; touch-action: none;" ${href}>${name}</a>`;
            } else {
                el.innerHTML = '';
            }
        });

        getWithDataAttr('app-left-header-area').forEach(el => {
            if (name) {
                el.innerHTML = `${mainLink}${backLink}`;
            } else {
                el.innerHTML = mainLink;
            }
        });
    }

    setContent(trackName: string = '') {
        let track = this.getTrackByName(trackName || this.trackName);

        track = track || defaultTracks.find(board => board.name === trackName);
        track = track || defaultTracks.find(board => board.name === this.trackName);
        track = track || defaultTracks.find(board => board.board === this.keyboardType);
        track = track || defaultTracks[0];

        this.keyboardType = track.board as KeyboardType;
        this.trackName = track.name;

        ideService.lastBoardView = this.keyboardType;
        ideService.lastTrackName = this.trackName;

        if (toneBoards[this.keyboardType]) {
            this.setToneContent(this.keyboardType as ToneKeyboardType, this.trackName);
        } else {
            this.setDrumsContent('drums', this.trackName);
        }

        //this.setRightPanelContent();
        //this.updateRightPanel();

        this.addTracksLink(true);
        this.updateTrackList();
        this.setTrackName(track.name);

        setTimeout(() => {
            this.subscribeCommonPageEvents();
            this.subscribePageEvents();
            //this.subscribeRightPanelEvents();
        }, 50);
    }

    setTrackListContent() {
        let trackStyle = `
            display: inline-block;
            padding: .15rem;
            margin-right: .5rem; margin-top: .5rem;
            font-size: .9rem; font-weight: 400;
            user-select: none; touch-action: none;
            border: 1px solid gray; border-radius: .3rem;
        `.trim();
        const wrapper = dyName('app-header-second-row-area');

        if (!wrapper) return;

        const song = ideService?.songStore?.data || null;
        const tracks = song ? song.tracks : defaultTracks;
        let content = '';

        tracks.forEach(track => {
            const underline = track.isHardTrack ? 'text-decoration: underline;' : '';
            content += `
                <span 
                    data-set-keyboard-type-action
                    data-board-type="${track.board}"
                    data-track-name="${track.name}"
                    style="${trackStyle} ${underline}"
                >${track.label || track.name}</span>                
            `.trim();
        });

        wrapper.innerHTML = `
            <div style="padding: 0 0 .5rem .5rem;" data-track-list-content>
                ${content}
            </div>
        `;

        getWithDataAttr('set-keyboard-type-action', wrapper).forEach((el) => {
            el.addEventListener('pointerup', () => {
                this.setContent(el.dataset.trackName);
            });
        });

        //this.addTracksLink(true);

        // getWithDataAttr('app-right-panel-title').forEach((el) => {
        //     el.innerHTML = 'Tracks';
        // });
    }

    setRightPanelContent() {
        // const song = ideService?.song?.data || null;
        // const tracks = song ? song.tracks : defaultTracks;
        // let content = '';
        //
        // tracks.forEach(track => {
        //     content += `
        //         <p
        //             data-set-keyboard-type-action
        //             data-board-type="${track.board}"
        //             data-track-name="${track.name}"
        //             style="user-select: none; touch-action: none; font-size: 1.1rem;"
        //         >${track.label || track.name}</p>
        //     `.trim();
        // });
        //
        // dyName('panel-right-content').innerHTML = content;
        //
        // this.addTracksLink(true);
        // getWithDataAttr('app-right-panel-title').forEach((el) => {
        //     el.innerHTML = 'Tracks';
        // });
    }

    updateTrackList() {
        const wrapper = dyName('app-header-second-row-area');

        if (!wrapper) return;

        getWithDataAttr('set-keyboard-type-action', wrapper).forEach((el) => {
            el.style.backgroundColor = 'white';
            if (el.dataset.trackName === this.trackName) {
                el.style.backgroundColor = 'lightgray';
            }
        });
    }

    updateRightPanel() {
        getWithDataAttr('set-keyboard-type-action', dyName('panel-right-content')).forEach((el) => {
            el.style.color = 'white';
            if (el.dataset.trackName === this.trackName) {
                el.style.color = 'lime';
            }
        });
    }

    getMetronomeContent(): string {
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;
        // <a data-tick-trigger="1:4"><b>1:4</b></a>&emsp;
        // <a data-tick-trigger="2:4"><b>2:4</b></a>&emsp;
        // <a data-tick-trigger="3:4"><b>3:4</b></a>&emsp;
        // <a data-tick-trigger="4:4"><b>4:4</b></a>&emsp;
        // <a data-action-type="stop"><b>stop</b></a>&emsp;

        return `
            <!--div style="margin-bottom: .5rem;">
                <span
                    style="${style}"
                    data-action-type="tick"
                    data-signature="1:4"
                >1:4</span>&emsp;
                <span
                    style="${style}"
                    data-action-type="tick"
                    data-signature="3:8"                    
                >3:8</span>&emsp;                
            </div-->
            <div 
                class="range-slider"
                data-name="slider"
                data-label="true"
                data-min="30"   
                data-max="230"
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
            el.addEventListener('click', () => this.playTick3(el.dataset['signature']));
        });

        getWithDataAttrValue('action-type', 'test', this.pageEl)?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => this.playTick3());
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

    setDrumsContent(boardType: DrumKeyboardType, trackName: string) {
        this.drumCtrl = new DrumCtrl(this, boardType);

        const content = `<div style="width: 100%; max-width: ${MAX_BOARD_WIDTH}px;" keyboard-instanse>
            ${this.drumCtrl.getContent(boardType, trackName)}
        </div>`;

        dyName('keyboard-page-wrapper').innerHTML = content;
        this.drumCtrl.updateView();

        //console.log(boardType, this.keyboardType)
        //this.keyboardType = boardType;

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
            //  this.subscribeViewInfoEvents();
            //  this.bpmValue = this.outBlock.bpm;
            this.bpmRange.setValue(this.bpmValue);
        }, 100);
    }

    setToneContent(boardType: ToneKeyboardType, trackName: string) {
        this.toneCtrl = new ToneCtrl(this, <ToneKeyboardType>this.keyboardType);

        const content = `<div style="width: 100%; max-width: ${MAX_BOARD_WIDTH}px;" keyboard-instanse>
            ${this.toneCtrl.getContent(boardType, trackName)}
        </div>`;

        dyName('keyboard-page-wrapper').innerHTML = content;
        this.toneCtrl.updateView();

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
            //  this.subscribeViewInfoEvents();
            //  this.bpmValue = this.outBlock.bpm;
            this.bpmRange.setValue(this.bpmValue);
        }, 100);
    }

    subscribeRightPanelEvents() {
        getWithDataAttr('set-keyboard-type-action', dyName('panel-right-content')).forEach((el) => {
            el.addEventListener('pointerdown', () => {
                this.setContent(el.dataset.trackName);
            });
        });
    }

    subscribeCommonPageEvents() {
        getWithDataAttrValue('action-type', 'stop', this.pageEl)?.forEach((el) => {
            el.addEventListener('click', (evt: MouseEvent) => this.stop());
        });
    }

    subscribePageEvents() {
        if (toneBoards[this.keyboardType]) {
            this.subscribeMetronomeEvents();
            this.toneCtrl.subscribeEvents();
            //this.toneCtrl.subscribeRelativeKeyboardEvents();
        }
        else if (this.keyboardType === 'drums') {
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

    playTick3(signature?: string) {
        this.stopTicker();

        const cb = (x: {ab: AudioBufferSourceNode, startTimeMs: number}) => {
            this.tickNode = x.ab;

            if (this.drumCtrl) {
                this.drumCtrl.tickStartMs = x.startTimeMs;
            }

            if (this.toneCtrl?.recData) {
                this.toneCtrl.recData.startTimeMs = x.startTimeMs;
            }

            //console.log('start');
            // setTimeout(() => {
            //     x.ab.stop(0);
            //     x.ab.stop(0);
            // }, 2000);
        }

        ideService.ticker.createTickSource({
            qms: Math.round(60000/ this.bpmValue),
            preset1: ideService.synthesizer.instruments['drum_56'],
            preset2: ideService.synthesizer.instruments['drum_80'],
            repeat: 100,
            signature,
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
