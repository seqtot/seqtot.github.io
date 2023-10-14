import {SongNode, SongStore, StoredRow, StoredSongNodeOld, TrackInfo} from './song-store';
import {ideService} from './ide/ide-service';
import {getMidiConfig, getTopOutListHash} from '../libs/muse/utils/getMidiConfig';
import * as un from '../libs/muse/utils';
import {LineModel} from './line-model';
import {TextBlock} from '../libs/muse/utils';

function getOutBlock(blocks: TextBlock[]): TextBlock {
    return  blocks.find((item) => item.id === 'out');
}

export function textModelToLineModel(
    songId: string,
    ns: string,
    songNodeInput: SongNode
): SongNode {
    const songSettings = ideService.settings;
    const song = SongStore.GetOldSong(songId, ns, true);

    const partsArr = getTopOutListHash({topBlock: getOutBlock(ideService.blocks)});
    const partsHashByNio: {[partNio: string]: un.SongPartInfo} = Object.create(null);

    if (song.isNewCreated) {
        song.bmpValue = un.parseInteger(songSettings.bpm[0], 90);
        song.pitchShift = un.parseInteger(songSettings.pitchShift[0], 0);
    }

    // ЧАСТИ ПЕСНИ
    song.parts = partsArr.map(part => {
        partsHashByNio[part.partNio] = part;

        return {
            name: part.name,
            id: part.partId
        }
    });

    const hardTracks: {[trackName: string]: TrackInfo} = Object.create(null);
    const softTracks: {[trackName: string]: TrackInfo} = Object.create(null);
    const realHardTracks: {[trackName: string]: string} = Object.create(null);

    song.tracks.forEach(track => {
        if (!track.isHardTrack) {
            return;
        }

        if (!hardTracks[track.name]) {
            hardTracks[track.name] = track;
        }
    });

    song.tracks.forEach(track => {
        if (track.isHardTrack) {
            return;
        }

        if (!softTracks[track.name]) {
            softTracks[track.name] = track;
        }
    });

    // ТРЭКИ из songSettings
    console.log('songSettings.dataByTracks', songSettings.dataByTracks);

    Object.keys(songSettings.dataByTracks).forEach(name => {
        const volume = un.getVolumeFromString(songSettings.dataByTracks[name]);

        if (!realHardTracks[name]) {
            realHardTracks[name] = name;
        }

        if (!hardTracks[name]) {
            hardTracks[name] = {
                  name,
                  volume,
                  board: un.hasDrumChar(name) ? 'drums' : 'guitar',
                  isHardTrack: true,
            };
        }
    });

    // ТРЭКИ из поля захордкоженного поля dynamicOld
    (songNodeInput as any).dynamicOld = (songNodeInput as any).dynamicOld || {};
    const dynamicOld = (songNodeInput as any).dynamicOld as {trackName: StoredSongNodeOld};
    console.log('dynamicOldTracks', dynamicOld);

    Object.keys(dynamicOld).forEach(name => {
        if (!realHardTracks[name]) {
            realHardTracks[name] = name;
        }

        if (!hardTracks[name]) {
            hardTracks[name]= {
                name,
                volume: 50,
                isHardTrack: true,
                board: un.hasDrumChar(name) ? 'drums' : 'guitar',
            };
        }
    });

    let blocks = [...ideService.blocks];

    const x = {
        blocks,
        currBlock: blocks.find((item) => item.id === 'out'),
        currRowInfo: { first: 0, last: 0},
        excludeIndex: [],
        midiBlockOut: null as un.TextBlock,
        playBlockOut: '' as string | un.TextBlock,
        topBlocksOut: [],
    };

    getMidiConfig(x);

    const box = un.getOutBlocksInfo(x.blocks, x.playBlockOut);

    const tracksByScore: {[key: string]: string} = {}
    const parts: {
        partId: string,
        durationQ: number,
        rows: un.OutBlockRowInfo[],
        text: string
    }[] = [];

    let partId = '';
    let currPart: {
        partId: string,
        durationQ: number,
        rows: un.OutBlockRowInfo[],
        text: string,
    };

    // ЧАСТИ И ТРЭКИ из текстовой модели
    box.rows.forEach(row => {
        const partInfo = un.getPartInfo(row.text);

        if (partInfo.partId !== partId) {
            partId = partInfo.partId;
            currPart = {
                partId,
                durationQ: row.rowDurationByHeadQ,
                rows: [row],
                text: row.text,
            }
            parts.push(currPart);
        } else {
            currPart.durationQ = currPart.durationQ + row.rowDurationByHeadQ;
            currPart.rows.push(row);
        }

        row.trackLns.forEach(noteLn => {
            noteLn.noteLineInfo.notes.forEach(note => {
                let trackName = noteLn.trackName;

                if (trackName.startsWith('@')) {
                    trackName = '@drums';
                    noteLn.trackName = trackName;
                }

                if (!tracksByScore[trackName]) {
                    tracksByScore[trackName] = trackName;
                }
            });
        });
    });


    console.log('tracksByScore', tracksByScore);

    // TRACKS BY SCORE
    Object.keys(tracksByScore).forEach(name => {
        if (!realHardTracks[name]) {
            realHardTracks[name] = name;
        }

        if (!hardTracks[name]) {
            hardTracks[name] = {
                name,
                volume: 50,
                board: un.hasDrumChar(name) ? 'drums' : 'guitar',
                isHardTrack: true,
            }
        }
    });

    // set startOffsetQ
    parts.forEach(part => {
        let startOffsetQ = 0;

        part.rows.forEach(row => {
            row.startOffsetQ = startOffsetQ;

            row.trackLns.forEach(ln => {
                ln.startOffsetQ = startOffsetQ;
            });

            startOffsetQ += row.rowDurationByHeadQ;
        });
    });

    // PART REPORT
    {
        let partReport = '';

        parts.forEach(part => {
            partReport += part.partId;

            part.rows.forEach(row => {
                partReport += ` - ${row.rowDurationByHeadQ}`;
            });

            partReport += '\n';
        });

        console.log('partReport\n', partReport);
    }

    // ЕСЛИ В softTracks оказались элементы из hardTracks то их удаляем
    Object.keys(hardTracks).forEach(trackName => {
        if (softTracks[trackName]) {
            delete softTracks[trackName];
        }
    });

    // ЕСЛИ В hardTracks есть мёртвые души, то их удаляем
    Object.keys(hardTracks).forEach(trackName => {
        if (!realHardTracks[trackName]) {
            delete hardTracks[trackName];
        }
    });

    // ОСТАВЛЯЕМ ТОЛЬКО СТРОКИ ИЗ softTracks
    song.dynamic = song.dynamic.filter(rowByTrack => {
        return !!softTracks[rowByTrack.track];
    });

    // DYNAMIC OLD
    Object.keys(dynamicOld).forEach(trackName => {
        const oldItemsByRow = dynamicOld[trackName];

        Object.keys(oldItemsByRow).forEach(oldRowInPartId => {
            const oldItems = oldItemsByRow[oldRowInPartId]?.items;
            const partInfo = un.getPartRowNio(oldRowInPartId);

            if (!Array.isArray(oldItems)) return;

            const newPartNio = partInfo.partNio + 1;
            const part = partsHashByNio[newPartNio];

            oldItems.forEach(item => {
                const newItem = <StoredRow>{
                    partId: part?.partId,
                    rowNio: partInfo.rowNio,
                    rowInPartId: `${newPartNio}-${partInfo.rowNio}`,
                    type: 'drums',
                    track: '@drums',
                    lines: item.rows.map(item => {
                        return {
                            ...item,
                            rowInPartId: `${newPartNio}-${partInfo.rowNio}`
                        }
                    }),
                }

                song.dynamic.push(newItem);
            });

            //console.log(oldRowInPartId, oldItems);
        });
    });

    // PART -> TRACK -> LINES -> NOTES
    parts.forEach(part => {
        const partInfo = un.getPartInfo(part.text);

        partsArr.forEach(item => {
            if (item.partId === partInfo.partId) {
                partInfo.mask = item.mask;
            }
        });

        Object.keys(tracksByScore).forEach(trackName => {
            const lns: un.NoteLn[] = [];

            part.rows.forEach(row => {
                row.trackLns.forEach(ln => {
                    if (ln.trackName === trackName) {
                        lns.push(ln);
                    }
                });
            });

            if (!lns.length) return;

            let liner = new LineModel();
            liner.setData(liner.getLinesByMask(part.durationQ));

            lns.forEach(ln => {
                let iOffsetQ = 0;

                for (let i = 0; i < ln.repeat; i++) {
                    ln.noteLineInfo.notes.forEach(note => {
                        if (note.note === 'pause') {
                            iOffsetQ += note.durationQ;

                            return;
                        }

                        let startOffsetQ = ln.startOffsetQ + Math.round((iOffsetQ / 10) * 10);
                        let durQ = Math.round((note.durationQ / 10) * 10);

                        note.note.split('+').forEach(iNote => {
                            liner.addNoteByOffset(startOffsetQ, {
                                id: 0,
                                durQ,
                                note: ideService.synthesizer.getNoteLat(iNote),
                                startOffsetQ: 0,
                                char: '',
                                slides: note.slidesText,
                                volume: note.volume,
                                instName: note.instr,
                                cent: note.cent,
                                // instCode
                                // headColor
                                // bodyColor
                            });
                        })

                        iOffsetQ += note.durationForNextQ;
                    });
                }
            });

            //console.log(trackName, lns);

            const items = LineModel.SplitByMask({
                lines: liner.lines,
                type:  trackName.startsWith('$') ? 'guitar': 'drums',
                partInfo,
                track: trackName
            });

            song.dynamic = [...song.dynamic, ...items];
        });
    }); // loop by parts


    console.log('hardTracks', hardTracks);
    console.log('realHardTracks', realHardTracks);
    console.log('softTracks', softTracks);

    song.tracks = [...Object.values(hardTracks), ...Object.values(softTracks)];

    song.tracks.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;

        return 0;
    });

    return song;
}
