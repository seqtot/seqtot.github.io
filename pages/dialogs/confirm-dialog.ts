import { getWithDataAttr } from '../../src/utils';
import { AppDialog } from './app-dialog';

export class ConfirmDialog extends AppDialog {
    cb: (result: boolean) => void;

    openConfirmDialog(text, cb: ConfirmDialog['cb']  = null) {
        this.cb = cb;
        text = (text || '').trim();

        const btnStl = `
            display: inline-block;
            margin: 0;            
            margin-right: .5rem;
            margin-bottom: 1rem;            
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

        const content = wrapper.replace('%content%', `
            <div style="margin: 1rem;">
                <div>${text}</div>
            </div>        
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
        this.closeDialog();
        this.cb && this.cb(true);
    }

    cancelClick() {
        this.closeDialog();
        this.cb && this.cb(false);
    }
}
