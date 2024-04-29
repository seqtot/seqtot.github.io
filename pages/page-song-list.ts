import { getWithDataAttr } from '../src/utils';
import { standardTicks as ticks } from './ticks';
import { ideService } from './ide/ide-service';
import { SongStore, MY_SONG } from './song-store';
import * as svg from './svg-icons';
import { ConfirmDialog, NameDialog } from './dialogs';
import { appRouter, RouteInfo } from '../src/router';

const isDev = /localhost/.test(window.location.href);

export class PageSongList {
    playingTick = '';
    selectedSong = '';
    selectedSongName = '';
    ns = '';
    isMy = false;
    songList: {id: string, label: string, dir: string, ns: string}[] = [];

    get bpmValue(): number {
        return ideService.bpmValue;
    }

    set bpmValue(bpmValue: number) {
        ideService.bpmValue = bpmValue;
    }

    get pageId(): string {
        return this.props.data.id;
    }

    get songListId(): string {
        return this.props.data.id;
    }

    get pageEl(): HTMLElement {
        return document.getElementById('app-route');
    }

    constructor(
      public props: RouteInfo<{id: string, route: string}>
    ) {}

    async onMounted() {
        console.log('PageSongList.onMounted: props', this.props);

        await this.initData(false);

        this.setPageContent();
    }

    async initData(force: boolean) {
        this.isMy = true;
        this.ns   = MY_SONG;

        const fullSongList = await ideService.loadSongList();
        const songListInfo = fullSongList[this.songListId];

        if (songListInfo) {
            this.songList = songListInfo.items;
            this.isMy = songListInfo.ns === MY_SONG;
            this.ns = songListInfo.ns;
        }
    }

    setPageContent() {
        // SET BPM
        let bpmValue = this.bpmValue;

        this.bpmValue = bpmValue;

        // CONTENT
        const wrapper = `
            <div style="
                padding-top: 0;
                padding-bottom: 2rem;"
            >%content%</div>`.trim();

        let content = '';

        content = wrapper.replace('%content%', this.getSongListContent());
        this.pageEl.innerHTML = content;
        this.updateSongListView();

        appRouter.updatePageLinks();

        setTimeout(() => {
            this.subscribeEvents();
            this.updateView();
        }, 100);
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

    getSongListContent(): string {
        let content = this.songList.reduce((acc, item) => {
            const link = `/song/${item.id}`;
            const text = `
              <div style="margin: .75rem; font-size: 1.25rem;">
                ${this.createLink(item.label, link)}
              </div>            
            `.trim();

            return acc + text;
        }, '');
        let songListContent = '';
        let commands = '';

        if (this.isMy) {
            songListContent = '';
            const songs = SongStore.GetSongs(this.ns);

            songs.forEach(song => {
                content += `<div style="margin: .5rem; align-items: center; display: flex; justify-content: space-between;">
                    <div style="font-size: 1rem;">
                        <span
                            style="font-weight: 400; user-select: none;"
                            data-song-id="${song.id}"
                            data-song-item="${song.id}"
                            data-song-name="${song.name}"                                                    
                        >${song.name}</span>
                    </div>
                    <div style="margin-right: 1rem;">
                        ${svg.editBtn(`
                            data-edit-song-action
                            data-song-id="${song.id}"
                        `, '', 24)}
                    </div>
                </div>`;
            });

            commands = `
            <div style="margin: .5rem; margin-top: 1rem;">
                ${svg.moveTopBtn('data-move-song-up-action', '', 24)}
                ${svg.moveDownBtn('data-move-song-down-action', '', 24)}
                ${svg.renameBtn('data-rename-song-action', '', 24)}                
                ${svg.plusBtn('data-add-song-action', '', 24)}
                ${svg.minusBtn('data-delete-song-action', '', 24)}
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

    gotoEditSong(songId?: string) {
        songId = (songId || '').trim();

        if(!songId) return;

        appRouter.navigate(`/song/${songId}`);
    }

    subscribeEvents() {
        this.subscribePageEvents();
        this.subscribeMetronomeEvents();
        this.subscribeSongListActions();
    }

    subscribePageEvents() {
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

    subscribeSongListActions() {
        getWithDataAttr('add-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => {
                new NameDialog().openNameDialog({name: ''}, ({name}) => this.addSong(name));
            });
        });

        getWithDataAttr('delete-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.deleteSong(this.selectedSong));
        });

        getWithDataAttr('edit-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.gotoEditSong(el.dataset.songId));
        });

        getWithDataAttr('rename-song-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.renameSong(this.selectedSong));
        });

        getWithDataAttr('move-song-up-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.moveSong(this.selectedSong, -1));
        });

        getWithDataAttr('move-song-down-action', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.moveSong(this.selectedSong, 1));
        });

        getWithDataAttr('song-item', this.pageEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.selectSong(el.dataset.songId, el.dataset.songName));
        });
    }

    updateView() {
        this.updateSongListView();
    }

    updateSongListView() {
        getWithDataAttr('song-item', this.pageEl).forEach(el => {
           el.style.fontWeight = '400';
           if (el.dataset.songId === this.selectedSong) {
               el.style.fontWeight = '700';
           }
        });
    }

    selectSong(songId: string, songName = '') {
        this.selectedSongName = songName;
        this.selectedSong = this.selectedSong === songId ? '' : songId;
        this.updateSongListView();
    }

    moveSong(songId: string, offset: number) {
        SongStore.MoveSong(songId, offset, this.ns);
        this.setPageContent();
    }

    renameSong(songId: string) {
        songId = (songId || '').trim();

        if (!songId) return;

        new NameDialog().openNameDialog({name: this.selectedSongName}, ({name}) => {
            name = name.trim();

            if (name !== this.selectedSongName) {
                SongStore.RenameSong(songId, name.trim(), this.ns);
                this.setPageContent();
            }
        });
    }

    deleteSong(songId: string) {
        songId = (songId || '').trim();

        if (!songId) return;

        const action = () => {
            SongStore.DeleteSong(songId, this.ns);
            this.setPageContent();
        }

        new ConfirmDialog().openConfirmDialog('Удалить?', ok => ok && action());
    }

    addSong(name: string) {
        const song = SongStore.AddSongToList(name, this.ns);
        this.setPageContent();
    }

    async tryPlayTextLine({ text, repeat }: { text: string; repeat?: number }) {
        return ideService.multiPlayer.tryPlayTextLine({ text, repeat });
    }

    stop() {
        this.stopMultiplayer();
        this.stopMetronome();
    }

    async play(text: string, repeatCount?: number) {
        ideService.multiPlayer.tryPlayMidiBlock({
            blocks: text,
            repeatCount,
            //bpmMultiple: this.bpmMultiple,
        });
    }

    createLink(name: string, href: string): string {
        return `<a href="${href}" data-route>${name}</a>`;
    }
}
