import { Muse as m } from '../../libs/muse';
import { getWithDataAttr, getWithDataAttrValue } from '../../src/utils';
import { DEFAULT_OUT_VOLUME, SongNode, TrackInfo } from '../song-store';
import { ideService } from '../ide/ide-service';
import { AppDialog } from './app-dialog';

export class TracksVolumeDialog extends AppDialog {
    cb: (ok: boolean) => void;
    song: SongNode = null;
    tracks: TrackInfo[] = null;
    tracksSrc: TrackInfo[] = null;

    setVolumeRange() {
        const setDataByTracks = () => {
            const totalVolume = this.tracks.find(track => track.name === 'total') || {volume: DEFAULT_OUT_VOLUME};

            ideService.setDataByTracks({
                tracks: this.tracks,
                volume: totalVolume.volume,
            });
        }

        this.tracks.forEach(track => {
            getWithDataAttrValue('track-volume-item', track.name, this.dialogEl).forEach(el => {
                el.addEventListener('valuechanged', (e: any) => {
                    track.volume = e.detail.value;
                    setDataByTracks();
                })
            });

            if (track.items && track.items.length) {
                track.items.forEach(subtrack => {
                    getWithDataAttrValue('track-volume-item', `${track.name}:${subtrack.name}`, this.dialogEl).forEach(el => {
                        el.addEventListener('valuechanged', (e: any) => {
                            subtrack.volume = e.detail.value;
                            setDataByTracks();
                        })
                    });
                });
            }
        });
    }

    openTrackDialog(cb: TracksVolumeDialog['cb']  = null) {
        this.cb = cb;

        if (!ideService.songStore?.data) return;

        this.song = ideService.songStore.data;
        this.tracks = JSON.parse(JSON.stringify(this.song.tracks));
        this.tracksSrc = JSON.parse(JSON.stringify(this.song.tracks));

        //console.log('SONG', this.song);
        //console.log('IDESERVICE', ideService);

        const btnStl = `
            display: inline-block;
            margin: 0;
            padding: .5rem;
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
            ${this.getVolumeContent()}
        `.trim());

        this.dialogEl = document.createElement('div');
        this.dialogEl.style.cssText = this.getDialogStyle();
        this.dialogEl.innerHTML = content;
        this.hostEl.appendChild(this.dialogEl);
        this.hostEl.style.display = 'block';

        setTimeout(() => {
            this.subTrackDialogEvents();
            this.updateView();
            this.setVolumeRange();
        });
    }

    subTrackDialogEvents() {
        getWithDataAttr('ok-action', this.dialogEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.okClick());
        });

        getWithDataAttr('cancel-action', this.dialogEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.cancelClick());
        });
    }

    cancelClick() {
        const tracks = this.tracksSrc.filter(track => track.name !== 'total');

        this.song.tracks = tracks;
        ideService.setDataByTracks(this.song);

        this.closeDialog();
        this.cb && this.cb(false);
    }

    okClick() {
        const totalVolume = this.tracks.find(track => track.name === 'total') || {volume: DEFAULT_OUT_VOLUME};
        const tracks = this.tracks.filter(track => track.name !== 'total');

        this.song.volume = totalVolume.volume;
        this.song.tracks = tracks;
        ideService.setDataByTracks(this.song);

        this.closeDialog();
        this.cb && this.cb(true);
    }

    updateView() {

    }

    getTrackVolumeContent(label: string, name: string, volume: number): string {
        let result = '';

        result += `
            <div style="margin: 1rem; margin-bottom: 2rem;">
                ${label}
                <number-stepper-cc
                    data-track-volume-item="${name}"
                    value="${volume || 0}"
                    min="0"
                    max="100"
                ></number-stepper-cc>
            </div>`.trim();

        return result;
    }

    getVolumeContent(): string {
        let result = '';

        this.tracks.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return +1;

            return 0;
        });

        this.tracks.unshift({
            name: 'total',
            volume: m.utils.parseInteger(this.song.volume, DEFAULT_OUT_VOLUME),
            board: ''
        });

        this.tracks.forEach(track => {
            const subitems = [];

            const items = this.song.dynamic.filter(iTrack => iTrack.track === track.name);

            items.forEach(item => {
               item.lines.forEach(line => {
                   line.cells.forEach(cell => {
                       cell.notes.forEach(note => {
                           if (!subitems.includes(note.instName)) {
                               subitems.push(note.instName);
                           }
                       })
                   })
               })
            });

            subitems.sort();

            const oldSubitems = track.items || [];
            track.items = subitems.map(name => ({name, volume: 50}));

            if (oldSubitems.length) {
                track.items.forEach(newSubitem => {
                    const oldSubitem = oldSubitems.find(oldSubitem => oldSubitem.name === newSubitem.name);
                    newSubitem.volume = m.utils.isPresent(oldSubitem?.volume) ? oldSubitem.volume : newSubitem.volume;
                });
            }

            result += this.getTrackVolumeContent(
                `<b>${track.name}:${track.volume}</b>`,
                track.name,
                track.volume
            );

            if (track.items && track.items.length) {
                track.items.forEach(subitem => {
                    result += this.getTrackVolumeContent(
                      `${track.name}:${subitem.name}:${track.volume}`,
                      `${track.name}:${subitem.name}`,
                      subitem.volume
                    );
                });
            }
        });

        return result;
    }
}

// NS
