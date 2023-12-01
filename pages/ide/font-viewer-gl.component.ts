import { ComponentContainer as GlComponentContainer } from '../../libs/gl/ts/container/component-container';
import { ResolvedComponentItemConfig } from '../../libs/gl/ts/config/resolved-config';
import { ideService, ideEvents } from './ide-service';
import Fs from '../../libs/common/file-service';

import { WebAudioFontLoader } from '../../libs/waf-player/loader';
import { getInstrumentTitles } from '../../libs/waf-player/instrument-titles';
import { parseInteger } from '../../libs/common';
import { Sound } from '../../libs/muse';

type FileInfo = {
    path: string,
    name: string,
    isFile?: boolean,
    children?: FileInfo[],
}

const fontLoader = new WebAudioFontLoader(null as any);

export class FontViewerGlComponent {
    private glContainer: GlComponentContainer;
    private rootEl: HTMLElement;

    constructor(
        glContainer: GlComponentContainer,
        itemConfig?: ResolvedComponentItemConfig
    ) {
        this.glContainer = glContainer;

        const el = document.createElement('div');
        el.style.paddingLeft = '.5rem';
        el.style.backgroundColor = '#fff';

        this.rootEl = el;

        this.glContainer.element.style.overflow = 'auto';
        this.glContainer.element.appendChild(el);
        this.showTopList();
    }

    showTopList() {
        this.rootEl.innerHTML = null;

        getInstrumentTitles().forEach((item, i) => {
            const el = document.createElement('div');
            el.style.paddingLeft = '.5rem';
            el.style.cursor = 'pointer';
            el.style.userSelect = 'none';
            el.dataset['index'] = (i as any);
            el.innerText = item + ' - ' + fontLoader.getInstrumentsByGroup(i).length;

            this.rootEl.appendChild(el);

            el.addEventListener('click', el => {
                this.showGroupAndItems(item, i);
            });
        });
    }

    showGroupAndItems(title: string, index: string | number) {
        this.rootEl.innerHTML = null;

        const backEl = document.createElement('div');
        backEl.style.paddingLeft = '.5rem';
        backEl.style.cursor = 'pointer';
        backEl.innerText = '...';
        backEl.style.fontWeight = '700';

        const titleEl = document.createElement('div');
        titleEl.style.paddingLeft = '.5rem';
        titleEl.innerText = title;
        titleEl.style.fontWeight = '700';

        this.rootEl.appendChild(backEl);
        this.rootEl.appendChild(titleEl);

        backEl.addEventListener('click', () => {
           this.showTopList();
        });

        fontLoader.getInstrumentsByGroup(index).forEach(item => {
            const el = document.createElement('div');
            el.style.paddingLeft = '1rem';
            el.style.cursor = 'pointer';
            el.style.userSelect = 'none';
            backEl.style.cursor = 'pointer';
            el.dataset['index'] = item.variable;
            el.innerText = item.variable + ' - ' + item.index;

            this.rootEl.appendChild(el);

            el.addEventListener('click', async () => {
                this.loadInstrument(item.index);
            });
        });
    }

    async loadInstrument(code: number | string) {
        code = parseInteger(code);
        const info = fontLoader.instrumentInfo(parseInteger(code));

        if (!info || window[info.variable]) {
            ideService.useToneInstrument = code;

            return;
        }

        const path = `D:\\audio\\webaudiofontdata\\sound\\${info.fileName}`;

        const text = await Fs.readTextFile(path);
        const arr = text.split('\n');
        let preset: any;

        for (let i = 0; i < arr.length; i++) {
            let str = arr[i].trim();
            if (str.startsWith('console')) str = '';
            if (str.startsWith('var ')) str = 'preset = {';
            if (str.startsWith('};')) str = '}';
            arr[i] = str;
        }

        eval(arr.filter(item => !!item).join('\n'));
        Sound.setToneSound(code, info.variable, preset);
        ideService.useToneInstrument = code;
    }
}
