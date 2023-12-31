import { Range } from 'framework7/components/range/range';
import { Dialog } from 'framework7/components/dialog/dialog';

import {dyName, getWithDataAttr} from '../../src/utils';
import {toneBoards, drumBoards} from '../keyboard-ctrl';
import {ComponentContext} from 'framework7/modules/component/component';
import {SongNode, SongStore, TrackInfo} from '../song-store';

export class TrackDetailsDialog {
    dialog: Dialog.Dialog;
    cb: (ok: boolean) => void;
    trackName = '';
    song: SongNode = null;
    track: TrackInfo = null;
    trackSrc: TrackInfo = null;
    volumeRange: Range.Range;
    ns: string;

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
        return getWithDataAttr('edit-track-dialog-content')[0];
    }

    constructor(
        public context: ComponentContext,
    ) {

    }

    getBoardForChoice(): string {
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

        return `
            <div style="margin-left: 1rem;" data-get-board-wrapper>
                <span style="${btnStl}" data-edit-track-dialog-board-type="${toneBoards.guitar}">
                    Guitar
                </span>
                <span style="${btnStl}" data-edit-track-dialog-board-type="${toneBoards.bassGuitar}">
                    Bass guitar
                </span>
                <span style="${btnStl}" data-edit-track-dialog-board-type="${toneBoards.bassSolo34}">
                    Harmonica
                </span>
                <span style="${btnStl}" data-edit-track-dialog-board-type="${drumBoards.drums}">
                    Drums
                </span>                            
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

    openTrackDialog(song: SongNode, trackName = '', cb: TrackDetailsDialog['cb']  = null) {
        this.trackName = trackName;
        this.cb = cb;
        this.song = song;

        if (!this.song) return;

        let track = this.song.tracks.find(item => item.name === trackName);

        if (trackName && !track) return;

        this.track = track ? {...track} : {name: '', board: toneBoards.guitar, volume: 50 }
        this.trackSrc = {...this.track};

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
                        <div style="padding: 1rem 0 0 1rem;" data-edit-track-dialog-content>
                            <span data-edit-track-dialog-ok style="${btnStl}">&nbsp;ОК&nbsp;</span>&nbsp;
                            <span data-edit-track-dialog-cancel style="${btnStl}">Cancel</span>
                        </div>                        
                        %content%
                    </div>
                </div>
            </div>        
        `.trim();

        const content = wrapper.replace('%content%', `
            <div class="list" style="margin: 1rem;">
                <ul>
                    <li class="item-content item-input">
                        <div class="item-inner">
                            <div class="item-title item-label">Track name</div>
                            <div class="item-input-wrap">
                                <input
                                    data-edit-track-dialog-name-input
                                    type="text"
                                    placeholder="Track name"
                                    value="${this.track.name}"
                                    ${this.track.isHardTrack ? 'readonly': ''}
                                >
                                <span class="input-clear-button"></span>
                            </div>
                      </div>
                    </li>
                </ul>
            </div>
            ${this.getVolumeContent()}
            ${this.getBoardForChoice()}        
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
        getWithDataAttr('edit-track-dialog-board-type').forEach((el) => {
            el.addEventListener('pointerdown', () => this.setBoard(el.dataset.editTrackDialogBoardType));
        });

        getWithDataAttr('edit-track-dialog-ok').forEach((el) => {
            el.addEventListener('pointerdown', () => this.okClick());
        });

        getWithDataAttr('edit-track-dialog-cancel').forEach((el) => {
            el.addEventListener('pointerdown', () => this.cancelClick());
        });
    }

    setBoard(board: string) {
        this.track.board = board;
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
        getWithDataAttr('edit-track-dialog-board-type').forEach((el) => {
            el.style.fontWeight = el.dataset.editTrackDialogBoardType === this.track.board ? '700' : '400';
        });
    }

    getVolumeContent(): string {
        let result = `
            <div style="margin: 1rem; margin-bottom: 2rem;">
                Громкость
                <div
                    data-edit-track-dialog-volume-range
                    class="range-slider"
                    data-label="true"
                    data-min="0"   
                    data-max="100"
                    data-step="1"
                    data-value="50"
                    data-scale="true"
                    data-scale-steps="10"
                    data-scale-sub-steps="5"
                ></div>
            </div>
        `.trim();

        return result;
    }
}

// NS
// edit-track-dialog
// edit-track-dialog-content
// edit-track-dialog-ok edit-track-dialog-cancel
// edit-track-dialog-name-input
// edit-track-dialog-board-type
