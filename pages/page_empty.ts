import { Props } from 'framework7/modules/component/snabbdom/modules/props';
import { ComponentContext } from 'framework7/modules/component/component';
import { Dom7Array } from 'dom7';

export class EmptyPage {
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
    }

    onUnmounted() {

    }

    setContent() {
        this.el$.html(`
            <div style="">empty</div>    
        `);
    }
}
