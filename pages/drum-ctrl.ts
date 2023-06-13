import {drumInfo} from '../muse/drums';

interface Page {
    getMetronomeContent(): string;
}

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

type KeyData = {
    quarterTime: number;
    quarterNio: number;
    code: string;
    note: string;
    down: number;
    up: number;
    next: number;
};

type BpmInfo = {
    bpm: number;
    lastDownTime: number;
    pressCount: number;
    totalMs: number;
};

const emptyBpmInfo = (): BpmInfo => {
    //console.log('getEmptyBpm');
    return {
        bpm: 0,
        lastDownTime: 0,
        pressCount: 0,
        totalMs: 0,
    };
};

export class DrumCtrl {
    bpmInfo: BpmInfo = emptyBpmInfo();
    mode: 'record' | null = null;
    keyData: KeyData | null = null;
    keySequence: KeyData[] = [];
    lastTickTime: number = 0;

    constructor(public page: Page) {}

    clearRecordData() {
        this.keyData = null;
        this.keySequence = [];
        this.lastTickTime = 0;
    }

    clearBpmInfo() {
        this.bpmInfo = emptyBpmInfo();
    }

    getContent(keyboardId: string): string {
        const topRowHeight = 5;
        const midRowHeight = 10;
        const botRowHeight = 5;
        let ind = 0;

        let metronome = `
            <div style="padding: 1rem .5rem 1rem .5rem;">
                &emsp;${this.page.getMetronomeContent()}
            </div>`.trim();

        let drums = Object.keys(drumInfo).reduce((acc, key) => {
            const info = drumInfo[key];
            const label = key === info.noteLat ? key: `${key}:${info.noteLat}`;

            acc = acc + `
                <a data-action-drum-key="${info.noteLat}" style="user-select: none;">${label}</a>&emsp;            
            `.trim();

            return acc;
        }, '');


        // <pre style="font-family: monospace; font-size: 1.6rem; margin: 0; padding: 0; padding-left: 0;">
        //     QoxoAoq_
        // X_qoA_xv
        // Q_q_Aoxo
        // X_x_A_xv</pre>

        const content = `
            <div class="page-content" style="padding-top: 0; padding-bottom: 2rem;">
                ${metronome}
                
                <div style="display: flex; user-select: none; touch-action: none; position: relative;">
                    <div style="width: 66%;">
                        <div style="display: flex; width: 100%;">
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; text-align: center; background-color: lightcyan; user-select: none; touch-action: none;"
                                data-action-drum-key="cowbell"
                                data-keyboard-id="${keyboardId}-${ind++}"                                
                            >
                                <!--<br/>&nbsp;K-k-->
                            </div>
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; text-align: center; background-color: lightyellow; user-select: none; touch-action: none;"
                                data-action-drum-key="cowbell"
                                data-keyboard-id="${keyboardId}-${ind++}"                                
                            >
                                <!--<br/>&nbsp;T-t-->
                            </div>
                        </div>                        
                        
                        <div
                            style="display: flex; width: 100%; height: ${midRowHeight/2}rem; background-color: whitesmoke; user-select: none; touch-action: none;"                        
                        >
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="empty0"
                                data-keyboard-id="${keyboardId}-${ind++}"                                
                            >         
                                <!--<br/>&nbsp;?-->
                            </div>
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="hc"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-highlight-drum="bd+hc"                                                                
                            >  
                                <!--<br/>&nbsp;X-x-->
                            </div>   
                        </div>
                                                 
                        <div
                            style="display: flex; width: 100%; height: ${midRowHeight/2}rem; background-color: whitesmoke; user-select: none; touch-action: none;"                        
                        >
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="hc"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-highlight-drum="sn+hc"                                
                            >       
                                <!--<br/>&nbsp;X-x-->
                            </div>
                            
                        
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="empty1"
                                data-keyboard-id="${keyboardId}-${ind++}"                                
                            >     
                                <!--<br/>&nbsp;?-->
                            </div>   
                        </div>                        
                        
                        <div
                            style="width: 100%; height: ${botRowHeight}rem; background-color: tan; user-select: none; touch-action: none;"
                            data-action-drum-key="bd"
                            data-keyboard-id="${keyboardId}-${ind++}"
                            data-highlight-drum="bd+hc"
                        >
                            <!--&nbsp;O-o-->
                        </div>                    
                    </div>

                    <div style="width: 33%; user-select: none; touch-action: none;">
                        <div
                            style="height: ${midRowHeight}rem; width: 100%; background-color: lightpink; user-select: none; touch-action: none;"
                            data-action-drum-key="sn"
                            data-keyboard-id="${keyboardId}-${ind++}"
                            data-highlight-drum="sn+hc"                                                                                    
                        >
                            <!--&nbsp;V-v-->
                        </div>
                        
                        <div 
                            style="width: 100%; height: ${botRowHeight}rem; text-align: center; user-select: none; touch-action: none;"                                                            
                        >
                            <!--data-action-drum-key="sn+hc"
                            data-keyboard-id="${keyboardId}-${ind++}"-->
                            <!--<br/>&nbsp;A-a-->
                        </div>                        
                        
                        <div 
                            style="width: 100%; height: ${botRowHeight}rem; text-align: center; user-select: none; touch-action: none;"
                            data-action-drum="get-bpm-or-stop"
                        >
                            <!--data-action-drum-key="bd+hc"
                            data-keyboard-id="${keyboardId}-${ind++}"-->
                            <!--<br/>&nbsp;Q-q-->
                        </div>
                    </div>
                                           
                    <div 
                        style="font-size: 1.7rem; font-family: monospace; height: 20rem; width: 100%; position: absolute; top: 0; pointer-events: none; user-select: none; touch-action: none; padding-left: .5rem;"
                        data-type="text-under-keyboard"
                    >
                        O-k-T-k-O---V---<br/>                    
                        O-k-T-k-O---O-kt<br/>
                        O-ktK-v-O---O---<br/>
                        O-k-|-k-O-k-V---<br/>
                        O---|-k-O---V---<br/>
                        O---T-k-O---V---<br/>
                        O---T-k-O---O---<br/>
                    </div>
                </div>
                
               

                <div style="margin: .5rem; user-select: none; touch-action: none;">
                    <span 
                        style="font-size: 1.5rem; user-select: none; touch-action: none;"
                        data-action-drum="clear"
                    >clr&nbsp;&nbsp;</span>                
                    <span
                        style="font-size: 1.5rem; user-select: none; touch-action: none;"
                        data-action-drum="record"
                    >rec&nbsp;&nbsp;</span>
                    <span
                        style="font-size: 1.5rem; user-select: none; touch-action: none;"
                        data-action-type="stop"
                    >stop&nbsp;&nbsp;</span>                                        
                    <span
                        style="font-size: 1.5rem; user-select: none; touch-action: none;"
                        data-action-type="tick"
                    >tick&nbsp;&nbsp;</span>                    
                </div>
                
                <div
                    data-name="drum-record-out"
                    style="padding-left: .5rem; font-size: 2rem; line-height: 1.5rem; font-family: monospace;"
                ></div>                
                                
                <div style="font-size: 2rem; margin: .5rem; user-select: none; font-family: monospace;">
                    O-k-T-k-O---V---<br/>                    
                    O-k-T-k-O---O-kt<br/>
                    O-ktK-v-O---O---<br/>
                    O-k-|-k-O-k-V---<br/>
                    O---|-k-O---V---<br/>
                    O---T-k-O---V---<br/>
                    O---T-k-O---O---<br/>                                                        
                </div>

                <div style="font-size: 2rem; margin: .5rem; user-select: none; font-family: monospace;">
                    QoxoAoq_<br/>
                    X_qoA_xv<br/>
                    Q_q_Aoxo<br/>
                    X_x_A_xv
                </div>

                <div style="font-size: 2rem; margin: .5rem; user-select: none; font-family: monospace;">
                    Q_q_Aoq_<br/>
                    X_q_A_xv<br/>
                    Q_q_Aoxo<br/>
                    X_qoA_xv
                </div>
                
            <div style="font-size: 1.5rem;">
                ${drums}            
            </div>
                
            </div>`.trim();

        return content;
    }
}
