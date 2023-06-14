import {ComponentContext} from 'framework7/modules/component/component';
import {Props} from 'framework7/modules/component/snabbdom/modules/props';
import { MBoxPage } from '../pages/page_mbox';
import mboxes from '../mboxes';

// https://framework7.io/docs/init-app.html
// https://framework7.io/docs/kitchen-sink.html
// https://framework7.io/docs/router-component
export const mboxRc = (props: Props, context: ComponentContext) => {
  if (!mboxes[props.id]) {
    return () => context.$h`<div class="page">MBOX NOT FOUND</div>`;
  }

  let vc: any = new MBoxPage(props, context);

  // Called right before component will be added to DOM
  context['$onBeforeMount'](() => vc.onBeforeMount && vc.onBeforeMount());
  // Called right after component was be added to DOM
  context['$onMounted'](() => vc.onMounted && vc.onMounted());

  // Called right after component before VDOM will be patched/updated
  context['$onBeforeUpdate'](() => vc.onBeforeUpdate && vc.onBeforeUpdate());
  // Called right after component VDOM has been patched/updated
  context['$onUpdated'](() => vc.onUpdated && vc.onUpdated());

  // Called right before component will be unmounted (detached from the DOM)
  context['$onBeforeUnmount'](() => vc.onBeforeUnmount && vc.onBeforeUnmount());
  // Called when component unmounted and destroyed
  context['$onUnmounted'](() => vc.onUnmounted && vc.onUnmounted());

  return () => context.$h`<div class="page"></div>`;
};
