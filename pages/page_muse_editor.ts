import { GoldenLayout } from '../libs/gl/ts/golden-layout';
import { LayoutConfig } from '../libs/gl/ts/config/config';
import { ComponentContainer } from '../libs/gl/ts/container/component-container';
import { ResolvedComponentItemConfig } from '../libs/gl/ts/config/resolved-config';
import {FSFileInfo} from '../libs/common/file-service';
import { ContentItem } from '../libs/gl/ts/items/content-item';
import {LayoutManager} from '../libs/gl/ts/layout-manager';
import { Stack } from 'libs/gl/ts/items/stack';

import { ideService, ideEvents } from './ide/ide-service';
import { EmptyGlComponent } from './ide/empty-gl.component';
import { FileTreeGlComponent } from './ide/file-tree-gl.component';
import { TextEditorGlComponent } from './ide/text-editor-gl.component';
import { FontViewerGlComponent } from './ide/font-viewer-gl.component';
import { RouteInfo } from '../src/router';

type WithId = {id: string}

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
    fontViewer = 'fontViewer'
}

const COMPONENT = 'component';
let guid = 1;

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
    //console.log('glBindComponentEventListener', itemConfig);

    const state = itemConfig.componentState as any;
    state.guid = guid++;

    if (state.componentType === ComponentType.textEditor) {
        return {
            component: new TextEditorGlComponent(container, itemConfig),
            virtual: false, // true
        };
    }

    if (state.componentType === ComponentType.fileTree) {
        return {
            component: new FileTreeGlComponent(container, itemConfig),
            virtual: false, // true
        };
    }

    if (state.componentType === ComponentType.fontViewer) {
        return {
            component: new FontViewerGlComponent(container, itemConfig),
            virtual: false, // true
        };
    }

    return {
        component: new EmptyGlComponent(container, itemConfig),
        virtual: false, // true
    };
}

function glUnbindComponentEventListener(container: ComponentContainer) {
    //console.log('glUnbindComponentEventListener', container);

    //this.handleUnbindComponentEvent(container);
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
    fileTree: {
        title: 'fileTree',
        componentType: ComponentType.fileTree
    },
    fontViewer: {
        title: 'fontViewer',
        componentType: ComponentType.fontViewer
    },
}

export class MuseEditorPage {
    glLayout: GoldenLayout;
    glContainer: HTMLElement;
    menuContainer: HTMLElement;

    get pageId(): string {
        return this.props.data.id;
    }

    get pageEl(): HTMLElement {
        return document.getElementById('app-route');
    }

    constructor(public props: RouteInfo<WithId>) {}

    onMounted() {
        //console.log('PageMuseEditor.onMounted');
        this.addTopContainers();
        this.setGl();
        this.setTopMenu();
        this.subscribeEvents();

        // this.glLayout.on('itemDestroyed', function() {
        //     console.log('itemDestroyed', arguments);
        // });
        // this.glLayout.on('activeContentItemChanged', function() {
        //     console.log('activeContentItemChanged', arguments);
        // });
        // this.glLayout.on('beforeItemDestroyed', function() {
        //     console.log('beforeItemDestroyed', arguments);
        // });
        // this.glLayout.on('focus', function() {
        //     console.log('focus', arguments);
        // });
    }

    onUnmounted() {
        //console.log('PageMuseEditor.onUnmounted');
        this.unsubscribeEvents();
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
        });

    }

    setGlContainerSize = () => {
        const viewport = getViewport();
        const glRect = this.glContainer.getBoundingClientRect();

        this.glContainer.style.width = (viewport.width - 16) + 'px';
        this.glContainer.style.height = (viewport.height - glRect.y - 16) + 'px';
        this.glLayout.updateSizeFromContainer();
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
        setTimeout(() => this.setGlContainerSize(), 100);
    }

    addTopContainers() {
        this.pageEl.innerHTML = `
            <div style="height: 32px; margin: 2px;" id="${ids.menuContainer}"></div>
            <div id="${ids.glContainer}" style="width: 99%; height: calc(90% - 32px);"></div>
        `.trim();
    }

    getId(id: string): string {
        return this.pageId + '-' + id;
    }

    subscribeEvents() {
        window.addEventListener('resize', this.setGlContainerSize);

        ideService.on(ideEvents.openFile, this, (fileInfo: FSFileInfo)=> {
            //console.log('pageMuseEditor.onOpenFile', fileInfo);
            //console.log(this.glLayout.rootItem.contentItems);

            const fileTree = this.glLayout.findFirstComponentItemById(ComponentType.fileTree);
            let parentItem: ContentItem = null;

            if (fileTree) {
                parentItem = fileTree.parentItem;
            }

            for (let item of this.glLayout.rootItem.contentItems) {
                if (item !== parentItem ) {
                    parentItem = item;
                    break;
                }
            }

            (parentItem as Stack).addItem({
                type: 'component',
                componentType: ComponentType.textEditor,
                componentState: {
                    fileInfo,
                    componentType: ComponentType.textEditor,
                    title: fileInfo.name,
                },
                title: fileInfo.name,
            }, 0);


            // this.glLayout.newComponentAtLocation(ComponentType.textEditor, {
            //     fileInfo,
            //     componentType: ComponentType.textEditor,
            //     title: fileInfo.name,
            // }, fileInfo.name, [{
            //   typeId: LayoutManager.LocationSelector.TypeId.Root,
            //   index: 1,
            // }]);

            // this.glLayout.addComponent(ComponentType.textEditor, {
            //     fileInfo,
            //     componentType: ComponentType.textEditor,
            //     title: fileInfo.name,
            // }, fileInfo.name)
        });
    }

    unsubscribeEvents() {
        window.removeEventListener('resize', this.setGlContainerSize);
        ideService.off(ideEvents.openFile, this);
    }
}

