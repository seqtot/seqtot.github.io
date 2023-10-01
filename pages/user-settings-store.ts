import * as un from '../libs/muse/utils';

export type UserSettings  = {
    boardVolume: number;
    userName: string;
}

export class UserSettingsStore {
    static GetUserSettings(): UserSettings {
        let settings: UserSettings;

        settings = localStorage.getItem('[user-settings]') as any;

        if (!settings) {
            localStorage.setItem('[user-settings]', JSON.stringify({}));
        }

        settings = JSON.parse(localStorage.getItem('[user-settings]')) as any;
        settings.boardVolume = settings.boardVolume || 70;
        settings.userName = settings.userName || '';

        localStorage.setItem('[user-settings]', JSON.stringify(settings));

        return settings;
    }

    static SetUserSettings(settins: UserSettings) {
        localStorage.setItem('[user-settings]', JSON.stringify(settins));
    }
}
