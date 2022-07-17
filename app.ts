// https://framework7.io/docs/init-app.html
// https://framework7.io/docs/kitchen-sink.html

//import Framework7 from 'framework7';
//import Framework7 from 'framework7/lite-bundle';

// Import core framework
// import Framework7 from 'framework7';
// Import framework with all components
import Framework7 from 'framework7/bundle';
import { setVc } from './set-vc';

// Import additional components
// import Searchbar from 'framework7/components/searchbar/';
// import Calendar from 'framework7/components/calendar/';
// import Popup from 'framework7/components/popup/';
// import Panel from 'framework7/components/panel/';
// Install F7 Components using .use() method on class:
// Framework7.use([Panel]);

const appEl = document.getElementById('app');

// const defRoute = '/set/set_E/';
// const defRoute = '/set/set_Battle/';
// const defRoute = '/set/set_ItsMyLife/';
const defRoute = '/set/set_blackNight/';

let linkToTest = `
<a
  href="/set/set_My/"
  data-view=".view-main"
  class="panel-close"
  >test</a>
`.trim();

if (!/devitband/.test(window.location.href)) {
  linkToTest = '';
}

const leftPanel = `
<div
  class="panel panel-left panel-cover panel-init theme-dark"
  data-visible-breakpoint="960"
>
  <div class="view view-init" data-view="left">
    <div class="page">
      <div class="navbar">
        <div class="navbar-bg"></div>
        <div class="navbar-inner sliding">
          <div class="title">Left Panel</div>
        </div>
      </div><!-- navbar -->

      <div class="page-content">  
        <div class="list links-list" style="margin-top: 0;">
          <ul>
            <li>
              <a
                href="/set/set_blackNight/"
                data-view=".view-main"
                class="panel-close"
              >Black Night</a>
              <a
                href="/set/set_E/"
                data-view=".view-main"
                class="panel-close"
              >set E</a>
              <a
                href="/set/set_Battle/"
                data-view=".view-main"
                class="panel-close"
              >Продолжается бой</a>
              <a
                href="/set/set_ItsMyLife/"
                data-view=".view-main"
                class="panel-close"
              >Its my life</a>              
              ${linkToTest}
            </li>
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
          <div class="title">Right Panel</div>
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

const appTpl = `
  ${leftPanel}
  ${rightPanel}

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
      <div class="title sliding">ай-ТИ бэнд</div>
      <div class="right">
        <a href="#" class="link icon-only panel-open" data-panel="right">
          <i class="icon f7-icons">menu</i>
        </a>
      </div>
    </div>
  </div>
  
<!-- Your main view, should have "view-main" class -->
<div class="view view-main view-init safe-areas" data-url="${defRoute}">

</div>
`;

appEl.innerHTML = appTpl;
// appEl.innerHTML = panels;

const app = new Framework7({
  el: '#app',
  name: 'ITBand',
  id: 'com.giv.itband',
  panel: {
    // swipe: true,
  },
  routes: [
    {
      path: '/set/:id',
      component: setVc,
    },
  ],
  on: {
    init: function () {
      //console.log('App initialized', arguments.length, this);
    },
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
