// import { RollPage, KeyboardPage, MBoxPage } from '../pages';
// import { MuseEditorPage } from '../pages/page_muse_editor';
// import { UserSettingsPage } from '../pages/page_user_settings';
// import { ThereminPage } from '../pages/theremin/theremin.page';
// import { SamplePage } from '../pages/page_sample_editor';
// import { Match as RouteInfo } from '../libs/navigo/types';
// import { appRouter } from './router';
//
// let lastRouteComponent: any;
//
// const pages = {
//     page_roll: RollPage,
//     page_keyboard: KeyboardPage,
//     page_muse_editor: MuseEditorPage,
//     mbox: MBoxPage,
//     userSettings: UserSettingsPage,
//     theremin: ThereminPage,
//     page_sample_editor: SamplePage,
// };
//
// const appEl = document.getElementById('app');
// const pageEl = document.getElementById('app-route');
//
// const isDev = /localhost/.test(window.location.href);
// // const isDev =
// //     /devitband/.test(window.location.href) ||
// //     /local/.test(window.location.href);
//
// const defRoute = '/mbox/setBand/';
// // const defRoute = '/set/set_E/';
// // const defRoute = '/set/set_Battle/';
// // const defRoute = '/set/set_ItsMyLife/';
// //const defRoute = !isDev ? '/page/page_keyboard/' : '/page/page_keyboard/';
// //const defRoute = isDev ? '/page/page_sample_editor/' : '/set/set_all/';
// //const defRoute = isDev ? '/mbox/tiriTiri/' : '/set/set_all/';
//
// const linksToPage = [
//     { href: '/mbox/setBand', name: 'Список' },
//     { href: '/mbox/setBandDraft', name: 'Черновики' },
//     { href: '/mbox/setMy', name: 'Мои вещи' },
//     { href: '/page/page_keyboard', name: 'keyboard', isDev: false },
//     { href: '/page/page_roll', name: 'roll', isDev: true },
//     { href: '/page/page_sample_editor', name: 'sampleEditor', isDev: true },
//     { href: '/page/page_muse_editor', name: 'museEditor', isDev: true },
//     { href: '/page/userSettings', name: 'Settings', isDev: false},
//     { href: '/page/theremin', name: 'Theremin', isDev: false},
// ];
//
// //appEl.innerHTML = `<a href="/user/xxx/save?foo=bar#anchor-here" data-navigo>click me</a>`;
//
// let linksHtml = '';
//
// linksToPage.forEach(item => {
//     linksHtml += `<a href="${item.href}" data-navigo>${item.name}</a><br/>`;
// });
//
// pageEl.innerHTML = linksHtml;
//
// appRouter.updatePageLinks();
//
// // router.on("/user/:id/:action", function (match) {
// //     console.log('match', match);
// //
// //     document.getElementById("app").innerHTML = `<pre>${JSON.stringify(
// //         match,
// //         null,
// //         2
// //     )}</pre>`;
// // });
//
// // router.on("/user/:id/:action", function (match) {
// //     console.log('match', match);
// //
// //     document.getElementById("app").innerHTML = `<pre>${JSON.stringify(
// //         match,
// //         null,
// //         2
// //     )}</pre>`;
// // });
//
// appRouter.on('/mbox/:song', function (match: RouteInfo) {
//     console.log('match mbox', match);
//
//     if (lastRouteComponent && lastRouteComponent['onUnmounted']) {
//         pageEl.innerHTML = '';
//         lastRouteComponent.onUnmounted();
//     }
//
//     lastRouteComponent = new MBoxPage(match as any);
//
//     if (lastRouteComponent && lastRouteComponent['onMounted']) {
//         lastRouteComponent.onMounted();
//     }
// });
//
// appRouter.on('/page/:id', function (match) {
//     console.log('match page', match);
//
//     // document.getElementById("app").innerHTML = `<pre>${JSON.stringify(
//     //     match,
//     //     null,
//     //     2
//     // )}</pre>`;
// });
//
// appRouter.on('/', function (match) {
//     console.log('root', match);
//     appRouter.navigate('/mbox/setBand');
// });
//
//
// // import Framework7 from 'framework7/bundle';
// // import { pageRc } from './page-rc';
// //
// // const appEl = document.getElementById('app');
// //
// // // const isDev =
// // //     /devitband/.test(window.location.href) ||
// // //     /local/.test(window.location.href);
// //
// // const isDev = /localhost/.test(window.location.href);
// //
// // // const defRoute = '/set/set_E/';
// // // const defRoute = '/set/set_Battle/';
// // // const defRoute = '/set/set_ItsMyLife/';
// //
// // const defRoute = '/mbox/setBand/';
// // //const defRoute = !isDev ? '/page/page_keyboard/' : '/page/page_keyboard/';
// // //const defRoute = isDev ? '/page/page_sample_editor/' : '/set/set_all/';
// // //const defRoute = isDev ? '/mbox/tiriTiri/' : '/set/set_all/';
// //
// // const linksToPage = [
// //     { href: '/mbox/setBand/', name: 'Список' },
// //     { href: '/mbox/setBandDraft/', name: 'Черновики' },
// //     { href: '/mbox/setMy/', name: 'Мои вещи' },
// //     { href: '/page/page_keyboard/', name: 'keyboard', isDev: false },
// //     { href: '/page/page_roll/', name: 'roll', isDev: true },
// //     { href: '/page/page_sample_editor/', name: 'sampleEditor', isDev: true },
// //     { href: '/page/page_muse_editor/', name: 'museEditor', isDev: true },
// //     { href: '/page/userSettings/', name: 'Settings', isDev: false},
// //     { href: '/page/theremin/', name: 'Theremin', isDev: false},
// // ];
// //
// // const linksHtml = linksToPage
// //     .map((item) => {
// //         if (!isDev && item['isDev']) {
// //             return '';
// //         }
// //
// //         return `<a href="${item.href}" data-view=".view-main" class="panel-close">${item.name}</a>`;
// //     })
// //     .join('');
// //
// //
// // const leftPanel = `
// // <div
// //   class="panel panel-left panel-cover panel-init theme-dark"
// //   data-visible-breakpoint="2000"
// // >
// //   <div class="view view-init" data-view="left">
// //     <div class="page">
// //       <div class="navbar">
// //         <div class="navbar-bg"></div>
// //         <div class="navbar-inner sliding">
// //           <div class="title" data-app-left-panel-title></div>
// //         </div>
// //       </div><!-- navbar -->
// //
// //       <div class="page-content">
// //         <div class="list links-list" style="margin-top: 0;">
// //           <ul>
// //             <li>${linksHtml}</li>
// //           </ul>
// //         </div>
// //       </div><!-- page-content -->
// //     </div><!-- page -->
// //   </div>
// // </div>
// // `;
// //
// // let navbar = `
// // <div data-app-header-container style="border-bottom: 2px solid gray;">
// //     <div data-app-header-first-row-area
// //         style="
// //             display: flex;
// //             justify-content: space-between;
// //             align-items: center;
// //             user-select: none;
// //             border-bottom: 1px solid gray;
// //             height: 2rem;
// //         "
// //     >
// //         <div data-app-header-left-area style="padding-left: 1rem;">
// //             <a class="panel-open"
// //                 data-panel=".panel-left"
// //                 style="user-select: none; touch-action: none;"
// //             ><b>MAIN</b></a>
// //         </div>
// //             <div data-app-header-center-area style=""></div>
// //           <div data-app-header-right-area style="padding-right: 1rem;"></div>
// //     </div>
// //     <div data-app-header-second-row-area></div>
// // </div>
// // `;
// //
// // const appTpl = `
// //   ${leftPanel}
// //   ${navbar}
// //   <!-- Your main view, should have "view-main" class -->
// //   <div class="view view-main view-init safe-areas" data-url="${defRoute}" id="app-view-main"></div>
// // `;
// //
// // appEl.innerHTML = appTpl;
// // // appEl.innerHTML = panels;
// //
// // const app = new Framework7({
// //     el: '#app',
// //     name: 'ITBand',
// //     panel: {
// //         // swipe: true,
// //     },
// //     routes: [
// //         // {
// //         //   path: '/set/:id',
// //         //   component: mboxOldRc,
// //         // },
// //         {
// //             path: '/page/:id',
// //             component: pageRc,
// //         },
// //         {
// //             path: '/:id/:song',
// //             component: pageRc,
// //         },
// //     ],
// //     on: {
// //         // init: function () {
// //         //console.log('App initialized', arguments.length, this);
// //         // },
// //         // pageInit: function () {
// //         //console.log('Page initialized', arguments.length, arguments[0]);
// //         // },
// //         // pageMounted: function () {
// //         //console.log('Page mounted', arguments.length);
// //         // }
// //     },
// // });
// //
// // // app.views.main.router.navigate('/set/peterGunn/', {
// // //   props: {
// // //     foo: 'bar',
// // //   },
// // // });
// //
// // //console.log('APP', app);
// //
// // // var panel = app.panel.create({
// // //   el: '.panel-left',
// // //   // on: {
// // //   //   opened: function () {
// // //          //console.log('Panel opened')
// // //   //   }
// // //   // }
// // // });
// //
// //
// // // 0 1 2 3 4 5 6 7 8 9 10 11 12
// // // х с л щ ? ж ш з в ф ?  ?  й
// // //                     д  ц
// // // .гд..к.мнпр.т..цч..
//
//
// // <div data-app-header-container style="border-bottom: 2px solid gray;">
// //     <div data-app-header-first-row-area
// //         style="
// //             display: flex;
// //             justify-content: space-between;
// //             align-items: center;
// //             user-select: none;
// //             border-bottom: 1px solid gray;
// //             height: 2rem;
// //         "
// //     >
// //         <div data-app-header-left-area style="padding-left: 1rem;">
// //             <a class="panel-open"
// //                 data-panel=".panel-left"
// //                 style="user-select: none; touch-action: none;"
// //             ><b>MAIN</b></a>
// //         </div>
// //             <div data-app-header-center-area style=""></div>
// //           <div data-app-header-right-area style="padding-right: 1rem;"></div>
// //     </div>
// //     <div data-name="app-header-second-row-area" data-app-header-second-row-area></div>
// // </div>
