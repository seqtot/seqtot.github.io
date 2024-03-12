import Framework7 from 'framework7/bundle';
import { pageRc } from './page-rc';
import '../libs/ui/number-stepper-cc';

const appEl = document.getElementById('app');

// const isDev =
//     /devitband/.test(window.location.href) ||
//     /local/.test(window.location.href);

const isDev = /localhost/.test(window.location.href);

// const defRoute = '/set/set_E/';
// const defRoute = '/set/set_Battle/';
// const defRoute = '/set/set_ItsMyLife/';

const defRoute = '/mbox/setBand/';
//const defRoute = !isDev ? '/page/page_keyboard/' : '/page/page_keyboard/';
//const defRoute = isDev ? '/page/page_sample_editor/' : '/set/set_all/';
//const defRoute = isDev ? '/mbox/tiriTiri/' : '/set/set_all/';

const linksToPage = [
    { href: '/mbox/setBand/', name: 'Список' },
    { href: '/mbox/setBandDraft/', name: 'Черновики' },
    { href: '/mbox/setMy/', name: 'Мои вещи' },
    { href: '/page/page_keyboard/', name: 'keyboard', isDev: false },
    { href: '/page/page_roll/', name: 'roll', isDev: true },
    { href: '/page/page_sample_editor/', name: 'sampleEditor', isDev: true },
    { href: '/page/page_muse_editor/', name: 'museEditor', isDev: true },
    { href: '/page/userSettings/', name: 'Settings', isDev: false},
    { href: '/page/theremin/', name: 'Theremin', isDev: false},
];

const linksHtml = linksToPage
    .map((item) => {
        if (!isDev && item['isDev']) {
            return '';
        }

        return `<a href="${item.href}" data-view=".view-main" class="panel-close">${item.name}</a>`;
    })
    .join('');


const leftPanel = `
<div
  class="panel panel-left panel-cover panel-init theme-dark"
  data-visible-breakpoint="2000"  
>
  <div class="view view-init" data-view="left">
    <div class="page">
      <div class="navbar">
        <div class="navbar-bg"></div>
        <div class="navbar-inner sliding">
          <div class="title" data-app-left-panel-title></div>
        </div>
      </div><!-- navbar -->

      <div class="page-content">  
        <div class="list links-list" style="margin-top: 0;">
          <ul>
            <li>${linksHtml}</li>
          </ul>
        </div>      
      </div><!-- page-content -->
    </div><!-- page -->
  </div>
</div>
`;

let navbar = `
<div data-app-header-container style="border-bottom: 2px solid gray;">
    <div data-app-header-first-row-area
        style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            border-bottom: 1px solid gray;
            height: 2rem;
        "
    >
        <div data-app-left-header-area style="padding-left: 1rem;">
            <a class="panel-open"
                data-panel=".panel-left"
                style="user-select: none; touch-action: none;"
            ><b>MAIN</b></a>    
        </div>
            <div data-app-center-header-area style=""></div>  
          <div data-app-right-header-area style="padding-right: 1rem;"></div>
    </div>  
    <div data-name="app-header-second-row-area" data-app-header-second-row-area></div>  
</div>
`;

const appTpl = `
  ${leftPanel}
  ${navbar}
  <!-- Your main view, should have "view-main" class -->
  <div class="view view-main view-init safe-areas" data-url="${defRoute}" id="app-view-main"></div>
`;

appEl.innerHTML = appTpl;
// appEl.innerHTML = panels;

const app = new Framework7({
    el: '#app',
    name: 'ITBand',
    panel: {
        // swipe: true,
    },
    routes: [
        // {
        //   path: '/set/:id',
        //   component: mboxOldRc,
        // },
        {
            path: '/page/:id',
            component: pageRc,
        },
        {
            path: '/:id/:song',
            component: pageRc,
        },
    ],
    on: {
        // init: function () {
        //console.log('App initialized', arguments.length, this);
        // },
        // pageInit: function () {
        //console.log('Page initialized', arguments.length, arguments[0]);
        // },
        // pageMounted: function () {
        //console.log('Page mounted', arguments.length);
        // }
    },
});

// app.views.main.router.navigate('/set/peterGunn/', {
//   props: {
//     foo: 'bar',
//   },
// });

//console.log('APP', app);

// var panel = app.panel.create({
//   el: '.panel-left',
//   // on: {
//   //   opened: function () {
//          //console.log('Panel opened')
//   //   }
//   // }
// });


// 0 1 2 3 4 5 6 7 8 9 10 11 12
// х с л щ ? ж ш з в ф ?  ?  й
//                     д  ц
// .гд..к.мнпр.т..цч..
