import { Props } from 'framework7/modules/component/snabbdom/modules/props';
import { ComponentContext } from 'framework7/modules/component/component';
import { Dom7Array } from 'dom7';
import { Muse as m } from '../libs/muse';
import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import { UserSettingsStore } from './user-settings-store';

export class UserSettingsPage {
    get pageId(): string {
        return this.props.id;
    }

    get pageEl(): HTMLElement {
        return this.context.$el.value[0] as HTMLElement;
    }

    get el$(): Dom7Array {
        return this.context.$el.value;
    }

    constructor(
        public props: Props,
        public context: ComponentContext,
    ) {}

    onMounted() {
        this.setContent();
    }

    setContent() {
        // <note-sequencer time-start="0" duration="4" theme="default"></note-sequencer>
        // data-decimal-point="2"
        // block block-strong block-outline-ios text-align-center

        const settings = UserSettingsStore.GetUserSettings();

        this.el$.html(`
            <div style="">
                <div style="padding: .5rem 0 .5rem 1rem;" class="text-align-center">
                    <div>
                        <small>громкость клавиатуры</small>                   
                    </div>   
                    <div
                        class="stepper stepper-fill stepper-init"
                        data-wraps="true"
                        data-autorepeat="true"
                        data-autorepeat-dynamic="true"
                        data-manual-input-mode="true"
                    >
                        <div class="stepper-button-minus"></div>
                        <div class="stepper-input-wrap">
                            <input
                                data-board-volume-input
                                type="text"
                                value="${settings.boardVolume}" min="0" max="100" step="1" />
                        </div>
                        <div class="stepper-button-plus"></div>
                    </div>
                    
                    <div>
                        <small>имя пользователя</small>                   
                    </div>                                        
                    <div class="item-input-wrap">
                        <input
                            data-user-name-input
                            type="text"
                            placeholder="User name"
                            value="${settings.userName}"
                        />
                    </div>             
                </div>
                
                <div class="list list-strong list-outline-ios list-dividers-ios">
                    <ul>
                        <li>
                            <label class="item-content">
                                <div class="item-inner">
                                    <div class="item-title">Ноты кириллицей</div>
                                    <div class="item-after">
                                        <div class="toggle toggle-init">
                                            <input
                                                data-use-сyrillic-note
                                                type="checkbox"
                                                ${settings.useCyrillicNote ? 'checked' : ''}
                                            >
                                            <span class="toggle-icon"></span>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </li>
                    </ul>                
                </div>                
                
                <div data-save-user-settings-action style="padding: .5rem 1rem .5rem 1rem;">
                    <button class="button button-fill color-green">save</button>
                </div>
            </div>    
        `);

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
