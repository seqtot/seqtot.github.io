import { Muse as m } from '../libs/muse';
import { getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import { UserSettingsStore } from './user-settings-store';
import { Match as RouteInfo } from '../libs/navigo/types';

type WithId = {id: string}

export class UserSettingsPage {
    get pageId(): string {
        return this.props.data.id;
    }

    get pageEl(): HTMLElement {
        return document.getElementById('app-route');
    }

    constructor(
        public props: RouteInfo<WithId>,
    ) {}

    onMounted() {
        this.setContent();
    }

    setContent() {
        const settings = UserSettingsStore.GetUserSettings();

        this.pageEl.innerHTML = `
            <div style="padding: .5rem 0 .5rem 1rem;">
                <div>громкость клавиатуры</div>
                <number-stepper-cc
                    data-board-volume-input
                    value="${settings.boardVolume}"
                    min="0"
                    max="100"
                ></number-stepper-cc>
                
                <br/>
                
                <div>имя пользователя</div>
                <input
                    data-user-name-input
                    type="text"
                    style="font-size: 1.2rem; border: 1px solid lightgray;"                    
                    value="${settings.userName}"
                />
                
                <br/>

                <div>ноты кириллицей</div>
                <input
                    data-use-сyrillic-note
                    style="font-size: 1.2rem;"
                    type="checkbox"
                    ${settings.useCyrillicNote ? 'checked' : ''}
                />
            </div>
            
            <br/>
                            
            <div data-save-user-settings-action style="padding: .5rem 1rem .5rem 1rem;">
                <button style="font-size: 1.5rem;">save</button>
            </div>
        `.trim();

        getWithDataAttr('save-user-settings-action', this.pageEl).forEach(el => {
            el.addEventListener('pointerdown', () => {
                this.saveSettings();
            });
        });
    }

    getId(id: string): string {
        return this.pageId + '-' + id;
    }

    saveSettings() {
        let boardVolume = 70;
        let userName = '';
        let useCyrillicNote = false;

        getWithDataAttr('board-volume-input', this.pageEl).forEach((el: HTMLInputElement) => {
            boardVolume = m.parseInteger(el.value, boardVolume);
        });

        getWithDataAttr('user-name-input', this.pageEl).forEach((el: HTMLInputElement) => {
            userName = (el.value || '').trim();
        });

        getWithDataAttr('use-сyrillic-note', this.pageEl).forEach((el: HTMLInputElement) => {
            useCyrillicNote = el.checked;
        });

        UserSettingsStore.SetUserSettings({
            boardVolume,
            userName,
            useCyrillicNote,
        });
    }
}
