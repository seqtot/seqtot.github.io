import { TSongNode } from '../../libs/muse';
import { getWithDataAttr } from '../../src/utils';
import { SongStore, TrackInfo } from '../song-store';
import { AppDialog } from './app-dialog';

export class GetTrackDialog extends AppDialog {
    cb: (tracks: string[] | null) => void;
    song: TSongNode = null;
    tracks: TrackInfo[] = [];

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

    openTrackDialog(song: TSongNode, cb: GetTrackDialog['cb']  = null) {
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
            <div style="background-color: wheat; padding-bottom: 1rem;">
                <div style="padding: 1rem; display: flex; justify-content: space-between;">
                    <span data-get-track-dialog-ok style="${btnStl}">&nbsp;ОК&nbsp;</span>&nbsp;
                    <span data-get-track-dialog-cancel style="${btnStl}">Cancel</span>
                </div>
                %content%
            </div>
        `.trim();

        const content = wrapper.replace('%content%', `
            ${this.getTracksForChoice()}        
        `.trim());

        this.dialogEl = document.createElement('div');
        this.dialogEl.style.cssText = this.getDialogStyle();
        this.dialogEl.innerHTML = content;
        this.hostEl.appendChild(this.dialogEl);
        this.hostEl.style.display = 'block';

        setTimeout(() => {
            this.subTrackDialogEvents();
            this.updateView();
        });
    }

    subTrackDialogEvents() {
        getWithDataAttr('get-track-dialog-select-track-action', this.dialogEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.toggleTrack(el.dataset.trackName));
        });

        getWithDataAttr('get-track-dialog-ok', this.dialogEl).forEach((el) => {
            el.addEventListener('pointerdown', () => this.okClick());
        });

        getWithDataAttr('get-track-dialog-cancel', this.dialogEl).forEach((el) => {
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

        this.closeDialog();
        this.cb && this.cb(tracks);
    }

    cancelClick() {
        this.closeDialog();
        this.cb && this.cb(null);
    }

    updateView() {
        getWithDataAttr('get-track-dialog-select-track-action', this.dialogEl).forEach((el) => {
            const trackName = el.dataset.trackName;
            const track = this.tracks.find(track => track.name === trackName);

            el.style.background = track?.isExcluded ? 'none' : 'lime';
        });
    }
}
