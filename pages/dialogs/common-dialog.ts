import { AppDialog } from './app-dialog';

export class CommonDialog extends AppDialog {
    cb: (data: unknown) => void;

    openCommonDialog(html: string): CommonDialog {
        html = (html || '').trim();

        const content = `
            <div style="background-color: white; padding-bottom: 1rem;">
                ${html}
            </div>        
        `.trim();

        this.dialogEl = document.createElement('div');
        this.dialogEl.style.cssText = this.getDialogStyle();
        this.dialogEl.innerHTML = content;
        this.hostEl.appendChild(this.dialogEl);
        this.hostEl.style.display = 'block';

        return this;
    }
}
