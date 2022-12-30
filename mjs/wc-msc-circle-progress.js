import { _wcl } from './common-lib.js';
import { _wccss } from './common-css.js';

/*
  reference:
  - https://css-tricks.com/cutting-inner-part-element-using-clip-path/
  - https://www.oxxostudio.tw/articles/201406/svg-05-path-2.html
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
  - https://www.joshmorony.com/create-a-circle-progress-web-component-with-conic-gradients-in-stencil-js/
 */

const defaults = {
  size: 20, // pixel
  value: 0,
  max: 100,
  round: false
};

const booleanAttrs = ['round'];
const objectAttrs = [];

const template = document.createElement('template');
template.innerHTML = `
<style>
${_wccss}

:host{inline-size:100%;aspect-ratio:1/1;display:block;pointer-events:none;user-select:none;-webkit-user-select:none;}

.main {
  --font-size: var(--msc-circle-progress-font-size, 16px);
  --font-color: var(--msc-circle-progress-font-color, #232a31);
  --progress-color: var(--msc-circle-progress-color, #0f69ff);
  --progress-placeholder-color: var(--msc-circle-progress-placeholder-color, transparent);

  --value: 0;
  --percentage-occupy: calc(var(--value) * 1%);
  --percentage-less: calc(100% - var(--percentage-occupy));

  --background: conic-gradient(var(--progress-color) var(--percentage-occupy), 0, var(--progress-placeholder-color) var(--percentage-less));

  --mask: path('M0 0Z');
  --size: ${defaults.size}px;
  --origin-y: 0px;
  --angle: calc(((var(--value) * 360) / 100) * 1deg);
}

.main{position:relative;inline-size:100%;aspect-ratio:1/1;}
.main__circle{position:absolute;inset-inline-start:0;inset-block-start:0;inline-size:100%;block-size:100%;display:block;background:var(--background);clip-path:var(--mask);pointer-events:none;}
.main__value{position:relative;font-size:var(--font-size);color:var(--font-color);z-index:1;}

.main__circle::before,.main__circle::after{position:absolute;inset-block-start:0;inset-inline:0;margin:auto;content:'';inline-size:var(--size);block-size:var(--size);border-radius:var(--size);background-color:var(--progress-color);display:none;}
.main__circle::before{transform-origin:50% var(--origin-y);transform:rotate(var(--angle));clip-path:polygon(50% 0,50% 100%,100% 100%,100% 0);}
.main__circle::after{clip-path:polygon(0 0,0 100%,50% 100%,50% 0);}

.main--rounded .main__circle::before,.main--rounded .main__circle::after{display:revert;}
.main--basis{}
.main--mutation{}
</style>

<div class="main main--basis main--mutation flex-center">
  <em class="main__circle"></em>
  <span class="main__value" part="value"></span>
</div>
`;

// Houdini Props and Vals
if (CSS?.registerProperty) {
  try {
    CSS.registerProperty({
      name: '--msc-circle-progress-font-size',
      syntax: '<length>',
      inherits: true,
      initialValue: '16px'
    });

    CSS.registerProperty({
      name: '--msc-circle-progress-font-color',
      syntax: '<color>',
      inherits: true,
      initialValue: '#232a31'
    });


    CSS.registerProperty({
      name: '--msc-circle-progress-color',
      syntax: '<color>',
      inherits: true,
      initialValue: '#0f69ff'
    });

    CSS.registerProperty({
      name: '--msc-circle-progress-placeholder-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'transparent'
    });
  } catch (err) {
    console.warn(`msc-circle-progress: ${err.message}`);
  }
}

export class MscCircleProgress extends HTMLElement {
  #data;
  #nodes;
  #config;

  constructor(config) {
    super();

    // template
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // data
    this.#data = {
      controller: ''
    };

