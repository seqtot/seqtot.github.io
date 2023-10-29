import { Range } from 'framework7/components/range/range';
import { Dialog } from 'framework7/components/dialog/dialog';
import { ComponentContext } from 'framework7/modules/component/component';

import { getWithDataAttr, getWithDataAttrValue } from '../../src/utils';
import { drumChar, isPresent, parseInteger } from '../../libs/muse/utils';
import { DEFAULT_OUT_VOLUME, SongNode, TrackInfo } from '../song-store';
import { ideService } from '../ide/ide-service';

export class TracksVolumeDialog {
    dialog: Dialog.Dialog;
    cb: (ok: boolean) => void;
    song: SongNode = null;
    track: TrackInfo = null;
    ns: string;

    tracks: TrackInfo[] = null;

    get root(): HTMLElement {
        return getWithDataAttr('edit-track-dialog-content')[0];
    }

    constructor(
        public context: ComponentContext,
    ) {

    }

    setVolumeRange() {
        this.tracks.forEach(track => {
            (this.context.$f7 as any).range.create({
                el: getWithDataAttrValue('tracks-volume-dialog-item', track.name)[0],
                on: {
                    changed: (range: {value: number}) => {
                        track.volume = range.value;

                        //console.log(track);
                    },
                },
            });

            if (track.items && track.items.length) {
                track.items.forEach(subtrack => {
                    (this.context.$f7 as any).range.create({
                        el: getWithDataAttrValue('tracks-volume-dialog-item', `${track.name}:${subtrack.name}`)[0],
                        on: {
                            changed: (range: {value: number}) => {
                                subtrack.volume = range.value;
                            },
                        },
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
                    <div class="page-content">%content%</div>
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
        this.dialog.close();
        this.cb && this.cb(false);
    }

    okClick() {
        const totalVolume = this.tracks.find(track => track.name === 'total') || {volume: 70};
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
                <div
                    data-tracks-volume-dialog-item="${name}"
                    class="range-slider"
                    data-label="true"
                    data-min="0"
                    data-max="100"
                    data-step="1"
                    data-value="${volume || 0}"
                    data-scale="true"
                    data-scale-steps="10"
                    data-scale-sub-steps="5"
                ></div>
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
            volume: parseInteger(this.song.volume, DEFAULT_OUT_VOLUME),
            board: ''
        });

        this.tracks.forEach(track => {
            const subitems = [];

            if (track.name.startsWith(drumChar)) {
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
                        newSubitem.volume = isPresent(oldSubitem?.volume) ? oldSubitem.volume : newSubitem.volume;
                    });
                }
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
