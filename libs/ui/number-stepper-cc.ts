import { CustomElement } from '../common/custom-element';
import {getWithDataAttr} from '../../src/utils';
import {parseInteger, isPresent} from '../common';

export class NumberStepperCc extends CustomElement {
    //private _shadowRoot: ShadowRoot;
    value = 90;
    minValue = 0;
    maxValue = 1_000;
    rendered = false;

    render() {
        const fontSize = 'font-size: 1.2rem;'
        const btnStl = `display: inline-block; padding: 0; margin: 0; width: min-content; border: 1px solid gray; font-size: 1rem; ${fontSize} user-select: none;`;

        this.innerHTML = `
             <div>
                <button data-button="minus-ten" style="${btnStl}">&nbsp;&laquo;&nbsp;</button>
                <button data-button="minus-one" style="${btnStl}">&nbsp;&lsaquo;&nbsp;</button>
                <span   data-value="value" style="${fontSize} user-select: none;">${this.value}</span>
                <button data-button="plus-one" style="${btnStl}">&nbsp;&rsaquo;&nbsp;</button>
                <button data-button="plus-ten" style="${btnStl}">&nbsp;&raquo;&nbsp;</button>                     
            </div>`.trim();
    }

    subscribe() {
        getWithDataAttr('button', this).forEach(el => {
            el.addEventListener('pointerup', (evt: MouseEvent) => {
                let diff = 0;
                const name = el.dataset['button'];

                if (name === 'minus-ten') {
                    diff = -10;
                } else if (name === 'minus-one') {
                    diff = -1;
                } else if (name === 'plus-ten') {
                    diff = 10;
                } else if (name === 'plus-one') {
                    diff = 1;
                }

                if (diff) {
                    this.setValue(this.value + diff);
                }
            });
        });
    }

    dispatchValueChanged() {
        this.dispatchEvent(new CustomEvent("valuechanged", {detail: { value: this.value }}));
    }

     constructor() {
         super();
     }

    public static get tag(): string {
        return 'number-stepper-cc';
    }

    public static get observedAttributes(): string[] {
        return ['value', 'min', 'max'];
    }

    public connectedCallback(): void {
        if (!this.rendered) {
            this.render();
            this.subscribe();
            this.rendered = true;
        }
    }

    public disconnectedCallback(): void {
        //console.log(InputCC.tag, 'disconnectedCallback');
    }


    private setValue(newValue: number | string) {
        console.log('setValue', newValue);

        if (isPresent(newValue)) {
            const oldValue = this.value;
            let value = parseInteger(newValue, this.value);

            value = value >= this.minValue ? value: this.minValue;
            value = value <= this.maxValue ? value: this.maxValue;

            this.value = value;

            if (oldValue !== this.value) {
                this.setValueText();
                this.dispatchValueChanged();
            }
        }
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        //console.log('attributeChangedCallback', name, newValue, oldValue);

        if (name === 'value') {
            this.setValue(newValue);
        } else if (name === 'min') {
            const minValue = parseInteger(newValue, this.minValue);
            this.minValue = minValue;
            this.setValue(this.value);
        } else if (name === 'max') {
            const maxValue = parseInteger(newValue, this.maxValue);
            this.maxValue = maxValue;
            this.setValue(this.value);
        }
    }

    setValueText() {
        getWithDataAttr('value', this).forEach(el => {
            el.innerHTML = this.value.toString();
        });
    }
}

if (customElements.get(NumberStepperCc.tag) == null) {
    customElements.define(NumberStepperCc.tag, NumberStepperCc);
}
