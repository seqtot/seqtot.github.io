import { Range } from 'framework7/components/range/range';
import { Dialog } from 'framework7/components/dialog/dialog';

import {getWithDataAttr} from '../../src/utils';
import {ComponentContext} from 'framework7/modules/component/component';
import {SongNode, SongStore, TrackInfo} from '../song-store';

export class GetTrackDialog {
    dialog: Dialog.Dialog;
    cb: (tracks: string[] | null) => void;
    song: SongNode = null;
    tracks: TrackInfo[] = [];

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

        this.tracks.forEach(track => {
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

    openTrackDialog(song: SongNode, cb: GetTrackDialog['cb']  = null) {
        this.cb = cb || (() => {}) as any;
        this.song = song;
        this.tracks = SongStore.GetTracksNodeBySong(JSON.parse(JSON.stringify(song)));
        this.tracks = this.tracks.filter(item => item.name !== 'total');
        this.tracks.forEach(item => item.isExcluded = false);

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
                            <span data-get-track-dialog-ok style="${btnStl}">&nbsp;ОК&nbsp;</span>&nbsp;
                            <span data-get-track-dialog-cancel style="${btnStl}">Cancel</span>
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
            el.addEventListener('pointerdown', () => this.toggleTrack(el.dataset.trackName));
        });

        getWithDataAttr('get-track-dialog-ok').forEach((el) => {
            el.addEventListener('pointerdown', () => this.okClick());
        });

        getWithDataAttr('get-track-dialog-cancel').forEach((el) => {
            el.addEventListener('pointerdown', () => this.cancelClick());
        });
    }

    toggleTrack(trackName: string) {
        const track = this.tracks.find(track => track.name === trackName);

        if (!track) return;

        track.isExcluded = !track.isExcluded;

        this.updateView();
    }

    okClick() {
        const tracks = this.tracks.filter(track => !track.isExcluded).map(track => track.name);

        this.dialog.close();
        this.cb && this.cb(tracks);
    }

    cancelClick() {
        this.dialog.close();
        this.cb && this.cb(null);
    }

    updateView() {
        getWithDataAttr('get-track-dialog-select-track-action').forEach((el) => {
            const trackName = el.dataset.trackName;
            const track = this.tracks.find(track => track.name === trackName);

            el.style.background = track?.isExcluded ? 'none' : 'lime';
        });
    }
}

// NS
