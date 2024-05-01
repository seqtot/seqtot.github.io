import { ComponentContainer as GlComponentContainer } from '../../libs/gl/ts/container/component-container';
import { ResolvedComponentItemConfig } from '../../libs/gl/ts/config/resolved-config';
import { ideService, ideEvents } from './ide-service';
import Fs from '../../libs/common/file-service';
import { MY_SONG } from '../song-store';
import { SongDB } from './my-song-db';
import { TSongNode } from '../../libs/muse';
import {getWithDataAttr} from '../../src/utils';
import { Tag } from './tag';

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
            //const text = await Fs.readTextFile(fileInfo.path);
            getWithDataAttr('file-name').forEach(el => {
                el.style.fontWeight = '400';
            });

            el.style.fontWeight = '700';

            ideService.emit(ideEvents.openFile, fileInfo);
        });
    }

    async showDirContent(dir: FileInfo) {
        this.rootEl.innerHTML = null;

        const backEl = document.createElement('div');
        backEl.innerHTML = `&larr; ${dir.name}`;
        backEl.setAttribute('style', 'padding: .5rem; padding-bottom: 1rem; color: blue; cursor: pointer; font-weight: 700;')
        this.rootEl.appendChild(backEl);

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
            el.dataset.fileName = null;
            el.style.cursor = 'pointer';
            this.rootEl.appendChild(el);

            if (item.isFile) {
                this.clickByFile(el, item);
            }
        });

        {
            const div = document.createElement('div');
            const addBtn = document.createElement('button');
            const delBtn = document.createElement('button');
            addBtn.innerText = 'add';
            addBtn.style.margin = '.5rem';
            delBtn.innerText = 'del';
            delBtn.style.margin = '.5rem';

            div.appendChild(addBtn);
            div.appendChild(delBtn);

            addBtn.addEventListener('pointerup', async () => {
                const id = (prompt('Добавить файл') || '').trim();
                await SongDB.AddSong(<TSongNode>{
                    id,
                    score: '',
                    tags: [MY_SONG],
                });
            });

            delBtn.addEventListener('pointerup', async () => {
                const id = (prompt('Удалить файл') || '').trim();
                if (!id) return;

                await SongDB.DelSongById(id);
            });

            this.rootEl.appendChild(div);
        }
    }

    async getMySongNode(): Promise<FileInfo> {
        let mySongNode = <FileInfo>{
            name: MY_SONG,
            path: MY_SONG,
            children: []
        };

        const files = await SongDB.GetAllSongs();
        files.forEach(item => {
            mySongNode.children.push({
                name: item.id,
                path: MY_SONG,
                isFile: true,
            });
        });

        return Promise.resolve(mySongNode);
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
        this.fileTree = this.fileTree.filter(item => item.name !== MY_SONG);
        const mySongNode = await this.getMySongNode();
        this.fileTree.push(mySongNode);

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
