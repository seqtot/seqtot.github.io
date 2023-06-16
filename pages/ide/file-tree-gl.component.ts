import { ComponentContainer as GlComponentContainer } from '../../libs/gl/ts/container/component-container';
import { ResolvedComponentItemConfig } from '../../libs/gl/ts/config/resolved-config';
import { Json } from '../../libs/gl/ts/utils/types';
import ideService, {ideEvents} from './ide-service';
import Fs from './file-service';

type FileInfo = {
    path: string,
    name: string,
    isFile?: boolean,
    children?: FileInfo[],
}

export class FileTreeGlComponent {
    private glContainer: GlComponentContainer;
    private rootEl: HTMLElement;
    private dirTreeEl: HTMLElement;
    private fileTreeEl: HTMLElement;
    private fileTree: any[] = [];

    constructor(
        glContainer: GlComponentContainer, itemConfig?: ResolvedComponentItemConfig
    ) {

        this.glContainer = glContainer;

        const el = document.createElement('div');
        el.style.paddingLeft = '.5rem';

        this.rootEl = el;

        const buttonFile = document.createElement('button');
        const buttonDir = document.createElement('button');
        this.dirTreeEl = document.createElement('div');
        this.fileTreeEl = document.createElement('div');

        buttonFile.innerText = 'file';
        buttonDir.innerText = 'dir';

        el.appendChild(buttonFile);
        el.appendChild(buttonDir);
        el.appendChild(this.dirTreeEl);
        el.appendChild(this.fileTreeEl);
        el.style.backgroundColor = '#fff';

        this.glContainer.element.style.overflow = 'auto';
        this.glContainer.element.appendChild(el);

        buttonFile.addEventListener('click', () => {
            console.log(this.glContainer.layoutManager.root);
            console.log(this.glContainer.layoutManager.rootItem);
            console.log(this.glContainer.layoutManager.findFirstComponentItemById('fileTree'));

            // Fs.readFile('bandit/agressive_samurai_A.notes.midi')
            //     .then(data => {
            //         console.log('Fs.readFile', data);
            //     });
        });

        buttonDir.addEventListener('click', async () => {
            this.fileTree = await Fs.readdir('');

            this.dirTreeEl.innerHTML = null;
            this.fileTreeEl.innerHTML = null;

            this.fileTree.forEach(item => {
                const el = document.createElement('div');

                el.innerText = item.name;
                el.dataset.path = item.path;
                this.dirTreeEl.appendChild(el);

                el.addEventListener('click', (event: MouseEvent) => {
                    if (item.children) {
                        this.fileTreeEl.innerHTML = null;
                        item.children.forEach(item => {
                            const el = document.createElement('div');

                            el.innerText = item.name;
                            el.dataset.path = item.path;
                            this.fileTreeEl.appendChild(el);

                            if (item.isFile) {
                                this.clickByFile(el, item);
                            }
                        });
                    }

                    console.log('EVENT', event);
                });
            });

            //console.log('Fs.readDir', files);
        });
    }

    clickByFile(el: HTMLElement, fileInfo: FileInfo) {
        el.style.paddingLeft = '0.5rem';

        el.addEventListener('click', async () => {
            const text = await Fs.readFile(fileInfo.path);

            ideService.emit(ideEvents.openFile, fileInfo);

            //console.log(fileInfo);
            //console.log(text);
        });
    }
}
