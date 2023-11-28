import cm from '../../libs/cm/codemirror.js';
import '../../libs/cm/addon/selection/active-line';
import '../../libs/cm-addons/mode-musa.js';
import '../../libs/cm-addons/mode-js.js';
import '../../libs/cm-addons/mode-xml.js';
import '../../libs/cm-addons/addon_dialog.js';
import '../../libs/cm-addons/addon_search_jump-to-line';
import '../../libs/cm-addons/addon_search_searchcursor';
import '../../libs/cm-addons/addon_search_search';

import { ComponentContainer as GlComponentContainer } from '../../libs/gl/ts/container/component-container';
import { ResolvedComponentItemConfig } from '../../libs/gl/ts/config/resolved-config';
import { Editor as CmEditor } from 'codemirror';
import { Synthesizer } from '../../libs/muse/synthesizer';
import { defaultSynthSettings } from '../../libs/muse/keyboards';
import { Sound } from '../../libs/muse/sound';
import { FileInfo } from '../../libs/common/file-service';
import Fs from '../../libs/common/file-service';
import { LinePlayer } from './line-player';
import {MultiPlayer} from '../../libs/muse/multi-player';

const texts = {

};

export function isObject(val: any): boolean {
  if (val && !Array.isArray(val) && typeof val === 'object') {
    return true;
  }

  return false;
}

export const unplayedKeysHash = {
  ArrowUp: 'ArrowUp',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  ArrowDown: 'ArrowDown',
  End: 'End',
  Home: 'Home',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  Insert: 'Insert',
  Escape: 'Escape',
};

type Nil = null | undefined;
type InputMode = Nil | 'text' | 'beat' | 'sound' | 'voice' | 'linePlayer';

export const safeKeys = [
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'End',
  'Home',
  'PageUp',
  'PageDown',
  'Insert'
];

export function isSafeKeys(evt: string | KeyboardEvent) {
  const code = typeof evt === 'string' ? evt : (<KeyboardEvent>evt).code;

  if (safeKeys.find(item => item === code)) {
    return true;
  }

  return false;
}

function skipEvent(evt: KeyboardEvent, result?: boolean): boolean {
  evt.preventDefault();
  evt.stopPropagation();
  (<any>evt).codemirrorIgnore = true;

  return !!result;
}

const fCodes = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F10', 'F11', 'F12'];
const presetKeys = ['F5', 'F6', 'F7', 'F8', 'F10', 'F11'];

const DOWN = 1;
const UP = 0;

export class TextEditorGlComponent {
  glContainer: GlComponentContainer;
  mainEditor: CmEditor;
  synthesizer = new Synthesizer();
  freqs: { [key: string]: OscillatorNode } = {} as any;
  currTool: { disconnect: (...args: any) => any };
  inputMode: InputMode = null;
  downedKeys: { [key: string]: any } = {};

  cmWrapper: HTMLElement;
  menuEl: HTMLElement;
  fileInfo: FileInfo;

  // element: HTMLElement
  // uri: string = '';
  // text: string = '';
  // mainEditor: CmEditor;
  // outEditor: CmEditor;
  // mainEditorWrapper: HTMLDivElement;
  // outEditorWrapper: HTMLDivElement;
  // inputMode: InputMode = null;
  // currTool: { disconnect: (...args: any) => any };
  // downedKeys: { [key: string]: any } = {};
  // synthesizer = new Synthesizer();
  // beatRecorder: BeatRecorder = new BeatRecorder();
  multiPlayer: MultiPlayer = new MultiPlayer();
  // sumButtonEl: HTMLButtonElement;
  linePlayer: LinePlayer = new LinePlayer();
  // volumeEl: HTMLElement;


  constructor(glContainer: GlComponentContainer, itemConfig?: ResolvedComponentItemConfig) {
    //console.log('textEditorGl.ctor.itemConfig', itemConfig);

    this.glContainer = glContainer;
    this.createCmEditor(itemConfig);
    this.subscribeGl();
    this.subscribeKeys();
    this.createSynthesizer();
  }

  createSynthesizer() {
    this.synthesizer.connect({
      ctx: Sound.ctx,
      //freqs: this.freqs,
      /*, singleBuffer*/
    });

    this.synthesizer.setSettings(defaultSynthSettings);
    //this.synthesizer.addMidiSound(MIDI_INSTR); // MIDI_INSTR
  }

