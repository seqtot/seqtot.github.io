import { Muse as m, TLineNote } from '../../libs/muse';
import { getWithDataAttr } from '../../src/utils';
import { AppDialog } from './app-dialog';

export class NoteDetailsDialog extends AppDialog {
    cb: (note: TLineNote) => void;
    note: TLineNote;

    get slidesTextFromInput(): string {
        let result = '';

        getWithDataAttr('slides-input', this.dialogEl).forEach((el: HTMLInputElement) => {
            result = (el.value || '').trim();
        });

        return result;
    }

    get durQFromInput(): number {
        let result = 0;

        getWithDataAttr('duration-input', this.dialogEl).forEach((el: HTMLInputElement) => {
            result = m.utils.parseInteger(el.value, result);
        });

        return result;
    }

    get volumeFromInput(): number {
        let result = 0;

        getWithDataAttr('volume-input', this.dialogEl).forEach((el: HTMLInputElement) => {
            result = m.utils.parseInteger(el.value, result);
        });

        return result;
    }

    openDialog(note: TLineNote, cb: NoteDetailsDialog['cb']  = null) {
        this.cb = cb;

        this.note = {
            ...note
        };

        this.note.volume = m.utils.parseInteger(this.note.volume, m.DEFAULT_VOLUME);

        // durQ:60
        // id: 2
        // instCode: 321
        // instName: "$egit*drpm"
        // note: "vo"
        // startOffsetQ: 60

        const btnStl = `
            display: inline-block;
            margin: 0;            
            border-radius: 0.25rem;
            border: 1px solid lightgray;
            font-size: 1.2rem;
            user-select: none;
        `.trim();

        const wrapper = `
            <div style="background-color: wheat; padding-bottom: 1rem;">
                <div style="padding: 1rem; display: flex; justify-content: space-between;">
                    <span data-ok-action style="${btnStl}">&nbsp;ОК&nbsp;</span>&nbsp;
                    <span data-cancel-action style="${btnStl}">Cancel</span>
                </div>
                %content%
            </div>
        `.trim();

        let content = wrapper.replace('%content%', `
            ${this.getVolumeContent(note)}
            ${this.getDurationContent(note)}
            ${this.getSlidesContent(note)}
        `.trim());

        this.dialogEl = document.createElement('div');
        this.dialogEl.style.cssText = this.getDialogStyle();
        this.dialogEl.innerHTML = content;
        this.hostEl.appendChild(this.dialogEl);
        this.hostEl.style.display = 'block';

        setTimeout(() => {
            this.subscribeEvents();
        });
    }

    subscribeEvents() {
        getWithDataAttr('ok-action', this.dialogEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.okClick());
        });

        getWithDataAttr('cancel-action', this.dialogEl).forEach((el) => {
            el.addEventListener('pointerup', () => this.cancelClick());
        });
    }

    okClick() {
        const close = () => {
            this.closeDialog();
            this.cb && this.cb(this.note);
        }

        this.note.slides = this.slidesTextFromInput;
        this.note.durQ = this.durQFromInput;
        this.note.volume = this.volumeFromInput;

        close();
    }

    cancelClick() {
        this.closeDialog();
    }

    getSlidesContent(note: TLineNote): string {
        let result = `
            <div style="margin: 1rem;">
                <div>слайды</div>            
                <textarea
                    style="border: 1px solid lightgray; width: 100%; margin-bottom: 1rem;"                
                    data-slides-input
                    rows="5"
                >${this.note.slides || ''}</textarea>
            </div>                    
        `;

        return result;
    }

    getDurationContent(note: TLineNote): string {
        let result = `
            <div style="margin: 1rem;">
                <div>длительность</div>
                <number-stepper-cc
                    data-duration-input
                    value="${note.durQ}"
                    min="1"
                    max="10000"
                ></number-stepper-cc>
            </div>
        `.trim();

        return result;
    }

    getVolumeContent(note: TLineNote): string {
        let result = `
            <div style="margin: 1rem;">
                <div>громкость</div>
                <number-stepper-cc
                    data-volume-input
                    value="${note.volume}"
                    min="0"
                    max="100"
                ></number-stepper-cc>
            </div>
        `.trim();

        return result;
    }
}

// NS
// note-details-dialog
// slides-input
// duration-input
// volume-input
//
