import { getWithDataAttr } from '../../src/utils';
import { AppDialog } from './app-dialog';

export class NameDialog extends AppDialog {
    cb: (data: {name: string}) => void;
    name = '';

    get nameFromInput(): string {
        let result = '';

        getWithDataAttr('name-input', this.dialogEl).forEach((el: HTMLInputElement) => {
            result = el.value;
            result = result.replace(/ /g, '');
            result = result.trim();
        });

        return result || '';
    }

    openNameDialog(data: {name: string}, cb: NameDialog['cb']  = null) {
        this.name = data.name || '';
        this.cb = cb;

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
                <div>Название только буквами, цифрами, знаками - или _ (без пробелов)</div>
                <input
                    data-name-input
                    type="text"
                    style="border: 1px solid lightgray; font-size: 1.5rem;"
                    value="${this.name}"
                >
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
        let newName = this.nameFromInput;

        if (!newName) {
            return this.cancelClick();
        }

        this.closeDialog();
        this.cb && this.cb({name: newName});
    }

    cancelClick() {
        this.closeDialog();
        this.cb && this.cb({name: this.name});
    }
}
