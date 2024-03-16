import './libs/cm/codemirror.css';
import './libs/cm-addons/cm_musa.less';
import './libs/gl/less/goldenlayout-base.less';
import './libs/gl/less/themes/goldenlayout-borderless-dark-theme.less';
import './src/style.css';

import './libs/ui/number-stepper-cc';

import { app } from './src/app2';

const appEl = document.getElementById('app');

appEl.innerHTML = `
    <!-- HEADER -->
    <div data-app-header-container style="border-bottom: 2px solid gray;">
        <div data-app-header-first-row-area
            style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                user-select: none;
                border-bottom: 1px solid gray;
                height: 2rem;"
        >
            <div data-app-header-left-area style="padding-left: 1rem;">
                <span
                    data-app-header-main-button
                    style="user-select: none;"
                ><b>MAIN</b></span>
            </div>
            <div data-app-header-center-area style=""></div>
            <div data-app-header-right-area style="padding-right: 1rem;"></div>
        </div>
        <div data-app-header-second-row-area></div>
    </div>

    <!-- ROUTE -->
    <div id="app-route"
        style="
            height: calc(100dvh - 2rem);
            position: relative;
            overflow: auto;"
    >
    </div>

    <!-- DIALOG -->
    <div data-app-dialog-host style="
        display: none;
        z-index: 10000;
        position: fixed;
        width: 100%;
        height: 100%;
        overflow: hidden;
        top: 0;">
    </div>
`;

app.init();