    // nodes
    this.#nodes = {
      styleSheet: this.shadowRoot.querySelector('style'),
      main: this.shadowRoot.querySelector('.main'),
      span: this.shadowRoot.querySelector('.main__value')
    };

    // config
    this.#config = {
      ...defaults,
      ...config // new MscCircleProgress(config)
    };

    // evts
    this._onRefresh = this._onRefresh.bind(this);
  }

  async connectedCallback() {
   const { config, error } = await _wcl.getWCConfig(this);

    if (error) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${error}`);
      this.remove();
      return;
    } else {
      this.#config = {
        ...this.#config,
        ...config
      };
    }

    // upgradeProperty
    Object.keys(defaults).forEach((key) => this.#upgradeProperty(key));

    // evts
    this.#data.controller = new AbortController();
    const signal = this.#data.controller.signal;
    window.addEventListener('resize', this._onRefresh, { signal });

    this.#onValue();
    this._onRefresh();
  }

  disconnectedCallback() {
    if (this.#data?.controller) {
      this.#data.controller.abort();
    }
  }

  #format(attrName, oldValue, newValue) {
    const hasValue = newValue !== null;

    if (!hasValue) {
      if (booleanAttrs.includes(attrName)) {
        this.#config[attrName] = false;
      } else {
        this.#config[attrName] = defaults[attrName];
      }
    } else {
      switch (attrName) {
        case 'round':
          this.#config[attrName] = true;
          break;

        case 'size': {
          const num = +newValue;
          this.#config[attrName] = (isNaN(num) || num <= 0) ? defaults.size : num;
          break;
        }

        case 'max': {
          const num = +newValue;
          this.#config[attrName] = (isNaN(num) || num <= 0) ? defaults.max : num;
          break;
        }

        case 'value': {
          let num = +newValue;

          if (isNaN(num) || num < 0) {
            num = defaults.value;
          } else if (num > this.max) {
            num = this.max;
          }

          this.#config[attrName] = num;
          break;
        }
      }
    }
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (!MscCircleProgress.observedAttributes.includes(attrName)) {
      return;
    }

    this.#format(attrName, oldValue, newValue);

    switch (attrName) {
      case 'round':
        this.#nodes.main.classList.toggle('main--rounded', this.round);
        break;

      case 'size':
        this._onRefresh();
        break;

      case 'max':
      case 'value':
        this.#onValue();
        break;
    }
  }

  static get observedAttributes() {
    return Object.keys(defaults); // MscCircleProgress.observedAttributes
  }

  #upgradeProperty(prop) {
    let value;

    if (MscCircleProgress.observedAttributes.includes(prop)) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        value = this[prop];
        delete this[prop];
      } else {
        if (booleanAttrs.includes(prop)) {
          value = (this.hasAttribute(prop) || this.#config[prop]) ? true : false;
        } else if (objectAttrs.includes(prop)) {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : JSON.stringify(this.#config[prop]);
        } else {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : this.#config[prop];
        }
      }

      this[prop] = value;
    }
  }

  set value(value) {
    if (value) {
      this.setAttribute('value', value);
    } else {
      this.removeAttribute('value');
    }
  }

  get value() {
    return this.#config.value;
  }

  set round(value) {
    this.toggleAttribute('round', Boolean(value));
  }

  get round() {
    return this.#config.round;
  }

  set size(value) {
    if (value) {
      this.setAttribute('size', value);
    } else {
      this.removeAttribute('size');
    }
  }

  get size() {
    return this.#config.size;
  }

  set max(value) {
    if (value) {
      this.setAttribute('max', value);
    } else {
      this.removeAttribute('max');
    }
  }

  get max() {
    return this.#config.max;
  }

  #onValue() {
    const value = (this.value / this.max) * 100;

    this.#nodes.span.textContent = parseFloat(value.toFixed(1));

    _wcl.addStylesheetRules(
      '.main--basis',
      {
        '--value': value
      },
      this.#nodes.styleSheet
    );
  }

  _onRefresh() {
    const { width:cW, height:cH } = _wcl.getSize(this.#nodes.main);
    const r1 = cW / 2;
    const r2 = (cW - this.size * 2) / 2;
    const pointes = [
      {
        x: cW,
        y: cH / 2
      },
      {
        x: 0,
        y: cH / 2
      },
      {
        x: cW - this.size,
        y: cH / 2
      },
      {
        x: this.size,
        y: cH / 2
      }
    ];

    _wcl.addStylesheetRules(
      '.main--mutation',
      {
        '--mask': `path('M${pointes[0].x} ${pointes[0].y} A${r1} ${r1} 0 0 0 ${pointes[1].x} ${pointes[1].y} A${r1} ${r1} 0 0 0 ${pointes[0].x} ${pointes[0].y} L${pointes[2].x} ${pointes[2].y} A${r2} ${r2} 0 0 1 ${pointes[3].x} ${pointes[3].y} A${r2} ${r2} 0 0 1 ${pointes[2].x} ${pointes[2].y}Z')`,
        '--size': `${this.size}px`,
        '--origin-y': `${r1}px`
      },
      this.#nodes.styleSheet
    );
  }

  refresh() {
    this._onRefresh();
  }
}

// define web component
const S = _wcl.supports();
const T = _wcl.classToTagName('MscCircleProgress');
if (S.customElements && S.shadowDOM && S.template && !window.customElements.get(T)) {
  window.customElements.define(_wcl.classToTagName('MscCircleProgress'), MscCircleProgress);
}