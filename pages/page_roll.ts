import { Match as RouteInfo } from '../libs/navigo/types';

type WithId = {id: string}

// ROLL EDITOR
import { NoteSequencer } from '../roll/a-sequencer-wc';

if (customElements.get(NoteSequencer.tag) == null) {
  customElements.define(NoteSequencer.tag, NoteSequencer);
}

//
export class RollPage {
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

  setContent() {
    // <note-sequencer time-start="0" duration="4" theme="default"></note-sequencer>
    this.pageEl.innerHTML = `
      <div style="height: 90%; width: 99%;">
        <note-sequencer theme="default"></note-sequencer>    
      </div>    
    `.trim();
  }

  getId(id: string): string {
    return this.pageId + '-' + id;
  }
}
