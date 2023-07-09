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
        const rowStyle = 'display: flex; width: 100%; user-select: none; touch-action: none;';

        const content = `
            <div style="user-select: none; touch-action: none; position: relative;">
                <div style="${rowStyle}">
                    <div 
                        style="background-color: ${info.ho.bodyColor}; width: 33%; height: ${rowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                        data-action-drum-key="${info.ho.note}"
                        data-keyboard-id="${keyboardId}-${ind++}"
                        data-color="${info.ho.bodyColor}"
                        data-color2="${info.ho.headColor}"
                        data-char="${info.ho.char}"
                    >
                        <br/>${info.ho.vocalism}
                    </div>
                    <div 
                        style="background-color: ${info.cc.bodyColor}; width: 33%; height: ${rowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                        data-action-drum-key="${info.cc.note}"
                        data-keyboard-id="${keyboardId}-${ind++}"
                        data-color="${info.cc.bodyColor}"
                        data-color2="${info.cc.headColor}"
                        data-char="${info.cc.char}"
                    >
                        <br/>${info.cc.vocalism}
                    </div>
                    <div 
                        style="background-color: ${info.rc.bodyColor}; width: 34%; height: ${rowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                        data-action-drum-key="${info.rc.note}"
                        data-keyboard-id="${keyboardId}-${ind++}"
                        data-color="${info.rc.bodyColor}"
                        data-color2="${info.rc.headColor}"
                        data-char="${info.rc.char}"
                    >
                        <br/>${info.rc.vocalism}
                    </div>                        
                </div>                        
                    
                <div style="${rowStyle}">
                    <div 
                        style="background-color: ${info.th.bodyColor}; width: 34%; height: ${rowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                        data-action-drum-key="${info.th.note}"
                        data-keyboard-id="${keyboardId}-${ind++}"
                        data-color="${info.th.bodyColor}"
                        data-color2="${info.th.headColor}"
                        data-char="${info.th.char}"                                                                
                    >         
                        <br/>${info.th.vocalism}
                    </div>
                    <div 
                        style="background-color: ${info.tm.bodyColor}; width: 34%; height: ${rowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                        data-action-drum-key="${info.tm.note}"
                        data-keyboard-id="${keyboardId}-${ind++}"
                        data-color="${info.tm.bodyColor}"
                        data-color2="${info.tm.headColor}"
                        data-char="${info.tm.char}"                                                                
                    >         
                        <br/>${info.tm.vocalism}
                    </div>   
                    <div 
                        style="background-color: ${info.tl.bodyColor}; width: 34%; height: ${rowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                        data-action-drum-key="${info.tl.note}"
                        data-keyboard-id="${keyboardId}-${ind++}"
                        data-color="${info.tl.bodyColor}"
                        data-color2="${info.tl.headColor}"
                        data-char="${info.tl.char}"                                                                
                    >         
                        <br/>${info.tl.vocalism}
                    </div>                        
                </div>

                <div style="${rowStyle}">
                    <div 
                        style="background-color: ${info.hc.bodyColor}; width: 34%; height: ${rowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                        data-action-drum-key="${info.hc.note}"
                        data-keyboard-id="${keyboardId}-${ind++}"
                        data-color="${info.hc.bodyColor}"
                        data-color2="${info.hc.headColor}"
                        data-char="${info.hc.char}"                                                                
                    >         
                        <br/>${info.hc.vocalism}
                    </div>
                    <div 
                        style="background-color: ${info.sn.bodyColor}; width: 34%; height: ${rowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                        data-action-drum-key="${info.sn.note}"
                        data-keyboard-id="${keyboardId}-${ind++}"
                        data-color="${info.sn.bodyColor}"
                        data-color2="${info.sn.headColor}"
                        data-char="${info.sn.char}"                                                                
                    >         
                        <br/>${info.sn.vocalism}
                    </div>
                    <div 
                        style="background-color: ${info.bd.bodyColor}; width: 34%; height: ${rowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                        data-action-drum-key="${info.bd.note}"
                        data-keyboard-id="${keyboardId}-${ind++}"
                        data-color="${info.bd.bodyColor}"
                        data-color2="${info.bd.headColor}"
                        data-char="${info.bd.char}"                                                                
                    >         
                        <br/>${info.bd.vocalism}
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
