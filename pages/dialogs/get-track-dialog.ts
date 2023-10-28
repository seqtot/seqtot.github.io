import { Range } from 'framework7/components/range/range';
import { Dialog } from 'framework7/components/dialog/dialog';

import {dyName, getWithDataAttr} from '../../src/utils';
import {toneBoards, drumBoards} from '../keyboard-ctrl';
import {ComponentContext} from 'framework7/modules/component/component';
import {SongNode, SongStore, TrackInfo} from '../song-store';

export class GetTrackDialog {
    dialog: Dialog.Dialog;
    cb: (ok: boolean) => void;
    trackName = '';
    song: SongNode = null;
    track: TrackInfo = null;
    trackSrc: TrackInfo = null;
    volumeRange: Range.Range;
    ns: string;
    selectedTracks: TrackInfo[] = [];

    get trackNameFromInput(): string {
        let result = '';

        getWithDataAttr('edit-track-dialog-name-input').forEach((el: HTMLInputElement) => {
            result = el.value;
            result = result.replace(/ /g, '');
            result = result.replace('$', '');
            result = result.replace('@', '');
            result = result.trim();
        });

        if (!result) return '';

        return drumBoards[this.track.board] ? '@' + result : '$' + result;
    }

    get root(): HTMLElement {
        return getWithDataAttr('get-track-dialog-content')[0];
    }

    constructor(
        public context: ComponentContext,
    ) {

    }

    getTracksForChoice(): string {
        const btnStl = `
            display: inline-block;
            margin: 0;            
            margin-right: .5rem;
            margin-bottom: 1rem;            
            border-radius: 0.25rem;
            border: 1px solid lightgray;
            font-size: 1.2rem;
            user-select: none;
        `.trim();

        let content = '';

        this.song.tracks.forEach(track => {
            content += `
                <span style="${btnStl}" data-get-track-dialog-select-track-action data-track-name="${track.name}">
                    ${track.name}
                </span>            
            `;
        });

        return `
            <div style="margin-left: 1rem;">
                ${content}                            
            </div>
        `.trim();
    }

    setVolumeRange() {
        this.volumeRange = (this.context.$f7 as any).range.create({
            el: getWithDataAttr('edit-track-dialog-volume-range')[0],
            on: {
                changed: (range: any) => {
                    this.track.volume = range.value;
                },
            },
        });

        setTimeout(() => {
            this.volumeRange.setValue(this.track.volume);
        }, 100);
    }

    openTrackDialog(song: SongNode, cb: GetTrackDialog['cb']  = null) {
        this.cb = cb;
        this.song = song;

        if (!this.song) return;

        const btnStl = `
            display: inline-block;
            margin: 0;            
            margin-right: .5rem;
            margin-bottom: 1rem;            
            border-radius: 0.25rem;
            border: 1px solid lightgray;
            font-size: 1.2rem;
            user-select: none;
        `.trim();

        const wrapper = `
            <div class="popup">
                <div class="page">
                    <div class="page-content">
                        <div style="padding: 1rem 0 0 1rem;" data-get-track-dialog-content>
                            <span data-edit-track-dialog-ok style="${btnStl}">&nbsp;ОК&nbsp;</span>&nbsp;
                            <span data-edit-track-dialog-cancel style="${btnStl}">Cancel</span>
                        </div>                        
                        %content%
                    </div>
                </div>
            </div>        
        `.trim();

        const content = wrapper.replace('%content%', `
            ${this.getTracksForChoice()}        
        `.trim());

        this.dialog = (this.context.$f7 as any).popup.create({
            content,
            on: {
                opened: () => {
                    this.subTrackDialogEvents();
                    this.updateView();
                    this.setVolumeRange();
                    // this.subscribePopupBoard();
                    // this.updatePopupBoard()
                    // this.updateFixedCellsOnBoard(getWithDataAttr('dynamic-tone-board')[0]);
                }
            }
        });

        this.dialog.open(false);
    }

    subTrackDialogEvents() {
        getWithDataAttr('get-track-dialog-select-track-action').forEach((el) => {
            el.addEventListener('pointerdown', () => this.selectTrack(el.dataset.trackName));
        });

        getWithDataAttr('get-track-dialog-ok').forEach((el) => {
            el.addEventListener('pointerdown', () => this.okClick());
        });

        getWithDataAttr('get-track-dialog-cancel').forEach((el) => {
            el.addEventListener('pointerdown', () => this.cancelClick());
        });
    }

    selectTrack(trackName: string) {
        const track = this.song.tracks.find(track => track.name === trackName);

        if (!track) return;

        if (this.selectedTracks.find(track => track.name === trackName)) {
            this.selectedTracks = this.selectedTracks.filter(track => track.name !== trackName);
        } else {
            this.selectedTracks.push(track);
        }

        this.updateView();
    }

    okClick() {
        let newName = this.trackNameFromInput;

        const close = () => {
            this.dialog.close();
            this.cb && this.cb(false);
        }

        if (!newName) {
            return close();
        }

        // Создание новой дорожки
        if (!this.trackSrc.name) {
            if (this.song.tracks.find(item => item.name === newName)) {
                return close();
            }

            this.song.tracks.push({
                ...this.track,
                name: newName,
            });
        } else {
            this.updateTrackInSong();
        }

        this.song.tracks = this.song.tracks.filter(item => item.name && item.board);

        this.dialog.close();
        this.cb && this.cb(true);
    }

    updateTrackInSong() {
        const newName = this.trackNameFromInput;
        const oldName = this.trackSrc.name;

        this.song.tracks.forEach(item => {
            if (item.name === oldName) {
                item.name = newName;
                item.board = this.track.board;
                item.volume = this.track.volume;

                this.song.dynamic.forEach(item => {
                    if (item.track === oldName) {
                        item.track = newName;
                    }
                });
            }
        });
    }

    cancelClick() {
        this.dialog.close();
        this.cb && this.cb(false);
    }

    updateView() {
        getWithDataAttr('get-track-dialog-select-track-action').forEach((el) => {
            const trackName = el.dataset.trackName;
            const track = this.selectedTracks.find(track => track.name === trackName);

            el.style.background = track ? 'lime' : 'none';
        });
    }
}

// NS
// edit-track-dialog
// edit-track-dialog-content
// edit-track-dialog-ok edit-track-dialog-cancel
// edit-track-dialog-name-input
// edit-track-dialog-board-type
