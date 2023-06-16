import {ComponentContainer as GlComponentContainer} from '../../libs/gl/ts/container/component-container';
import {ResolvedComponentItemConfig} from '../../libs/gl/ts/config/resolved-config';

export class EmptyGlComponent {
    private glContainer: GlComponentContainer;

    constructor(glContainer: GlComponentContainer, itemConfig?: ResolvedComponentItemConfig) {
        this.glContainer = glContainer;

        const el = document.createElement('div');
        el.innerHTML = 'empty';
        el.style.backgroundColor = '#fff';
        this.glContainer.element.appendChild(el);
    }
}
