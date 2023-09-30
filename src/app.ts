// https://framework7.io/docs/init-app.html
// https://framework7.io/docs/kitchen-sink.html

import Framework7 from 'framework7/bundle';

// import Framework7 from 'framework7';
// Import additional components
// import Range from 'framework7/components/range';
// import Panel from 'framework7/components/panel';
// Import components styles
// import 'framework7/components/range/css';
// import 'framework7/components/panel/css';
// Framework7.use([Range, Panel]);

import { pageRc } from './page-rc';

const appEl = document.getElementById('app');

const isDev =
    /devitband/.test(window.location.href) ||
    /local/.test(window.location.href);

// const defRoute = '/set/set_E/';
// const defRoute = '/set/set_Battle/';
// const defRoute = '/set/set_ItsMyLife/';

//const defRoute = isDev ? '/page/page_sample_editor/' : '/set/set_all/';
const defRoute = isDev ? '/page/page_keyboard/' : '/set/set_all/';
//const defRoute = isDev ? '/mbox/tiriTiri/' : '/set/set_all/';

const linksToPage = [
    { href: '/mbox/setBand/', name: 'Список' },
    { href: '/mbox/setMy/', name: 'Мои вещи' },
    { href: '/page/page_roll/', name: 'roll', isDev: true },
    { href: '/page/page_keyboard/', name: 'keyboard', isDev: false },
    { href: '/page/page_sample_editor/', name: 'sampleEditor', isDev: true },
    { href: '/page/page_muse_editor/', name: 'museEditor', isDev: true },
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

const rightPanel = `
<div
  class="panel panel-right panel-cover panel-init theme-dark"
>
  <div class="view view-init" data-view="right">
    <div class="page">
      <div class="navbar">
        <div class="navbar-bg"></div>
        <div class="navbar-inner sliding">
          <div data-app-right-panel-title class="title"></div>
        </div>
      </div><!-- navbar -->

      <div class="page-content">  
        <div class="block" data-name="panel-right-content">
        </div>

      </div><!-- page-content -->
    </div><!-- page -->
  </div>
</div>
`;

// старая навигационная панель
let navbar = `
<div class="navbar">
<div class="navbar-bg"></div>
<div class="navbar-inner">
  <div class="left">
    <a href="#" class="link icon-only panel-open" data-panel=".panel-left">
      <i class="icon f7-icons">menu</i>
    </a>
    <!--a href="#" class="link back">
      <i class="icon icon-back"></i>
      <span class="if-not-md">Back</span>
    </a-->
  </div>
  <div class="title sliding">Band-IT</div>
  <div class="right">
    <a href="#" class="link icon-only panel-open" data-panel="right">
      <i class="icon f7-icons">menu</i>
    </a>
  </div>
</div>
</div>
`;

navbar = `
<div app-header-container style="border-bottom: 2px solid gray;">
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
  ${rightPanel}
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
