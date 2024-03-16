import { EventEmitter } from '../libs/common/event-emitter';
import { getWithDataAttr } from './utils';

export type RouteInfo<T> = {
    data: T
}

class Router extends EventEmitter {

    navigate(path: string) {
        console.log('Router.navigate', path);

        if (!path) return;

        const arr = path.split('/').filter(val => !!val);

        if (!arr.length) {
            arr[0] = '/';
        }

        console.log('Router.navigate', arr);

        this.emit(arr[0], arr[1]);
    }

    updatePageLinks() {
        const links = getWithDataAttr('route');
        const that = this;

        links.forEach(link => {
            if (!(link as any).hasListenerAttached) {
                (link as any).hasListenerAttached = true;
            }

            link.addEventListener('click', (e: PointerEvent) => {
                e.preventDefault();
                e.stopPropagation();
            });

            link.addEventListener('pointerup', (e: PointerEvent) => {
                e.preventDefault();
                e.stopPropagation();

                const href = (link.getAttribute('href') || '').trim();

                if (!href) return;

                that.navigate(href);
            });
        });
    }
}

export const appRouter = new Router();
