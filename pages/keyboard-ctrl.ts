import { ComponentContext } from 'framework7/modules/component/component';
import {getWithDataAttr, getWithDataAttrValue} from '../src/utils';
import { Synthesizer } from '../libs/muse/synthesizer';
import { MultiPlayer } from '../libs/muse/multi-player';

import { LineModel } from './line-model';
import * as un from '../libs/muse/utils'
import {parseInteger} from '../libs/common';

import ideService from './ide/ide-service';

export type BpmInfo = {
    bpm: number;
    lastDownTime: number;
    pressCount: number;
    totalMs: number;
}

export interface KeyboardPage {
    bpmValue: number;
    pageEl: HTMLElement;
    getMetronomeContent(): string;
    stopTicker();
    stop();
    //getOut(bpm: number, seq: DrumCtrl['keySequence'] );
    synthesizer: Synthesizer;
    multiPlayer: MultiPlayer;
    context: ComponentContext,
}

export type ToneKeyboardType = 'bassGuitar' | 'soloHarmonica' | 'bassHarmonica' | 'bassSoloHarmonica' | 'guitar';
export type DrumKeyboardType = 'drums' | 'perc';

export class KeyboardCtrl {
    liner = new LineModel();
    activeCell: {
        id: number,
        col: number,
        row: number,
        rowCol: string,
        offset: number,
    } = {
        id: 0,
        col: 0,
        row: 0,
        rowCol: '',
        offset: 0
    };

    constructor(
        public page: KeyboardPage
    ) {
    }

    getEmptyBpmInfo (): BpmInfo  {
        //console.log('getEmptyBpm');
        return {
            bpm: 0,
            lastDownTime: 0,
            pressCount: 0,
            totalMs: 0,
        };
    }

    getMoveButtons(): string {
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;
        const style2 = `border-radius: 0.25rem; border: 1px solid black; font-size: 1rem; user-select: none; touch-action: none;`;

        return `
        <span
            style="${style2}"
            data-action-move-cell="left"
        >&nbsp;&lt;&nbsp;</span>
        <span
            style="${style2}"
            data-action-move-cell="top"
        >&nbsp;&uarr;&nbsp;</span>    
        <span
            style="${style2}"
            data-action-move-cell="bottom"
        >&nbsp;&darr;&nbsp;</span>                                
        <span
            style="${style2}"
            data-action-move-cell="right"
        >&nbsp;&gt;&nbsp;</span>                                        
        <span
            style="${style}"
            data-action-type="empty"
        >&nbsp;&nbsp;&nbsp;</span>
    `.trim();
    }

    moveCell(id: number, value: number) {}

    subscribeMoveCommands() {
        getWithDataAttrValue('action-move-cell', 'top', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.moveCell(this.activeCell.id, -120));
        });

        getWithDataAttrValue('action-move-cell', 'bottom', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.moveCell(this.activeCell.id, 120));
        });

        getWithDataAttrValue('action-move-cell', 'left', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.moveCell(this.activeCell.id, -10));
        });

        getWithDataAttrValue('action-move-cell', 'right', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.moveCell(this.activeCell.id, 10));
        });
    }

    highlightInstruments() {}

    getCellId(el: HTMLElement) {
        return un.parseInteger(el.dataset['chessCellId'], 0);
    }

    setActiveCell(el?: HTMLElement) {
        this.activeCell = this.getCellInfo(el);
    }

    getCellInfo(el?: HTMLElement): this['activeCell'] {
        if (!el) {
            return  {
                id: 0,
                col: 0,
                row: 0,
                rowCol: '',
                offset: 0,
            }
        }

        return {
            id: this.getCellId(el), // data-chess-cell-id
            row: parseInteger(el.dataset['chessCellRow'], 0), // data-chess-cell-row
            col: parseInteger(el.dataset['chessCellCol'], 0), // data-chess-cell-col
            rowCol: el.dataset['chessCellRowCol'], // data-chess-cell-row-col
            offset: parseInteger(el.dataset['chessTotalOffset'], 0), // data-chess-total-offset
        }
    }

    highlightCellByRowCol(rowCol: string, highlight: boolean = true) {
        rowCol = rowCol || this.activeCell.rowCol;

        getWithDataAttr('chess-cell-row-col', this.page.pageEl).forEach(el => {
            el.style.outline = null;
            el.style.zIndex = '0';
            el.dataset['selected'] = '';
        });

        if (highlight) {
            this.setActiveCell(null);
            const el = getWithDataAttrValue('chess-cell-with-id-row-col', rowCol)[0] || getWithDataAttrValue('chess-cell-row-col', rowCol)[0];

            if (el) {
                this.setActiveCell(el);

                el.style.outline = '3px solid yellow';
                el.style.zIndex = '1';
                el.dataset['selected'] = 'true';

                this.highlightInstruments();
            }
        }
    }

    chessCellClick(el: HTMLElement) {
        //console.log(el.dataset);
        const offset = parseInteger(el.dataset['chessTotalOffset'], null);

        if (offset === null) {
            return;
        }

        if (!el.dataset['selected']) {
            this.setActiveCell(el);
            this.highlightCellByRowCol(this.activeCell.rowCol);
        } else {
            this.highlightCellByRowCol(this.activeCell.rowCol, false);
            this.setActiveCell(null);
        }
    }

    subscribeChess() {
        getWithDataAttr('chess-cell-row-col', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.chessCellClick(el));
        });
    }

    getRowActionsCommands(): string {
        const display = `display: ${ideService.currentEdit?.freezeStructure ? 'none': 'block'};`;
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;
        const rowStyle = `${display} width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;

        return `
            <div
                data-edit-row-actions
                style="${rowStyle}"
            >
                <span
                    style="${style}"
                    data-edit-row-action="add-row"
                >addR</span>  
                <span
                    style="${style}"
                    data-edit-row-action="insert-row"
                >insR</span>                                  
                <span
                    style="${style} color: red;"
                    data-edit-row-action="delete-row"
                >delR</span>                    
            </div>        
        `.trim();
    }

    getTopCommandPanel(): string {
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;
        const style2 = `border-radius: 0.25rem; border: 1px solid black; font-size: 1rem; user-select: none; touch-action: none;`;
        const rowStyle = `width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;
        let result = '';

        result = `
            <div style="${rowStyle}">
                <!--span 
                    style="font-size: 1.5rem; user-select: none; touch-action: none;"
                    data-page-action="clear"
                >clr&nbsp;&nbsp;</span-->                
                <span
                    style="${style}"
                    data-page-action="record"
                >rec</span>
                <span
                    style="${style}"
                >&nbsp;&nbsp;&nbsp;</span>                    
                <span
                    style="${style}"
                    data-action-type="stop"
                >stop</span>                                        
                <span
                    style="${style}"
                    data-action-type="tick"
                >1:4</span>
                <!--span
                    style="${style}"
                    data-action-type="tick"
                >3:4&nbsp;</span-->                    
                <span
                    style="${style} color: blue;"
                    data-page-action="play-one"
                >play</span>
            </div>
            <div style="${rowStyle}">
                ${this.getMoveButtons()}                  
                <span
                    style="${style} background-color: red; color: white;"
                    data-edit-action="delete-cell"
                >del</span>                
            </div>
            ${this.getRowActionsCommands()}            
        `.trim();

        return result;
    }
}
