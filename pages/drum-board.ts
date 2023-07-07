const attrs = {
    actionDrumKey: 'action-drum-key',
    keyboardId: 'keyboard-id',
    color: 'color',
    color2: 'color2',
    char: 'char',
    headColor: 'head-color',
    bodyColor: 'body-color',
}


const drumKodes = [
    'bd', 'sn', 'hc',
    'tl', 'tm', 'th',
    // 'ho', 'hp', 'sr',
    // 'cc'
];

const someDrum = {
    note: '',
    headColor: 'lightgray',
    bodyColor: 'lightgray',
    char: '?',
}

// black deeppink sienna
const drumNotesInfo = {
    bd: {
        note: 'bd',
        headColor: 'sienna',
        bodyColor: 'tan',
        char: 'O',
    },
    sn: {
        note: 'sn',
        headColor: 'deeppink',
        bodyColor: 'lightgreen',
        char: 'V',
    },
    hc: {
        note: 'hc',
        headColor: 'lightgray',
        bodyColor: 'whitesmoke',
        char: 'x',
    },
    tl: {
        note: 'tl',
        headColor: 'lightgray',
        bodyColor: 'lightgray',
        char: 'l',
    },
    tm: {
        note: 'tm',
        headColor: 'seagreen',
        bodyColor: 'lightgreen',
        char: 'm',
    },
    th: {
        note: 'th',
        headColor: 'steelblue',
        bodyColor: 'lightblue',
        char: 'h',
    },
}

const drumKeysMap = {
    tl: {
        note: 'sr',
        headColor: 'steelblue',
        bodyColor: 'lightblue',
        char: 'k',
    },
    tm: {
        note: 'sr',
        headColor: 'seagreen',
        bodyColor: 'lightgreen',
        char: 't',
    },
    tr: {
        note: 'sn',
        headColor: 'deeppink',
        bodyColor: 'lightgreen',
        char: 'V',
    },

    mtl: {
        note: 'empty',
        headColor: 'whitesmoke',
        bodyColor: 'whitesmoke',
        char: 'x',
    },
    mtr: {
        note: 'hc',
        headColor: 'lightgray',
        bodyColor: 'whitesmoke',
        char: 'x',
    },

    mbl: {
        note: 'hc',
        headColor: 'lightgray',
        bodyColor: 'whitesmoke',
        char: 'x',
    },
    mbr: {
        note: 'empty',
        headColor: 'whitesmoke',
        bodyColor: 'whitesmoke',
        char: 'x',
    },

    bl: {
        note: 'bd',
        headColor: 'sienna',
        bodyColor: 'tan',
        char: 'O',
    },
    br: {
        note: 'empty',
        headColor: 'white',
        bodyColor: 'white',
        char: '',
    },
};

// const drumsMap = {
//     O: {
//         instr: 'drum_35',
//         note: 'bd',
//
//     },
//     V: {
//         note: 'sn',
//         instr: 'drum_40',
//     },
//     X: {
//         note: 'hc',
//         instr: 'drum_42',
//     },
// }

const mapToLetter = {
    'bd': 'O',
    'hc': 'X',
    'sn': 'V',
    'bd+hc': 'Q',
    'sn+hc': 'A',
    'hc+bd': 'Q',
    'hc+sn': 'A',
};

export class DrumBoard {
    constructor() {}

    getContent(keyboardId: string, view?: string): string {
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
                                data-action-drum-key="empty"
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
                                data-action-drum-key="empty"
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
}
