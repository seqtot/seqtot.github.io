import { RollPage, KeyboardPage, PageSong } from '../pages';
import { MuseEditorPage } from '../pages/page_muse_editor';
import { UserSettingsPage } from '../pages/page_user_settings';
import { ThereminPage } from '../pages/theremin/theremin.page';
import { SamplePage } from '../pages/page_sample_editor';
import { appRouter } from './router';
import { getWithDataAttr, getWithDataAttrValue } from './utils';
import { ConfirmDialog } from '../pages/dialogs';
import { GamePage } from '../pages/page_game';
import { PageSongList } from '../pages/page-song-list';
import { MY_SONG } from '../pages/song-store';
import {UserSettingsStore} from '../pages/user-settings-store';

const pages = {
    page_roll: RollPage,
    page_keyboard: KeyboardPage,
    page_muse_editor: MuseEditorPage,
    userSettings: UserSettingsPage,
    theremin: ThereminPage,
    page_sample_editor: SamplePage,
    game: GamePage,
    song: PageSong,
    song_list: PageSongList,
};

const isDev = /localhost/.test(window.location.href);
const isDevUser = UserSettingsStore.GetUserSettings().userName === 'dev' || isDev;
// const isDev =
//     /devitband/.test(window.location.href) ||
//     /local/.test(window.location.href);

const defRoute = isDev ? 'page/page_muse_editor' : '/song_list/bandit'; // ; '/game/test'
// const defRoute = '/set/set_E/';
// const defRoute = '/set/set_Battle/';
// const defRoute = '/set/set_ItsMyLife/';
// const defRoute = !isDev ? '/page/page_keyboard/' : '/page/page_keyboard/';
// const defRoute = isDev ? '/page/page_sample_editor/' : '/set/set_all/';
// const defRoute = isDev ? '/mbox/tiriTiri/' : '/set/set_all/';

type Link = {
    href: string,
    name: string,
    isDev?: boolean
}

const linksToPage: Link[]  = [
    { href: '/song_list/bandit', name: 'Список' },
    { href: '/song_list/bandit_draft', name: 'Черновики' },
    { href: `/song_list/${MY_SONG}`, name: 'Мои вещи' },
    { href: '/page/page_keyboard', name: 'keyboard' },
    { href: '/page/userSettings', name: 'Settings' },
    { href: '/page/theremin', name: 'Theremin' },
    { href: '/page/page_muse_editor', name: 'museEditor', isDev: true },
    { href: '/page/page_sample_editor', name: 'sampleEditor', isDev: true },
    { href: '/page/page_roll', name: 'roll', isDev: true },
    { href: '/game/test', name: 'game' },
];

class App {
    lastRouteComponent: any;
    appEl: HTMLElement;
    pageEl: HTMLElement;

    init() {
        this.appEl = document.getElementById('app');
        this.pageEl = document.getElementById('app-route');

        this.subscribeRouter();
        this.subscribeMainMenu();

        appRouter.navigate(defRoute);
    }

    clearCurrentRoute() {
        if (this.lastRouteComponent && this.lastRouteComponent['onUnmounted']) {
            this.pageEl.innerHTML = '';
            this.lastRouteComponent.onUnmounted();
        }

        this.lastRouteComponent = null;
    }

    setComponentByRoute(klass: any, routeInfo: any) {
        this.clearCurrentRoute();

        this.lastRouteComponent = new klass({data: routeInfo});

        if (this.lastRouteComponent && this.lastRouteComponent['onMounted']) {
            this.lastRouteComponent.onMounted();
        }
    }

    renderDefaultPage() {
        this.clearCurrentRoute();

        let linksHtml = '';

        linksToPage.forEach(item => {
            linksHtml += `
                    <a
                        data-route
                        style="
                            display: inline-block;
                            padding: .4rem; 
                            font-size: 1.3rem;"
                            href="${item.href}"
                    >
                        ${item.name}
                    </a><br/>`.trim();
        });

        this.pageEl.innerHTML = `<div style="padding: 1rem;">${linksHtml}</div>`;

        appRouter.updatePageLinks();
    }

    subscribeMainMenu() {
        const menuBtn = getWithDataAttr('app-header-main-button')[0];

        menuBtn.addEventListener('pointerup', () => this.openMainMenu());
    }

    openMainMenu() {
        const wrapper = `%content%`;
        let content = '';
        linksToPage.forEach(item => {
            if (item.isDev && !(isDev || isDevUser)) return;

            content += `
                <div
                    style="font-size: 1.4rem;
                    padding: .4rem;"
                    data-main-menu-item="${item.href}"
                >
                    ${item.name}
                </div>
            `.trim();
        });

        const dialog = new ConfirmDialog();
        dialog.openConfirmDialog(wrapper.replace('%content%', content));

        linksToPage.forEach(item => {
            //if (item.isDev && !(isDev || isDevUser)) return;

            const el = getWithDataAttrValue('main-menu-item', item.href)[0];
            el.addEventListener('pointerup', e => {
                appRouter.navigate(item.href);
                dialog.closeDialog();
            });
        });
    }

    subscribeRouter() {
        appRouter.on('song_list', this, (id) =>  {
            console.log('/song_list/:id', id);

            this.setComponentByRoute(PageSongList, {
                route: 'song_list',
                id,
            });

            return true;
        });

        appRouter.on('song', this, (song) =>  {
            console.log('/song/:song', song);

            this.setComponentByRoute(PageSong, {
                    id: 'song',
                    song: song,
                });

            return true;
        });

        appRouter.on('game', this, (game) =>  {
            console.log('/game/:game', game);

            this.setComponentByRoute(GamePage, {
                id: 'game',
                game,
            });

            return true;
        });

        appRouter.on('page', this, (id) => {
            console.log('/page/:id', id);

            const pageId = (id || '') as string;
            const klass = pages[pageId];

            if (!klass) return;

            this.setComponentByRoute(klass, {id});

            return true;
        });

        appRouter.on('/', this, (data) => {
            console.log('/', data);

            this.renderDefaultPage();

            return true;
        });
    }

}

export const app = new App();
