import { getWithDataAttr } from '../../src/utils';
import { toneBoards, drumBoards } from '../keyboard-ctrl';
import { SongNode, TrackInfo } from '../song-store';
import { AppDialog } from './app-dialog';

export class TrackDetailsDialog extends AppDialog {
    cb: (ok: boolean) => void;
    trackName = '';
    song: SongNode = null;
    track: TrackInfo = null;
    trackSrc: TrackInfo = null;
    ns: string;

    get trackNameFromInput(): string {
        let result = '';

        getWithDataAttr('track-name-input', this.dialogEl).forEach((el: HTMLInputElement) => {
            result = el.value;
            result = result.replace(/ /g, '');
            result = result.replace('$', '');
            result = result.replace('@', '');
            result = result.trim();
        });

        if (!result) return '';

        return drumBoards[this.track.board] ? '@' + result : '$' + result;
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
            <div style="margin-left: 1rem;">
                <span style="${btnStl}" data-board-type="${toneBoards.guitar}">
                    Guitar
                </span>
                <span style="${btnStl}" data-board-type="${toneBoards.bassGuitar}">
                    Bass guitar
                </span>
                <span style="${btnStl}" data-board-type="${toneBoards.bassSolo34}">
                    Harmonica
                </span>
                <span style="${btnStl}" data-board-type="${drumBoards.drums}">
                    Drums
                </span>                            
            </div>
        `.trim();
    }

    setVolumeControl() {
        getWithDataAttr('volume-input', this.dialogEl).forEach(el => {
            el.addEventListener('valuechanged', (e: any) => {
                this.track.volume = e.detail.value;
            })
        });

        getWithDataAttr('volume-input', this.dialogEl).forEach(el => {
           el.setAttribute('value', this.track.volume.toString());
        });
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
            <div style="background-color: wheat; padding-bottom: 1rem;">
                <div style="padding: 1rem; display: flex; justify-content: space-between;">
                    <span data-ok-action style="${btnStl}">&nbsp;ОК&nbsp;</span>&nbsp;
                    <span data-cancel-action style="${btnStl}">Cancel</span>
                </div>
                %content%
            </div>
        `.trim();

        const content = wrapper.replace('%content%', `
            <div style="margin: 1rem;">
                <div>Track name</div>
                <input
                    data-track-name-input
                    type="text"
                    style="border: 1px solid lightgray; font-size: 1.5rem;"
                    value="${this.track.name}"
                    ${this.track.isHardTrack ? 'readonly': ''}
                >
            </div>
            ${this.getVolumeContent()}
            ${this.getBoardForChoice()}        
        `.trim());

        this.dialogEl = document.createElement('div');
        this.dialogEl.style.cssText = `position: fixed; background-color: rgba(255, 255, 255, .6); top: 0; overflow: auto; width: 100%; height: 100%;`;
        this.dialogEl.innerHTML = content;
        this.hostEl.appendChild(this.dialogEl);
        this.hostEl.style.display = 'block';

        setTimeout(() => {
            this.subTrackDialogEvents();
            this.updateView();
            this.setVolumeControl();
        });
    }

    subTrackDialogEvents() {
        getWithDataAttr('board-type', this.dialogEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.setBoard(el.dataset.boardType));
        });

        getWithDataAttr('ok-action', this.dialogEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.okClick());
        });

        getWithDataAttr('cancel-action', this.dialogEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.cancelClick());
        });
    }

    setBoard(board: string) {
        this.track.board = board;
        this.updateView();
    }

    okClick() {
        let newName = this.trackNameFromInput;

        const close = () => {
            this.closeDialog();
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

        this.closeDialog();
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

    closeDialog(){
        this.hostEl.removeChild(this.dialogEl);

        if (!this.hostEl.children.length) {
            this.hostEl.style.display = 'none';
        }
    }

    cancelClick() {
        this.closeDialog();
        this.cb && this.cb(false);
    }

    updateView() {
        getWithDataAttr('board-type', this.dialogEl).forEach((el) => {
            el.style.fontWeight = el.dataset.boardType === this.track.board ? '700' : '400';
        });
    }

    getVolumeContent(): string {
        let result = `
            <div style="margin: 1rem; margin-bottom: 2rem;">
                Громкость
                <number-stepper-cc
                    data-volume-input                
                    value="50"
                    min="0"
                    max="100"
                ></number-stepper-cc>
            </div>
        `.trim();

        return result;
    }
}

// NS
// ok-action cancel-action
// track-name-input
// board-type
