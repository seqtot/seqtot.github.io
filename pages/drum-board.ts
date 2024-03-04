import {UserSettingsStore} from './user-settings-store';

const attrs = {
    actionDrumKey: 'action-drum-key',
    keyboardId: 'keyboard-id',
    color: 'color',
    color2: 'color2',
    char: 'char',
    headColor: 'head-color',
    bodyColor: 'body-color',
}

// black deeppink sienna
export const drumNotesInfo = {
    __: {
        note: '',
        headColor: '',
        bodyColor: '',
        char: '',
        vocalism: '',
    },
    bd: {
        note: 'bd',
        headColor: 'sienna',
        bodyColor: 'tan',
        char: 'O',
        vocalism: 'пы',
    },
    sn: {
        note: 'sn',
        headColor: 'tomato',
        bodyColor: 'tomato',
        char: 'V',
        vocalism: 'ба',
    },
    hc: {
        note: 'hc',
        headColor: 'lightgray',
        bodyColor: 'whitesmoke',
        char: 'x',
        vocalism: 'чи',
    },
    ho: {
        note: 'ho',
        headColor: 'lightgray',
        bodyColor: 'whitesmoke',
        char: 'x',
        vocalism: 'ча',
    },
    hp: {
        note: 'hp',
        headColor: 'lightgray',
        bodyColor: 'whitesmoke',
        char: 'x',
        vocalism: 'hp',
    },
    cc: {
        note: 'cc',
        headColor: 'orange',
        bodyColor: 'orange',
        char: 'щ',
        vocalism: 'щи',
    },
    rc: {
        note: 'rc',
        headColor: 'lightgray',
        bodyColor: 'whitesmoke',
        char: 'ц',
        vocalism: 'ци',
    },
    tl: {
        note: 'tl',
        headColor: 'bisque',
        bodyColor: 'bisque',
        char: 'у',
        vocalism: 'ту',
    },
    tm: {
        note: 'tm',
        headColor: 'seagreen',
        bodyColor: 'lightgreen',
        char: 'о',
        vocalism: 'то',
    },
    th: {
        note: 'th',
        headColor: 'steelblue',
        bodyColor: 'lightblue',
        char: 'а',
        vocalism: 'та',
    },
}

const userSettings = UserSettingsStore.GetUserSettings();

let drumCodesBoard = [
    [drumNotesInfo.ho, drumNotesInfo.cc, drumNotesInfo.rc],
    [drumNotesInfo.th, drumNotesInfo.tm, drumNotesInfo.tl],
    [drumNotesInfo.hc, drumNotesInfo.sn, drumNotesInfo.bd],
];

if (userSettings.userName === 'devUser') {
    drumCodesBoard = [
        [drumNotesInfo.__, drumNotesInfo.__, drumNotesInfo.sn],
        [drumNotesInfo.__, drumNotesInfo.hc, drumNotesInfo.__],
        [drumNotesInfo.bd, drumNotesInfo.__, drumNotesInfo.__],
    ];
}

export class DrumBoard {
    constructor() {}