  async createCmEditor(itemConfig?: ResolvedComponentItemConfig) {
    //console.log('createCmEditor', itemConfig);

    this.menuEl = document.createElement('div');
    this.menuEl.style.height = "24px";

    const cmWrapper = this.cmWrapper = document.createElement('div');
    cmWrapper.setAttribute('contenteditable', 'true');

    this.glContainer.element.appendChild(this.menuEl);
    this.glContainer.element.appendChild(cmWrapper);

    const data = texts[itemConfig?.componentState['file']] || {} as {
      text?: string,
      info?: string,
      short?: string,
    };
    const field = itemConfig.componentState['field'] || 'text';

    const cmEditor: CmEditor = cm(cmWrapper, {
      lineNumbers: true,
      mode: 'text', // musa
      // tabSize: 2,
      // autoRefresh: true,
      // value: data[field] || '',
      styleActiveLine: {nonEmpty: true}
    }) as any;

    this.mainEditor = cmEditor;

    this.addCongifBlocks(data);

    this.fileInfo = (itemConfig?.componentState as any)?.fileInfo as FileInfo;

    if (this.fileInfo) {
      this.setValueByFileInfo(this.fileInfo)
    } else {
      this.setValueByField(data, field);
    }

    this.mainEditor.refresh();

    setTimeout(function() {
      cmEditor.refresh();
    }, 1000);
  }

  addCongifBlocks(data: any) {
    this.menuEl.innerHTML = '';

    if (!data) {
      return;
    }

    Object.keys(data).forEach((key, i) => {
      const el = document.createElement('span');
      el.innerHTML = key;
      el.style.color = 'white';
      el.style.paddingRight = '4px'
      el.style.paddingTop = '4px'
      el.style.display = 'inline-block';
      el.style.cursor = 'pointer';

      if (i === 0) {
        el.style.paddingLeft = '4px'
      }

      this.menuEl.appendChild(el);

      el.addEventListener('click', () => {
        this.setValueByField(data, key);
      });

    });
  }

  async setValueByFileInfo(fileInfo: FileInfo) {
    let value = await Fs.readTextFile(fileInfo.path);
    this.mainEditor.setOption("mode", 'musa');
    this.mainEditor.setValue(value);
  }

  setValueByField(data: Object, field: string) {
    if (!data) {
      return;
    }

    let value = (data[field] || '');

    if (isObject(value)) {
      value = JSON.stringify(value, null, 4);
    }

    if (field === 'settings') {
      this.mainEditor.setOption("mode", 'javascript');
    }

    if (field === 'drums') {
      this.mainEditor.setOption("mode", 'xml');
    }

    this.mainEditor.setValue(value);
  }

  subscribeGl() {
    this.glContainer.on('resize', () => {
      const {width, height} = this.glContainer;

      this.mainEditor.setSize(width - 4, height - 24);
    })
  }

  handleKeyEvent(evt: KeyboardEvent, type: number) {
    //console.log('handeEvent', type, evt);

    const inputMode = this.inputMode;

    if (this.isCommand(evt, type)) return;

    if (inputMode === 'linePlayer') {
      return this.linePlayer.keyHandler(evt, type);
    }
    if (this.inputMode === 'sound') return this.handleSoundKeyEvent(evt, type);
    if (this.inputMode === 'text') return this.handleTextKeyEvent(evt, type);
    if (inputMode === 'beat') return this.handleBeatKeyEvent(evt, type);
    // if (inputMode === 'voice') return handleVoiceKeyEvent(evt, type);
    if (!this.inputMode) return this.handleNoModeKeyEvent(evt, type);
  }


  // function subscribeKeys() {
  //   keyInput.onselect = (evt: any) => {
  //     traceSelection();
  //   };
  //
  //   keyInput.addEventListener('keydown', (evt) => handleEvent(evt, 'down'));
  //   keyInput.addEventListener('keyup', (evt) => handleEvent(evt, 'up'));
  // }

  handleTextKeyEvent(evt: KeyboardEvent, type: number) {
    if (evt.ctrlKey && evt.altKey && type === DOWN ) {
      if (evt.code === 'ArrowDown') {
        const ranges = this.mainEditor.listSelections();
        if (ranges.length === 0) {
          return skipEvent(evt);
        }
        const range = ranges[ranges.length - 1];
        const nextLine = this.mainEditor.getLine(range.anchor.line + 1);
        this.mainEditor.addSelection({
          line: range.anchor.line + 1,
          ch: range.anchor.ch // nextLine.length >= range.anchor.ch ? range.anchor.ch : nextLine.length
        });

        return skipEvent(evt);
      }

      if (evt.code === 'ArrowUp') {
        const ranges = this.mainEditor.listSelections();
        if (ranges.length === 0) {
          return skipEvent(evt);
        }
        const range = ranges[0];
        const nextLine = this.mainEditor.getLine(range.anchor.line - 1);
        this.mainEditor.addSelection({
          line: range.anchor.line - 1,
          ch: range.anchor.ch // nextLine.length >= range.anchor.ch ? range.anchor.ch : nextLine.length
        });

        return skipEvent(evt);
      }
    }

    if (evt.ctrlKey || evt.altKey || evt.shiftKey) {
      return;
    }
  }

