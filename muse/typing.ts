'use babel';

export type NoteLineInfo = {
  notes: {
    note: string;
    durationQ: number;
    pauseQ: number;
    volume: number;
  }[];
  durationQ: number;
  volume: number;
  repeat: number;
  bpm: number;
};