    getContentOld(keyboardId: string, view?: string): string {
        const topRowHeight = 5;
        const midRowHeight = 10;
        const botRowHeight = 5;
        let ind = 0;
        const rem = 'rem';

        const content = `
                <div style="display: flex; user-select: none; touch-action: none; position: relative;">
                    <div style="width: 66%;">
                        <div style="display: flex; width: 100%;">
                            <div 
                                style="background-color: antiquewhite; width: 50%; height: ${botRowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                                data-action-drum-key="tl"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-color="lightgray"
                                data-color2="lightgray"
                                data-char="l"
                            >
                                <!--data-action-drum-key="sn+hc"
                                data-keyboard-id="${keyboardId}-${ind++}"-->
                                <!--<br/>&nbsp;A-a-->
                            </div>
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; text-align: center; background-color: lightgreen; user-select: none; touch-action: none;"
                                data-action-drum-key="tm"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-color="seagreen"                                
                                data-color2="lightgreen"
                                data-char="m"
                            >
                                <!--<br/>&nbsp;T-t-->
                            </div>
                        </div>                        
                        
                        <div
                            style="display: flex; width: 100%; height: ${midRowHeight/2}rem; background-color: whitesmoke; user-select: none; touch-action: none;"                        
                        >
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="cc"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-color="lightgray"
                                data-color2="whitesmoke"                                                                
                            >         
                                <!--<br/>&nbsp;?-->
                            </div>
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: lightgray; user-select: none; touch-action: none;"
                                data-action-drum-key="hc"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-highlight-drum="bd+hc"  
                                data-color="lightgray"
                                data-color2="whitesmoke"
                                data-char="x"
                            >  
                                <!--<br/>&nbsp;X-x-->
                            </div>   
                        </div>
                                                 
                        <div
                            style="display: flex; width: 100%; height: ${midRowHeight/2}${rem}; background-color: whitesmoke; user-select: none; touch-action: none;"                        
                        >
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}${rem}; box-sizing: border-box; text-align: center; background-color: lightgray; user-select: none; touch-action: none;"
                                data-action-drum-key="hc"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-highlight-drum="sn+hc"  
                                data-color="lightgray"
                                data-color2="whitesmoke"
                                data-char="x"
                            >       
                                <!--<br/>&nbsp;X-x-->
                            </div>
                            
                        
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}${rem}; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="rc"                                
                                data-keyboard-id="${keyboardId}-${ind++}"   
                                data-color="lightgray"
                                data-color2="whitesmoke"
                            >     
                                <!--<br/>&nbsp;?-->
                            </div>   
                        </div>                        
                        
                        <div
                            style="width: 100%; height: ${botRowHeight}${rem}; background-color: tan; user-select: none; touch-action: none;"
                            data-action-drum-key="bd"
                            data-keyboard-id="${keyboardId}-${ind++}"
                            data-highlight-drum="bd+hc"
                            data-color="sienna"
                            data-color2="tan"
                            data-char="O"
                        >
                            <!--&nbsp;O-o-->
                        </div>                    
                    </div>

                    <div style="width: 33%; user-select: none; touch-action: none;">
                        <div
                            style="height: ${midRowHeight}${rem}; width: 100%; background-color: lightpink; user-select: none; touch-action: none;"
                            data-action-drum-key="sn"
                            data-keyboard-id="${keyboardId}-${ind++}"
                            data-highlight-drum="sn+hc"
                            data-color="deeppink"                                                                                    
                            data-color2="lightpink"
                            data-char="V"
                        >
                            <!--&nbsp;V-v-->
                        </div>
                                            
                        <div 
                            style="width: 100%; height: ${topRowHeight}${rem}; text-align: center; background-color: lightblue; user-select: none; touch-action: none;"
                            data-action-drum-key="th"
                            data-keyboard-id="${keyboardId}-${ind++}"  
                            data-color="steelblue"
                            data-color2="lightblue"
                            data-char="h"
                        >
                            <!--<br/>&nbsp;K-k-->
                        </div>

                        <div
                            style="width: 100%; height: ${botRowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                            data-action-drum="get-bpm-or-stop"
                        >
                            <!--data-action-drum-key="bd+hc"
                            data-keyboard-id="${keyboardId}-${ind++}"-->
                            <!--<br/>&nbsp;Q-q-->
                        </div>
                    </div>
                                           
                    <div 
                        style="font-size: 1.7rem; font-family: monospace; height: 20rem; width: 100%; position: absolute; top: 0; pointer-events: none; user-select: none; touch-action: none; padding-left: .5rem;"
                        data-name="drum-text-under-board"
                    >
                    </div>
                </div>
            `.trim();

        return content;
    }

    getContent(keyboardId: string, view?: string): string {
        let ind = 0;
        const rowHeight = 6;
        const rem = 'rem';
        const info = drumNotesInfo;
        const rowStyle = 'display: flex; width: 100%; user-select: none; touch-action: none; font-size: 1.2rem;';

        let wrapper = `<div style="user-select: none; touch-action: none; position: relative;">%content%</div>`
        let content = '';

        drumCodesBoard.forEach(row => {
            let rowHtml = `<div style="${rowStyle}">`;

            row.forEach(cell => {
                rowHtml += `
                    <div 
                        style="background-color: ${cell.bodyColor}; width: 33%; height: ${rowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                        data-action-drum-key="${cell.note}"
                        data-keyboard-id="${keyboardId}-${ind++}"
                        data-color="${cell.bodyColor}"
                        data-color2="${cell.headColor}"
                        data-char="${cell.char}"
                    >
                        <br/>${cell.vocalism}
                    </div>                
                `
            });

            rowHtml += '</div>';
            content += rowHtml;
        });

        return wrapper.replace('%content%', content.trim());
    }
}
