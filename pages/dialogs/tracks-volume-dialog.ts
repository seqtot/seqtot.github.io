import { Dialog } from 'framework7/components/dialog/dialog';
import { ComponentContext } from 'framework7/modules/component/component';

import { Muse as m } from '../../libs/muse';
import { getWithDataAttr, getWithDataAttrValue } from '../../src/utils';
import { DEFAULT_OUT_VOLUME, SongNode, TrackInfo } from '../song-store';
import { ideService } from '../ide/ide-service';

export class TracksVolumeDialog {
    dialog: Dialog.Dialog;
    cb: (ok: boolean) => void;
    song: SongNode = null;
    tracks: TrackInfo[] = null;
    tracksSrc: TrackInfo[] = null;

    get root(): HTMLElement {
        return getWithDataAttr('edit-track-dialog-content')[0];
    }

    constructor(
        public context: ComponentContext,
    ) {

    }

    setVolumeRange() {
        const setDataByTracks = () => {
            const totalVolume = this.tracks.find(track => track.name === 'total') || {volume: DEFAULT_OUT_VOLUME};

            ideService.setDataByTracks({
                tracks: this.tracks,
                volume: totalVolume.volume,
            });
        }

        this.tracks.forEach(track => {
            getWithDataAttrValue('tracks-volume-dialog-item', track.name).forEach(el => {
                el.addEventListener('valuechanged', (e: any) => {
                    track.volume = e.detail.value;
                    setDataByTracks();
                })
            });

            if (track.items && track.items.length) {
                track.items.forEach(subtrack => {
                    getWithDataAttrValue('tracks-volume-dialog-item', `${track.name}:${subtrack.name}`).forEach(el => {
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
            <div class="popup">
                <div class="page">
                    <div class="navbar">
                        <div class="navbar-bg"></div>
                        <div class="navbar-inner" style="justify-content: space-evenly;">
                            <div data-tracks-volume-dialog-ok style="${btnStl}"><b>OK</b></div>
                            <div data-tracks-volume-dialog-cancel style="${btnStl}">Cancel</div>                            
                        </div>
                    </div>                
                    <div class="page-content" style="padding-right: 3rem;">
                        %content%
                    </div>
                </div>
            </div>
        `.trim();

        const content = wrapper.replace('%content%', `
            ${this.getVolumeContent()}
        `.trim());

        this.dialog = (this.context.$f7 as any).popup.create({
            content,
            on: {
                opened: () => {
                    this.subTrackDialogEvents();
                    this.updateView();
                    this.setVolumeRange();
                }
            }
        });

        this.dialog.open(false);
    }

    subTrackDialogEvents() {
        getWithDataAttr('tracks-volume-dialog-ok').forEach((el) => {
            el.addEventListener('pointerdown', () => this.okClick());
        });

        getWithDataAttr('tracks-volume-dialog-cancel').forEach((el) => {
            el.addEventListener('pointerdown', () => this.cancelClick());
        });
    }

    cancelClick() {
        const tracks = this.tracksSrc.filter(track => track.name !== 'total');

        this.song.tracks = tracks;
        ideService.setDataByTracks(this.song);

        this.dialog.close();
        this.cb && this.cb(false);
    }

    okClick() {
        const totalVolume = this.tracks.find(track => track.name === 'total') || {volume: DEFAULT_OUT_VOLUME};
        const tracks = this.tracks.filter(track => track.name !== 'total');

        this.song.volume = totalVolume.volume;
        this.song.tracks = tracks;
        ideService.setDataByTracks(this.song);

        this.dialog.close();
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
                    data-tracks-volume-dialog-item="${name}"
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
            volume: m.parseInteger(this.song.volume, DEFAULT_OUT_VOLUME),
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
                    newSubitem.volume = m.isPresent(oldSubitem?.volume) ? oldSubitem.volume : newSubitem.volume;
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
