import { RouteInfo } from '../src/router';

type WithId = {id: string}

export class EmptyPage {
    get pageId(): string {
        return this.props.data.id;
    }

    get pageEl(): HTMLElement {
        return document.getElementById('app-route');
    }

    constructor(
        public props: RouteInfo<WithId>,
    ) {}

    onMounted() {
        this.setContent();
    }

    onUnmounted() {

    }

    setContent() {
        this.pageEl.innerHTML = `
            <div style="">EmptyPage</div>    
        `;
    }
}
