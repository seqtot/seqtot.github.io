export type UserSettings  = {
    boardVolume: number;
    userName: string;
    useCyrillicNote: boolean;
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
        settings.useCyrillicNote = settings.useCyrillicNote || false;

        localStorage.setItem('[user-settings]', JSON.stringify(settings));

        return settings;
    }

    static SetUserSettings(settings: Partial<UserSettings>) {
        let storedSettings = UserSettingsStore.GetUserSettings();

        localStorage.setItem('[user-settings]', JSON.stringify({
            ...storedSettings,
            ...settings
        }));
    }
}
