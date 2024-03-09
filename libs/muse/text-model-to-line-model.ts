import { StoredRow, SongNode, TrackInfo, TextBlock, FileSettings, SongPartInfo } from './types';
import { parseInteger, getVolumeFromString, OutBlockRowInfo, hasDrumChar, getOutBlocksInfo, getPartInfo, NoteLn } from './utils';

import { getMidiConfig, getTopOutListHash } from './get-midi-config';
import { LineModel } from './line-model';
import { Sound } from './sound';

function getOutBlock(blocks: TextBlock[]): TextBlock {
    return  blocks.find((item) => item.id === 'out');
}

const notesLat = [
    'du', 'tu', 'ru', 'nu', 'mu', 'fu', 'vu', 'su', 'zu', 'lu', 'ku', 'bu',
    'dy', 'ty', 'ry', 'ny', 'my', 'fy', 'vy', 'sy', 'zy', 'ly', 'ky', 'by',
    'do', 'to', 'ro', 'no', 'mo', 'fo', 'vo', 'so', 'zo', 'lo', 'ko', 'bo',
    'da', 'ta', 'ra', 'na', 'ma', 'fa', 'va', 'sa', 'za', 'la', 'ka', 'ba',
    'de', 'te', 're', 'ne', 'me', 'fe', 've', 'se', 'ze', 'le', 'ke', 'be',
    'di', 'ti', 'ri', 'ni', 'mi', 'fi', 'vi', 'si', 'zi', 'li', 'ki', 'bi',
];

function getNoteLatByOffset(noteLat: string, offset: number) {
    if (!offset) return noteLat;

    noteLat = (noteLat || '').trim().toLowerCase();

    let i = notesLat.findIndex(item => item === noteLat);

    if (i < 0) return noteLat;

    i = i + offset;

    if (i >= notesLat.length || i < 0) return noteLat;

    //console.log('getNoteLatByOffset', offset, noteLat[i]);

    return notesLat[i];
}

export function sortTracks(tracks: TrackInfo[]) {
    tracks.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;

        return 0;
    });
}

type FnInput = {
    songId: string,
    ns: string,
    settings: FileSettings,
    blocks: TextBlock[],
    sourceSong: SongNode,
    targetSong: SongNode,
};

export function textModelToLineModel(x: FnInput): SongNode {
    //console.log('textModelToLineModel', x);

    const song = x.targetSong;

    const partsArr = getTopOutListHash({topBlock: getOutBlock(x.blocks)});
    const partsHashByNio: {[partNio: string]: SongPartInfo} = Object.create(null);

    // это новая песня
    if (!song.tracks.length) {
        song.bpmValue = parseInteger(x.settings.bpm[0], 90);
    }

    song.pitchShiftSrc = parseInteger(x.settings.pitchShift[0], 0);
    song.pitchShift = 0;

    //console.log('song.pitchShiftSrc', x.settings, song.pitchShiftSrc);

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
    //console.log('songSettings.dataByTracks', x.settings.dataByTracks);

    Object.keys(x.settings.dataByTracks).forEach(name => {
        const volume = getVolumeFromString(x.settings.dataByTracks[name]);

        if (!realHardTracks[name]) {
            realHardTracks[name] = name;
        }

        if (!hardTracks[name]) {
            hardTracks[name] = {
                  name,
                  volume,
                  board: hasDrumChar(name) ? 'drums' : 'guitar',
                  isHardTrack: true,
            };
        }
    });

    // ТРЭКИ ИЗ поля songNodeHard
    if ((x.sourceSong as any).songNodeHard) {
        const subSong = (x.sourceSong as any).songNodeHard as SongNode;
        const tracks = (subSong?.tracks || []) as TrackInfo[];
        const dynamic = (subSong?.dynamic || []) as StoredRow[];

        dynamic.forEach(item => {
            if (!realHardTracks[item.track]) {
                realHardTracks[item.track] = item.track;
            }
        })

        tracks.forEach(track => {
            if (!hardTracks[track.name]) {
                hardTracks[track.name]= {
                    ...track,
                    isHardTrack: true
                };
            }
        });
    }

    let blocks = [...x.blocks];

    const midiConfig = {
        blocks,
        currBlock: blocks.find((item) => item.id === 'out'),
        currRowInfo: { first: 0, last: 0},
        excludeIndex: [],
        midiBlockOut: null as TextBlock,
        playBlockOut: '' as string | TextBlock,
        topBlocksOut: [],
    };

    getMidiConfig(midiConfig);

    const box = getOutBlocksInfo(x.blocks, midiConfig.playBlockOut);

    const tracksByScore: {[key: string]: string} = {}
    const parts: {
        partId: string,
        durationQ: number,
        rows: OutBlockRowInfo[],
        text: string
    }[] = [];

    let partId = '';
    let currPart: {
        partId: string,
        durationQ: number,
        rows: OutBlockRowInfo[],
        text: string,
    };

    // ЧАСТИ И ТРЭКИ из текстовой модели
    box.rows.forEach(row => {
        const partInfo = getPartInfo(row.text);

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

                // if (trackName.startsWith('@')) {
                //     trackName = '@drums';
                //     noteLn.trackName = trackName;
                // }

                if (!tracksByScore[trackName]) {
                    tracksByScore[trackName] = trackName;
                }
            });
        });
    });


    //console.log('tracksByScore', tracksByScore);

    // TRACKS BY SCORE
    Object.keys(tracksByScore).forEach(name => {
        if (!realHardTracks[name]) {
            realHardTracks[name] = name;
        }

        if (!hardTracks[name]) {
            hardTracks[name] = {
                name,
                volume: 50,
                board: hasDrumChar(name) ? 'drums' : 'guitar',
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

        //console.log('partReport\n', partReport);
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

    // PART -> TRACK -> LINES -> NOTES
    parts.forEach(part => {
        const partInfo = getPartInfo(part.text);

        partsArr.forEach(item => {
            if (item.partId === partInfo.partId) {
                partInfo.mask = item.mask;
            }
        });

        Object.keys(tracksByScore).forEach(trackName => {
            const lns: NoteLn[] = [];

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
                                note: getNoteLatByOffset(Sound.GetNoteLat(iNote), song.pitchShiftSrc),
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

    // СТРОКИ ИЗ поля songNodeHard
    if ((x.sourceSong as any).songNodeHard) {
        const subSong = (x.sourceSong as any).songNodeHard as SongNode;
        const items = (subSong?.dynamic || []) as StoredRow[];

        song.dynamic = [...song.dynamic, ...items];
    }

    //console.log('hardTracks', hardTracks);
    //console.log('realHardTracks', realHardTracks);
    //console.log('softTracks', softTracks);

    song.tracks = [...Object.values(hardTracks), ...Object.values(softTracks)];

    sortTracks(song.tracks);

    return song;
}