  handleBeatKeyEvent(evt: KeyboardEvent, type: number) {
    if (evt.ctrlKey || evt.altKey) {
      return;
    }
  }

  handleNoModeKeyEvent(evt: KeyboardEvent, type: number) {
    if (unplayedKeysHash[evt.code]) return;

    skipEvent(evt);
  }

  handleSoundKeyEvent(evt: KeyboardEvent, type: number) {

  }

  subscribeKeys() {
    this.mainEditor.on('keydown', (cm: any, e: KeyboardEvent) => {
      this.handleKeyEvent(e, DOWN);
    });

    this.mainEditor.on('keyup', (cm: any, e: any) => {
      this.handleKeyEvent(e, UP);
    });
  } // subscribeCm

  disconnectCurrTool() {
    if (this.currTool) {
      this.currTool.disconnect();
    }

    this.currTool = null;
  }

  setMode(mode?: InputMode, stopPlayer?: boolean) {
    this.disconnectCurrTool();

    if (this.inputMode === 'sound' && mode !== 'sound') {
      this.downedKeys = {};
    }

    //if (stopPlayer) {
    // player.stop();
    //}

    this.inputMode = mode;

    // byId('modeLabel').innerHTML = mode || 'no mode';
  }

  isCommand(evt: KeyboardEvent, type: number): boolean {
    //console.log('isCommand', evt.code);
    const code = evt.code

    if (code === 'F12') return true;

    // ESCAPE
    if (code === unplayedKeysHash.Escape) {
      this.downedKeys[code] = type;

      return true;
      // выход из всех режимов ???
      // if (evt.ctrlKey && this.inputMode) {
      //     this.setMode(null, true);
      //
      //     return skipEvent(evt, true);
      // }
      //
      // return true;
    }

    // F2 - editor
    if (evt.code === 'F2') {
      if (type === UP) {
        this.setMode('text');
      }

      return skipEvent(evt, true);
    }

    // БИТ РЕКОРДЕР
    // if (evt.code === 'F3') {
    //   if (type === UP) {
    //     this.setMode('beat');
    //     this.beatRecorder.connect({
    //       beatInput: this.mainEditor,
    //       textInput: this.mainEditor,
    //       multiBuffer: this.outEditor,
    //       playSound: (key: string, onlyStop?: boolean) => this.synthesizer.playSound(key, onlyStop),
    //       multiPlayer: this.multiPlayer,
    //     });
    //     this.currTool = this.beatRecorder;
    //   }
    //
    //   return skipEvent(evt, true);
    // }

    // LINEPLAYER
    if ((evt.code === 'F4' || evt.code === 'F1')) {
      if (type === UP) {
        if (this.downedKeys[unplayedKeysHash.Escape] || this.inputMode !== 'linePlayer') {
          this.setMode('linePlayer');
          this.linePlayer.connect({
            beatInput: this.mainEditor,
            textInput: this.mainEditor,
            //multiBuffer: this.outEditor,
            synthesizer: this.synthesizer,
            multiPlayer: this.multiPlayer,
            //uri: this.uri,
          });
          this.currTool = this.linePlayer;
        }

        if (evt.code === 'F4') {
          this.linePlayer.setInputMode('linePlayer');
        }

        if (evt.code === 'F1') {
          this.linePlayer.setInputMode('sound');
        }
      }

      return skipEvent(evt, true);
    }

    // СОХРАНЕНИЕ: TODO
    if (evt.ctrlKey && evt.code === 'KeyS') {
      if (this.inputMode === 'text' && this.fileInfo) {
        Fs.writeTextFile(this.mainEditor.getValue(), this.fileInfo.path)
      }

      return skipEvent(evt, true);
    }

    // ГРОМКОСТЬ: TODO
    // if (evt.ctrlKey &&
    //     (this.inputMode === 'sound' || this.inputMode === 'linePlayer') &&
    //     (evt.code === 'BracketLeft' || evt.code === 'BracketRight')
    // ) {
    //   this.setMidiVolume(evt.code === 'BracketLeft' ? true : false);
    //
    //   return skipEvent(evt, true);
    // }

    return false;
  }
}

// Ctrl-F / Cmd-F                    = Start searching
// Ctrl-G / Cmd-G                    = Find next
// Shift-Ctrl-G / Shift-Cmd-G        = Find previous
// Shift-Ctrl-F / Cmd-Option-F       =  Replace
// Shift-Ctrl-R / Shift-Cmd-Option-F = // Replace all

// Alt-F
// Persistent search (dialog doesn't autoclose, enter to find next, Shift-Enter to find previous)
// Alt-G
// Jump to line
//
