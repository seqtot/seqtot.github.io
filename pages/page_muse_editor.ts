import { Props } from 'framework7/types/modules/component/snabbdom/modules/props';
import { ComponentContext } from 'framework7/modules/component/component';
import { Dom7Array } from 'dom7';

import { GoldenLayout } from '../libs/gl/ts/golden-layout';
import { LayoutConfig } from '../libs/gl/ts/config/config';
import { ComponentContainer } from '../libs/gl/ts/container/component-container';
import { ResolvedComponentItemConfig } from '../libs/gl/ts/config/resolved-config';

import { EmptyGlComponent } from './empty-gl.component';

function getViewport(): {width: number; height: number} {
    const win = window;
    const docEl = win.document.documentElement;
    const body = win.document.getElementsByTagName('body')[0];

    return {
        width: win.innerWidth || docEl.clientWidth || body.clientWidth,
        height: win.innerHeight || docEl.clientHeight || body.clientHeight,
    };
}

enum ComponentType {
    fileTree= 'fileTree',
    textEditor= 'textEditor',
}

const COMPONENT = 'component';

let config: LayoutConfig = {
    root: {
        type: 'row',
        content: [
            {
                type: COMPONENT,
                componentType: ComponentType.fileTree,
                title: 'fileTree',
                id: 'fileTree',
                componentState: {
                    title: 'fileTree',
                    componentType: ComponentType.fileTree,
                }
            },
            {
                type: COMPONENT,
                componentType: ComponentType.textEditor,
                title: 'settings',
                id: 'settings',
                componentState: {
                    title: 'settings',
                    file: 'settings',
                    field: 'short',
                    componentType: ComponentType.textEditor,
                }
            },
        ]
    }
};

function glBindComponentEventListener(
    container: ComponentContainer,
    itemConfig: ResolvedComponentItemConfig
): ComponentContainer.BindableComponent {
    console.log('glBindComponentEventListener', itemConfig);
    const state = itemConfig.componentState as any;

    if (state.componentType === ComponentType.textEditor) {
        return {
            component: new EmptyGlComponent(container, itemConfig), //new TextEditorComponent(container, itemConfig),
            virtual: false, // true
        };
    }

    if (state.componentType === ComponentType.fileTree) {
        return {
            component: new EmptyGlComponent(container, itemConfig), //new FileTreeComponent(container, itemConfig),
            virtual: false, // true
        };
    }

    return {
        component: new EmptyGlComponent(container, itemConfig),
        virtual: false, // true
    };
}

function glUnbindComponentEventListener(container: ComponentContainer) {
    console.log('glUnbindComponentEventListener');
    // this.handleUnbindComponentEvent(container);
}

const ids = {
    menuContainer: 'muse-editor-page-top-menu',
    glContainer: 'muse-editor-page-gl-container'
}

const topMenuLine = {
    settings: {
        title: 'settings',
        file: 'settings',
        field: 'short',
        componentType: ComponentType.textEditor
    },
    billie: {
        title: 'billie',
        file: 'billieJean',
        field: 'short',
        componentType: ComponentType.textEditor
    },
    amadeus: {
        title: 'amadeus',
        file: 'amadeus',
        field: 'short',
        componentType: ComponentType.textEditor
    },
    fileTree: {
        title: 'fileTree',
        componentType: ComponentType.fileTree
    }
}

export class MuseEditorPage {
    glLayout: GoldenLayout;
    glContainer: HTMLElement;
    menuContainer: HTMLElement;

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
        this.setGl();
        this.setTopMenu();
    }

    setTopMenu() {
        Object.keys(topMenuLine).forEach(key => {
            const item = topMenuLine[key];
            const el = document.createElement('span');

            el.innerText = key;
            this.menuContainer.appendChild(el);
            el.style.paddingRight = '4px';

            this.glLayout.newDragSource(
                el,
                item.componentType,
                {
                    file: item.file,
                    field: item.field,
                    componentType: item.componentType,
                },
                item.title
            );

            // glLayout.newDragSource(
            //     el,
            //     () => (<ComponentItemConfig>{
            //         type: COMPONENT,
            //         componentType: item.componentType,
            //         title: item.title,
            //         state: {
            //             file: item.file,
            //             field: item.short,
            //             componentType: item.componentType,
            //         },
            //     })
            // );
        });

    }

    setGl() {
        // http://golden-layout.com/tutorials/getting-started.html
        this.glContainer = document.getElementById(ids.glContainer);
        this.menuContainer = document.getElementById(ids.menuContainer);
        this.glLayout = new GoldenLayout(
            this.glContainer,
            glBindComponentEventListener,
            glUnbindComponentEventListener,
        );

        this.glLayout.loadLayout(config);

        function setGlContainerSize() {
            const viewport = getViewport();
            const glRect = this.glContainer.getBoundingClientRect();

            this.glContainer.style.width = (viewport.width - 16) + 'px';
            this.glContainer.style.height = (viewport.height - glRect.y - 16) + 'px';
            this.glLayout.updateSizeFromContainer();
        }

        // window.addEventListener('resize', () => {
        //     setGlContainerSize();
        // });

        // setTimeout(() => {
        //     setGlContainerSize();
        // }, 0);
    }

    setContent() {
        // <note-sequencer time-start="0" duration="4" theme="default"></note-sequencer>
        this.el$.html(`
            <div style="height: 32px; margin: 2px;" id="${ids.menuContainer}"></div>
            <div id="${ids.glContainer}" style="width: 99%; height: calc(90% - 32px);"></div>
    `);
    }

    getId(id: string): string {
        return this.pageId + '-' + id;
    }
}
