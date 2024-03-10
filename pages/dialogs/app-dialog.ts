import { getWithDataAttr } from '../../src/utils';

export class AppDialog {
    dialogEl: HTMLElement;

    get hostEl(): HTMLElement {
        return getWithDataAttr('app-dialog-host')[0];
    }

    closeDialog(){
        this.hostEl.removeChild(this.dialogEl);

        if (!this.hostEl.children.length) {
            this.hostEl.style.display = 'none';
        }
    }
}
