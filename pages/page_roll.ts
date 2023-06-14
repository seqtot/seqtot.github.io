import {Props} from 'framework7/modules/component/snabbdom/modules/props';
import {ComponentContext} from 'framework7/modules/component/component';
import {Dom7Array} from 'dom7';

// ROLL EDITOR
import { NoteSequencer } from '../roll/a-sequencer-wc';

if (customElements.get(NoteSequencer.tag) == null) {
  customElements.define(NoteSequencer.tag, NoteSequencer);
}

//
export class RollPage {
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

  setContent() {
    // <note-sequencer time-start="0" duration="4" theme="default"></note-sequencer>
    this.el$.html(`
      <div style="height: 90%; width: 99%;">
        <note-sequencer theme="default"></note-sequencer>    
      </div>    
    `);
  }

  getId(id: string): string {
    return this.pageId + '-' + id;
  }
}
