import { ComponentContainer as GlComponentContainer } from '../../libs/gl/ts/container/component-container';
import { ResolvedComponentItemConfig } from '../../libs/gl/ts/config/resolved-config';
import { ideService, ideEvents } from './ide-service';
import Fs from '../../libs/common/file-service';

type FileInfo = {
    path: string,
    name: string,
    isFile?: boolean,
    children?: FileInfo[],
}

export class FileTreeGlComponent {
    private glContainer: GlComponentContainer;
    private rootEl: HTMLElement;
    private fileTree: FileInfo[] = [];

    constructor(
        glContainer: GlComponentContainer,
        itemConfig?: ResolvedComponentItemConfig
    ) {
        this.glContainer = glContainer;

        const el = document.createElement('div');
        el.style.paddingLeft = '.5rem';

        this.rootEl = el;

        el.style.backgroundColor = '#fff';

        this.glContainer.element.style.overflow = 'auto';
        this.glContainer.element.appendChild(el);

        this.showTopLevel();
    }

    clickByFile(el: HTMLElement, fileInfo: FileInfo) {
        el.style.paddingLeft = '0.5rem';

        el.addEventListener('click', async () => {
            const text = await Fs.readTextFile(fileInfo.path);

            ideService.emit(ideEvents.openFile, fileInfo);
        });
    }

    async showDirContent(dir: FileInfo) {
        this.rootEl.innerHTML = null;

        const backEl = document.createElement('div');
        backEl.style.paddingLeft = '.5rem';
        backEl.style.cursor = 'pointer';
        backEl.innerText = '...';
        backEl.style.fontWeight = '700';

        const titleEl = document.createElement('div');
        titleEl.style.paddingLeft = '.5rem';
        titleEl.innerText = dir.name;
        titleEl.style.fontWeight = '700';

        this.rootEl.appendChild(backEl);
        this.rootEl.appendChild(titleEl);

        backEl.addEventListener('click', () => {
            this.showTopLevel();
        });

        if (!dir.children) {
            return;
        }

        dir.children.forEach(item => {
            const el = document.createElement('div');

            el.innerText = item.name;
            el.dataset.path = item.path;
            this.rootEl.appendChild(el);

            if (item.isFile) {
                this.clickByFile(el, item);
            }
        });
    }

    async showTopLevel() {
        this.rootEl.innerHTML = null;

        // кнопка перезагрузки дерева
        const updateTreeEl = document.createElement('button');
        updateTreeEl.innerText = 'update';
        updateTreeEl.addEventListener('click', () => this.showTopLevel());
        this.rootEl.appendChild(updateTreeEl);

        // загрузка дерева
        this.fileTree = await Fs.readdir('motes');

        // каталоги верхнего уровня
        this.fileTree.forEach((item, i) => {
            if (item.isFile) {
                return;
            }

            const el = document.createElement('div');
            el.style.paddingLeft = '.5rem';
            el.style.cursor = 'pointer';
            el.dataset.path = item.path;
            el.innerText = item.name;

            this.rootEl.appendChild(el);

            el.addEventListener('click', el => {
                this.showDirContent(item);
            });
        });

    }
}
