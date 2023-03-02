import { _wcl } from './common-lib.js';
import { _wccss } from './common-css.js';
import Mustache from './mustache.js';
import './wc-msc-circle-progress.js';

/*
 reference:
 - https://css-tricks.com/html5-progress-element/
 - https://loading.io/css/
 - https://web.dev/at-property/
 - https://developer.mozilla.org/en-US/docs/Web/CSS/::part
 - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error
 */

const defaults = {
  fieldname: 'image',
  multiple: false,
  limitation: {
    size: 52428800,
    accept: '.jpg,.jpeg,.png,.gif,.webp,.avif',
    minwidth: 100,
    minheight: 100,
    maxcount: 10
  },
  placeholder: [],
  webservice: {
    url: '/',
    params: {},
    header: {},
    withCredentials: false,
    timeout: 30 * 1000 // ms
  }
};

const booleanAttrs = ['multiple'];
const objectAttrs = ['limitation', 'placeholder', 'webservice'];
const custumEvents = {
  pick: 'msc-image-uploader-pick',
  error: 'msc-image-uploader-error',
  remove: 'msc-image-uploader-remove',
  done: 'msc-image-uploader-upload-done'
};

const { down:evtDown, move:evtMove, up:evtUp } = _wcl.pursuer();
const legalKey = [
  'ArrowDown',
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'Escape'
];

const template = document.createElement('template');
template.innerHTML = `
<style>
${_wccss}

:host{position:relative;display:block;}
.main {
  --gap: var(--msc-image-uploader-gap, 12px);
  --column-count: var(--msc-image-uploader-column-count, 4);
  --main-padding: .25em;
  --decoy-opacity: var(--msc-image-uploader-dragging-opacity, .5);
  --border-radius: var(--msc-image-uploader-unit-border-radius, 8px);

  /* main */
  --main-dnd-bgc: var(--msc-image-uploader-main-drop-overlay-color, rgba(0 0 0/.7));
  --main-dnd-hint-text-color: var(--msc-image-uploader-main-drop-hint-text-color, rgba(255 255 255));
  --main-dnd-hint-text-size: var(--msc-image-uploader-main-drop-hint-text-size, 40px);
  --main-dnd-hint-text: var(--msc-image-uploader-main-drop-hint-text, 'DROP IMAGES HERE.');
  --main-dnd-display: var(--msc-image-uploader-main-drop-display, none);
  --main-focus-within-bgc: var(--msc-image-uploader-focus-within-bgc, rgba(255 255 255/.01));
  
  /* progress */
  --progress-size: clamp(1em, 14%, 1.8em);
  --bgc-progress: rgba(0 0 0/.15);
  --msc-circle-progress-font-size: 0px;
  --msc-circle-progress-color: rgba(255 255 255);
  --msc-circle-progress-placeholder-color: rgba(0 0 0/.5);
  --progress-scale-normal: .001;
  --progress-scale-active: 1;
  --progress-scale: var(--progress-scale-normal);

  /* button */
  --button-size: clamp(2em, 28%, 2.7em);
  --button-mask: path('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z');
  --button-scale-normal: .001;
  --button-scale-active: 1;
  --button-scale: var(--button-scale-normal);
  --button-pointer-events: none;

  /* label */
  --label-bgc: var(--msc-image-uploader-label-bgc, rgba(232 234 237/.04));
  --label-color: var(--msc-image-uploader-label-color, #606367);
  --label-mask: path('M9 42q-1.25 0-2.125-.875T6 39V9q0-1.25.875-2.125T9 6h20.45v3H9v30h30V18.6h3V39q0 1.25-.875 2.125T39 42Zm26-24.9v-4.05h-4.05v-3H35V6h3v4.05h4.05v3H38v4.05ZM12 33.9h24l-7.2-9.6-6.35 8.35-4.7-6.2ZM9 9v30V9Z');
  --label-hint-text: var(--msc-image-uploader-label-hint-text, 'pick images');

  /* warn */
  --warn-bar-size: .75em;
  --warn-bar-strip-start-color: #de2f21;
  --warn-bar-strip-end-color: rgba(0 0 0);
  --warn-scale-normal: .001;
  --warn-scale-active: 1;
  --warn-scale: var(--warn-scale-normal);

  /* loading */
  --loading-color: var(--msc-image-uploader-loading-color, rgba(255 255 255));
  --loading-bgc: var(--msc-image-uploader-loading-bgc, rgba(0 0 0/.05));
  --loading-opacity-normal: 0;
  --loading-opacity-active: 1;
  --loading-opacity: var(--loading-opacity-normal);
}

.msc-image-uploader__unit {
  --unit-border-radius: var(--border-radius);
  --unit-indicator-pointer-events: none;

  --unit-border-color: var(--msc-image-uploader-unit-focus-border-color, #69a2f9);
  --unit-border-opacity-normal: 0;
  --unit-border-opacity-active: 1;
  --unit-border-opacity: var(--unit-border-opacity-normal);

  --unit-overlay-color: var(--msc-image-uploader-unit-overlay-color, rgba(255 255 255/.15));
  --unit-overlay-opacity-normal: 0;
  --unit-overlay-opacity-active: 1;
  --unit-overlay-opacity: var(--unit-overlay-opacity-normal);

  --unit-vision-visibility: visible;
}

.msc-image-uploader__unit__button {
  --button-bgc-opacity-normal: .2;
  --button-bgc-opacity-active: .65;
  --button-bgc-opacity: var(--button-bgc-opacity-normal);
  --button-bgc: rgba(0 0 0/var(--button-bgc-opacity));
}

.msc-image-uploader__unit__decoy {
  --x: 0px;
  --y: 0px;
  --inline-size: 0px;
  --block-size: 0px;
}

.main{position:relative;outline:0 none;}
.main::before{position:absolute;inset-inline-start:0;inset-block-start:0;inline-size:100%;block-size:100%;content:'';background-color:var(--main-dnd-bgc);z-index:4;border-radius:var(--border-radius);overflow:hidden;display:var(--main-dnd-display);}
.main::after{position:absolute;inset-inline:0;inset-block:0;margin:auto;inline-size:fit-content;block-size:fit-content;font-size:var(--main-dnd-hint-text-size);color:var(--main-dnd-hint-text-color);content:var(--main-dnd-hint-text);z-index:5;display:var(--main-dnd-display);}
.main:focus-within{background-color:var(--main-focus-within-bgc);}

.grids{padding:var(--gap);display:grid;grid-template-columns:repeat(var(--column-count),1fr);gap:var(--gap);}
.msc-image-uploader__unit{position:relative;inline-size:100%;aspect-ratio:1/1;border-radius:var(--unit-border-radius);overflow:hidden;outline:0 none;}
.msc-image-uploader__unit__img{position:relative;inline-size:100%;block-size:100%;object-fit:cover;display:block;visibility:var(--unit-vision-visibility);}

/* overlay > ::before:overlay / ::after:border */
.msc-image-uploader__unit::before{position:absolute;inset-inline-start:0;inset-block-start:0;inline-size:100%;block-size:100%;content:'';box-sizing:border-box;border-radius:var(--unit-border-radius);background-color:var(--unit-overlay-color);transition:opacity 150ms ease;opacity:var(--unit-overlay-opacity);will-change:opacity;pointer-events:var(--unit-indicator-pointer-events);z-index:1;}
.msc-image-uploader__unit::after{position:absolute;inset-inline-start:0;inset-block-start:0;inline-size:100%;block-size:100%;content:'';box-sizing:border-box;border:var(--main-padding) dashed var(--unit-border-color);border-radius:var(--unit-border-radius);transition:opacity 150ms ease;opacity:var(--unit-border-opacity);will-change:opacity;pointer-events:var(--unit-indicator-pointer-events);z-index:1;}

/* progress */
.msc-image-uploader__circle-progress{position:absolute;inset-inline-end:var(--main-padding);inset-block-end:var(--main-padding);inline-size:var(--progress-size);block-size:var(--progress-size);border-radius:var(--progress-size);background-color:var(--bgc-progress);box-shadow:0 0 0 2px var(--bgc-progress);pointer-events:none;transition:transform 200ms ease-in-out;transform:scale(var(--progress-scale));}

/* button */
.msc-image-uploader__unit__button{position:absolute;inset-inline-end:var(--main-padding);inset-block-start:var(--main-padding);inline-size:var(--button-size);aspect-ratio:1/1;border-radius:var(--button-size);color:transparent;appearance:none;border:0 none;overflow:hidden;display:block;outline:0 none;background-color:var(--button-bgc);will-change:background-color,transform;transition:background-color 200ms ease,transform 200ms ease-in-out;transform:scale(var(--button-scale));pointer-events:var(--button-pointer-events);z-index:2;}
.msc-image-uploader__unit__button::before{position:absolute;inset-inline:0;inset-block:0;margin:auto;inline-size:1.5em;block-size:1.5em;content:'';background-color:rgba(255 255 255);clip-path:var(--button-mask);}
.msc-image-uploader__unit__button:focus-visible{--button-bgc-opacity:var(--button-bgc-opacity-active);}
.msc-image-uploader__unit__button:active{transform:scale(.9);transition:unset;}

/* label */
.msc-image-uploader__unit--label{position:relative;display:flex;align-items:center;flex-direction:column;justify-content:center;gap:.25em;background-color:var(--label-bgc);overflow:hidden;}
.msc-image-uploader__unit--label::after{opacity:0;}
.msc-image-uploader__unit--label:active{transform:scale(.95);}
.msc-image-uploader__unit__icon{inline-size:3em;block-size:3em;background-color:var(--label-color);clip-path:var(--label-mask);display:block;opacity:1;}
.msc-image-uploader__unit__span{font-size:.875em;color:var(--label-color);white-space:nowrap;}
.msc-image-uploader__unit__span::before{content:var(--label-hint-text);}
.msc-image-uploader__unit__span:blank{display:none;}
.msc-image-uploader__unit--label:focus-visible{--unit-overlay-opacity:var(--unit-overlay-opacity-active);}
.msc-image-uploader__unit__input{position:absolute;inset-block-start:0;visibility:hidden;opacity:0;}

/* decoy */
.msc-image-uploader__unit__decoy{position:fixed;inset-inline-start:var(--x);inset-block-start:var(--y);inline-size:var(--inline-size);block-size:var(--block-size);opacity:var(--decoy-opacity);display:none;}
.msc-image-uploader__unit__decoy--show{display:block;z-index:2147483647;pointer-events:none;transform:scale(1.03);}
.msc-image-uploader__unit__decoy--mutate-size{}
.msc-image-uploader__unit__decoy--mutate-axis{}

/* warn */
.msc-image-uploader__unit__warn{position:absolute;inset-inline-start:0;inset-block-start:0;inline-size:100%;block-size:100%;background-color:rgba(255 0 0/.3);pointer-events:none;animation:animate-warn 1s ease-in-out infinite;transition:transform 150ms ease-in-out;will-change:opacity,transform;transform:scale(var(--warn-scale));border-radius:var(--unit-border-radius);overflow:hidden;}
.msc-image-uploader__unit__warn::before,
.msc-image-uploader__unit__warn::after{position:absolute;inset-inline-start:0;inline-size:100%;block-size:var(--warn-bar-size);content:'';background-size:24px var(--warn-bar-size);background-image:-webkit-linear-gradient(-45deg, var(--warn-bar-strip-start-color) 33%, var(--warn-bar-strip-end-color) 33%, var(--warn-bar-strip-end-color) 66%, var(--warn-bar-strip-start-color) 66%);}
.msc-image-uploader__unit__warn::before{inset-block-start:0;animation:animate-warn-bar-block-start 60s linear infinite;}
.msc-image-uploader__unit__warn::after{inset-block-end:0;animation:animate-warn-bar-block-end 60s linear infinite;}
.msc-image-uploader__unit__warn__span{position:absolute;inset-block:0;margin:auto;inline-size:100%;block-size:fit-content;display:block;background-color:rgba(0 0 0/.75);color:var(--warn-bar-strip-start-color);line-height:2.2;text-align:center;font-size:1em;font-weight:800;border-block-start:2px solid var(--warn-bar-strip-start-color);border-block-end:2px solid var(--warn-bar-strip-start-color);}

@keyframes animate-warn-bar-block-start {
  100% { background-position: -3000% 0px; }
}

@keyframes animate-warn-bar-block-end {
  100% { background-position: 3000% 0px; }
}

@keyframes animate-warn {
  0% { opacity: .5; }
  50% { opacity: 1; }
  100%{ opacity: .5; }
}

/* loading: https://loading.io/css/ */
.msc-image-uploader__loading{position:absolute;inset-inline-end:var(--gap);inset-block-end:var(--gap);inline-size:80px;block-size:80px;border-radius:80px;background-color:var(--loading-bgc);transform:scale(.5);transform-origin:100% 100%;pointer-events:none;z-index:3;transition:opacity 200ms ease;will-change:opacity;opacity:var(--loading-opacity);}
.lds-ripple{display:inline-block;position:relative;inline-size:80px;block-size:80px;}
.lds-ripple div{position:absolute;border:4px solid var(--loading-color);opacity:1;border-radius:50%;animation:lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;}
.lds-ripple div:nth-child(2){animation-delay:-0.5s;}

/* decoration */
.msc-image-uploader__unit__decoration{position:absolute;inset-inline-start:0;inset-block-start:0;inline-size:100%;block-size:100%;pointer-events:none;border-radius:var(--unit-border-radius);overflow:hidden;z-index:1;contain:content;}

@keyframes lds-ripple {
  0% { top:36px;left:36px;width:0;height:0;opacity:0; }
  4.9% { top:36px;left:36px;width:0;height:0;opacity:0; }
  5% { top:36px;left:36px;width:0;height:0;opacity:1; }
  100% { top:0px;left:0px;width:72px;height:72px;opacity:0; }
}

/* status */
[data-status=normal],
[data-status=warn] {
  --button-scale: var(--button-scale-active);
  --button-pointer-events: auto;
  cursor: move;
}

[data-status=process] {
  --progress-scale: var(--progress-scale-active);
}

[data-status=drag] {
  --unit-overlay-opacity: var(--unit-overlay-opacity-active);
  --unit-border-opacity: var(--unit-border-opacity-active);
  --unit-vision-visibility: hidden;
  --unit-indicator-pointer-events: auto;
}

[data-status=warn] {
  --warn-scale: var(--warn-scale-active);
}

.msc-image-uploader__unit:not(label):focus {
  --unit-overlay-opacity: var(--unit-overlay-opacity-active);
  --unit-border-opacity: var(--unit-border-opacity-active);

  --button-scale: var(--button-scale-normal);
  --button-pointer-events: none;
}

.msc-image-uploader__unit--dismiss{animation:dismiss 300ms ease forwards;}

.main--loading{--loading-opacity:var(--loading-opacity-active);}
.main[data-action=dragging] .msc-image-uploader__unit__button{pointer-events:none;}
.main--mutate{}

/* msc-image-uploader--blank-trigger */
:host(.msc-image-uploader--blank-trigger) .main[data-action] .msc-image-uploader__unit--label{visibility:hidden;}
:host(.msc-image-uploader--blank-trigger) .msc-image-uploader__unit--label:not(:only-child) {
  position: absolute;
  inset-inline-start: var(--gap);
  inset-block-start: var(--gap);
  inline-size: calc((100% - (var(--gap) * 2) - ((var(--column-count) - 1) * var(--gap))) /  var(--column-count));
}

@media (hover: hover) {
  .msc-image-uploader__unit:not(.msc-image-uploader__unit__decoy):hover::before{--unit-overlay-opacity:var(--unit-overlay-opacity-active);}
  .msc-image-uploader__unit__button:hover{--button-bgc-opacity:var(--button-bgc-opacity-active);}
}

@keyframes dismiss {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-20%);
    opacity: 0;
  }
}
</style>

<div class="main main--mutate" ontouchstart="" tabindex="0">
  <div class="grids">
    <label class="msc-image-uploader__unit msc-image-uploader__unit--label" aria-label="pick images" tabindex="0">
      <em class="msc-image-uploader__unit__icon stuff"></em>
      <span class="msc-image-uploader__unit__span"></span>
      <input class="msc-image-uploader__unit__input" type="file" accept="${defaults.limitation.accept}" tabindex="-1" />
    </label>
  </div>

  <div class="msc-image-uploader__loading">
    <div class="lds-ripple">
      <div></div>
      <div></div>
    </div>
  </div>

  <div class="msc-image-uploader__unit msc-image-uploader__unit__decoy msc-image-uploader__unit__decoy--mutate-size msc-image-uploader__unit__decoy--mutate-axis">
    <img class="msc-image-uploader__unit__img" src="https://picsum.photos/id/111/200/200" width="1" height="1" />
  </div>
</div>
`;

const templateUnit = document.createElement('template');
templateUnit.innerHTML = `
{{#units}}
<div id="{{id}}" class="msc-image-uploader__unit" data-status="{{status}}" tabindex="0">
  <em class="msc-image-uploader__unit__decoration" part></em>
  <img class="msc-image-uploader__unit__img" src="{{src}}" width="1" height="1" alt="msc-image-uploader unit" />
  <div class="msc-image-uploader__circle-progress">
    <msc-circle-progress size="3" value="0" round></msc-circle-progress>
  </div>
  <div class="msc-image-uploader__unit__warn">
    <span class="msc-image-uploader__unit__warn__span">ERROR</span>
  </div>
  <button type="button" class="msc-image-uploader__unit__button" tabindex="0">remove</button>
</div>
{{/units}}
`;

// Houdini Props and Vals
if (CSS?.registerProperty) {
  try {
    CSS.registerProperty({
      name: '--msc-image-uploader-gap',
      syntax: '<length>',
      inherits: true,
      initialValue: '12px'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-column-count',
      syntax: '<number>',
      inherits: true,
      initialValue: '4'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-dragging-opacity',
      syntax: '<number>',
      inherits: true,
      initialValue: '.5'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-unit-border-radius',
      syntax: '<length>',
      inherits: true,
      initialValue: '8px'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-main-drop-overlay-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(0 0 0/.7)'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-main-drop-hint-text-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255)'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-main-drop-hint-text-size',
      syntax: '<length>',
      inherits: true,
      initialValue: '40px'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-focus-within-bgc',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255/.01)'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-label-bgc',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(232 234 237/.04)'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-label-color',
      syntax: '<color>',
      inherits: true,
      initialValue: '#606367'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-unit-overlay-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255/.15)'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-unit-focus-border-color',
      syntax: '<color>',
      inherits: true,
      initialValue: '#69a2f9'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-loading-color',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(255 255 255)'
    });

    CSS.registerProperty({
      name: '--msc-image-uploader-loading-bgc',
      syntax: '<color>',
      inherits: true,
      initialValue: 'rgba(0 0 0/.05)'
    });
  } catch(err) {
    console.warn(`msc-image-uploader: ${err.message}`);
  }
}

export class MscImageUploader extends HTMLElement {
  #data;
  #nodes;
  #config;

  constructor(config) {
    super();

    // template
    this.attachShadow({ mode: 'open', delegatesFocus: false });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // data
    this.#data = {
      controller: '',
      ddController: '',
      dX: 0,
      dY: 0,
      units: {}
    };

    // nodes
    this.#nodes = {
      styleSheet: this.shadowRoot.querySelector('style'),
      main: this.shadowRoot.querySelector('.main'),
      grids: this.shadowRoot.querySelector('.grids'),
      decoy: this.shadowRoot.querySelector('.msc-image-uploader__unit__decoy'),
      input: this.shadowRoot.querySelector('.msc-image-uploader__unit__input'),
      activeTarget: ''
    };

    // config
    this.#config = {
      ...defaults,
      ...config // new MscImageUploader(config)
    };

    // evts
    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
    this._onAnimationEnd = this._onAnimationEnd.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onFilesChange = this._onFilesChange.bind(this);
    this._onPaste = this._onPaste.bind(this);
    this._onDnD = this._onDnD.bind(this);

    this._onClick = this._onClick.bind(this);
  }

  async connectedCallback() {
    const { config, error } = await _wcl.getWCConfig(this);
    const { main, grids, input } = this.#nodes;

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
    grids.addEventListener(evtDown, this._onDown, { signal });
    grids.addEventListener('animationend', this._onAnimationEnd, { signal });
    grids.addEventListener('click', this._onClick, { signal });
    input.addEventListener('change', this._onFilesChange, { signal });
    main.addEventListener('keydown', this._onKeyDown, { signal, capture: true });
    main.addEventListener('paste', this._onPaste, { signal });

    main.addEventListener('dragover', this._onDnD, { signal });
    main.addEventListener('drop', this._onDnD, { signal });   
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
        case 'fieldname':
          this.#config[attrName] = newValue.length > 0 ? newValue : defaults.fieldname;
          break;

        case 'multiple':
          this.#config[attrName] = true;
          break;

        case 'placeholder': {
          const { maxcount } = this.limitation;
          let values;

          try {
            values = JSON.parse(newValue);

            if (!Array.isArray(values)) {
              throw new Error(`${_wcl.classToTagName(this.constructor.name)}: placeholder should be array.`);
            }
          } catch(err) {
            console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
            values = [...defaults[attrName]];
          }

          this.#config[attrName] = values.filter(
            (data = {}) => {
              return data?.src;
            }
          ).slice(0, maxcount);
          break;
        }

        case 'limitation':
        case 'webservice': {
          let values;
          
          try {
            values = JSON.parse(newValue);
          } catch(err) {
            console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
            values = { ...defaults[attrName] };
          }

          // webservice.timeout
          if (attrName === 'webservice') {
            let timeout = +values.timeout;
            if (isNaN(timeout) || timeout <= 0) {
              timeout = defaults.webservice.timeout;
            }
            values.timeout = timeout;
          }

          this.#config[attrName] = values;
          break;
        }
      }
    }
  }

  #getUnitId() {
    return `unit-${_wcl.getUUID()}`;
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (!MscImageUploader.observedAttributes.includes(attrName)) {
      return;
    }

    this.#format(attrName, oldValue, newValue);

    switch (attrName) {
      case 'multiple':
        this.#nodes.input.multiple = this.multiple;
        break;

      case 'limitation': {
        const { accept } = this.limitation;
        this.#nodes.input.accept = accept;
        break;
      }

      case 'placeholder': {
        this.removeAll();

        const data = {};
        const units = this.placeholder
          .reduce(
            (acc, cur) => {
              const { src } = cur;
              const id = this.#getUnitId();

              data[id] = { ...cur };

              return acc.concat({
                id,
                src,
                status: 'normal'
              });
            }
          , []);

        this.#data.units = { ...data };
        const templateString = Mustache.render(templateUnit.innerHTML, { units });
        this.#nodes.grids.insertAdjacentHTML('beforeend', templateString);

        this.#markDecorations();
        this.#updateStorage();
        break;
      }
    }
  }

  static get observedAttributes() {
    return Object.keys(defaults); // MscImageUploader.observedAttributes
  }

  static get supportedKeyboardKeys() {
    return legalKey;
  }

  static get supportedEvents() {
    return Object.keys(custumEvents).map(
      (key) => {
        return custumEvents[key];
      }
    );
  }

  #upgradeProperty(prop) {
    let value;

    if (MscImageUploader.observedAttributes.includes(prop)) {
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

  set fieldname(value) {
    if (value) {
      this.setAttribute('fieldname', value);
    } else {
      this.removeAttribute('fieldname');
    }
  }

  get fieldname() {
    return this.#config.fieldname;
  }

  set limitation(value) {
    if (value) {
      const newValue = {
        ...defaults.limitation,
        ...this.limitation,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('limitation', JSON.stringify(newValue));
    } else {
      this.removeAttribute('limitation');
    }
  }

  get limitation() {
    return this.#config.limitation;
  }

  set webservice(value) {
    if (value) {
      const newValue = {
        ...defaults.webservice,
        ...this.webservice,
        ...(typeof value === 'string' ? JSON.parse(value) : value)
      };
      this.setAttribute('webservice', JSON.stringify(newValue));
    } else {
      this.removeAttribute('webservice');
    }
  }

  get webservice() {
    return this.#config.webservice;
  }

  set placeholder(value) {
    if (value) {
      const newValue = typeof value === 'string'
        ? JSON.parse(value)
        : (Array.isArray(value) ? value : defaults.placeholder);
      this.setAttribute('placeholder', JSON.stringify(newValue));
    } else {
      this.removeAttribute('placeholder');
    }
  }

  get placeholder() {
    return this.#config.placeholder;
  }

  set multiple(value) {
    this.toggleAttribute('multiple', Boolean(value));
  }

  get multiple() {
    return this.#config.multiple;
  }

  get processing() {
    return Array.from(this.#nodes.grids.querySelectorAll('.msc-image-uploader__unit[data-status=process]')).length > 0;
  }

  get uploadInfo() {
    const units =  Array.from(this.#nodes.grids.querySelectorAll('.msc-image-uploader__unit:not(label)'));

    return units.reduce(
      (acc, unit) => {
        const id = unit.id;
        const data = this.#data.units[id];

        if (data) {
          return acc.concat({
            ...data
          });
        } else {
          return acc;
        }
      }
    , []);
  }

  get count() {
    return Array.from(this.#nodes.grids.querySelectorAll('.msc-image-uploader__unit:not(label)')).length;
  }

  #updateStorage() {
    let storage = this.querySelector('input[type=hidden]');

    if (!storage) {
      storage = document.createElement('input');
      storage.type = 'hidden';
      storage.name = 'msc-image-uploader';
      this.appendChild(storage);
    }

    storage.value = JSON.stringify(this.uploadInfo.filter(({ error }) => !error));
  }

  #fireEvent(evtName, detail) {
    this.dispatchEvent(new CustomEvent(evtName,
      {
        bubbles: true,
        composed: true,
        ...(detail && { detail })
      }
    ));
  }

  #mutateSize({ width, height }) {
    _wcl.addStylesheetRules(
      '.msc-image-uploader__unit__decoy--mutate-size',
      {
        '--inline-size': `${width}px`,
        '--block-size': `${height}px`
      },
      this.#nodes.styleSheet
    );
  }

  #mutateAxis({ pX, pY }) {
    const { dX, dY } = this.#data;

    _wcl.addStylesheetRules(
      '.msc-image-uploader__unit__decoy--mutate-axis',
      {
        '--x': `${pX - _wcl.scrollX - dX}px`,
        '--y': `${pY - _wcl.scrollY - dY}px`
      },
      this.#nodes.styleSheet
    );
  }

  #swapUnits(overTarget) {
    const { grids, activeTarget } = this.#nodes;

    if (overTarget === activeTarget) {
      return;
    }

    if (activeTarget.nextElementSibling === overTarget) {
      overTarget.after(activeTarget);
    } else if (activeTarget.previousElementSibling === overTarget) {
      overTarget.before(activeTarget);
    } else {
      const activeNext = activeTarget.nextElementSibling;
      const overNext = overTarget.nextElementSibling;

      // move activeTarget
      if (overNext) {
        overNext.before(activeTarget);
      } else {
        grids.appendChild(activeTarget);
      }

      // move overTarget
      if (activeNext) {
        activeNext.before(overTarget);
      } else {
        grids.appendChild(overTarget);
      }
    }

    this.#markDecorations();
    this.#updateStorage();
  }

  #markDecorations() {
    Array.from(this.#nodes.grids.querySelectorAll('.msc-image-uploader__unit:not(label)'))
      .forEach(
        (unit, idx) => {
          unit.firstElementChild.part = `decoration decorations-${idx+1}`; 
        }
      );
  }

  #getThumbnail({ naturalWidth, naturalHeight, dataURL }) {
    const negative = new Image();
    const size = 160;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let sX, sY, sSize;

    negative.src = dataURL;
    canvas.width = size;
    canvas.height = size;

    if (naturalWidth >= naturalHeight) {
      sX = Math.floor((naturalWidth - naturalHeight) / 2);
      sY = 0;
      sSize = naturalHeight;
    } else {
      sX = 0;
      sY = Math.floor((naturalHeight - naturalWidth) / 2);
      sSize = naturalWidth;
    }

    ctx.drawImage(negative, sX, sY, sSize, sSize, 0, 0, size, size);

    return canvas.toDataURL('image/jpeg', 0.75);
  }

  #findOverTarget({ pX, pY }) {
    const { units, activeTarget } = this.#nodes;
    const sX = _wcl.scrollX;
    const sY = _wcl.scrollY;

    const index = units.findIndex(
      (unit) => {
        const { x, y, width, height } = unit.getBoundingClientRect();
        const startX = x + sX;
        const endX = startX + width;
        const startY = y + sY;
        const endY = startY + height;

        return pX >= startX && pX <= endX && pY >= startY && pY <= endY;
      }
    );

    return units[index] || activeTarget;
  }

  async #fetchImageInfo(blob) {
    return new Promise(
      (resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (evt) => {
          const dataURL = evt.target.result;
          const img = new Image();

          img.onload = () => {
            const { naturalWidth, naturalHeight } = img;

            resolve({
              naturalWidth,
              naturalHeight,
              dataURL
            });
          };
          img.onerror = () => {
            reject(new Error('fetch image info error.'));
          };

          img.src= dataURL;
        };
        reader.readAsDataURL(blob);
      }
    );
  }

  async #validation(file) {
    let response;

    try {
      const { size, minwidth, minheight } = this.limitation;
      const { naturalWidth, naturalHeight, dataURL } = await this.#fetchImageInfo(file);

      // size
      if (file.size > size) {
        throw new Error(`image size must under ${size} bytes.`);
      }

      // width
      if (naturalWidth < minwidth) {
        throw new Error(`image width must be bigger than ${minwidth}px.` );
      }

      // height
      if (naturalHeight < minheight) {
        throw new Error(`image height must be bigger than ${minwidth}px.` );
      }

      response = {
        dataURL: this.#getThumbnail({ naturalWidth, naturalHeight, dataURL }),
        file
      };

    } catch(err) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
      this.#fireEvent(custumEvents.error, { message:err.message });

      response = {
        error: err.message
      };
    }

    return response;
  }

  #upload(data) {
    const { grids } = this.#nodes;
    const { src, file } = data;
    const id = this.#getUnitId();
    const units = [{
      id,
      src,
      status: 'process'
    }];

    const templateString = Mustache.render(templateUnit.innerHTML, { units });
    grids.insertAdjacentHTML('beforeend', templateString);
    this.#markDecorations();

    const unit = grids.querySelector(`#${id}`);
    const progress = unit.querySelector('msc-circle-progress');

    const { url, params, header, timeout, withCredentials } = this.webservice;
    const base = !/^http(s)?:\/\/.*/.test(url) ? window.location.origin : undefined;
    const fetchUrl = new URL(url, base);

    const xhr = new XMLHttpRequest();
    const fd = new FormData();

    xhr.open('POST', fetchUrl, true);
    xhr.timeout = timeout;
    xhr.withCredentials = Boolean(withCredentials);

    // header
    Object.keys(header).forEach((key) => xhr.setRequestHeader(key, header[key]));

    // params
    Object.keys(params).forEach((key) => fd.set(key, params[key]));
    fd.set(this.fieldname, file);

    // events
    xhr.upload.onprogress = (evt) => {
      const { lengthComputable, loaded, total } = evt;

      if (lengthComputable) {
        progress.value = Math.round((loaded * 100) / total);
      }
    };

    xhr.upload.onload = () => {
      progress.value = 100;
    };

    xhr.ontimeout = () => {
      unit.dataset.status = 'warn';
      this.#data.units[id] = {
        error: {
          message: 'fetch timeout.'
        }
      };
    };

    xhr.onabort = () => {
      unit.dataset.status = 'warn';
      this.#data.units[id] = {
        error: {
          message: 'fetch abort.'
        }
      };
    };

    xhr.onerror = () => {
      unit.dataset.status = 'warn';
      this.#data.units[id] = {
        error: {
          message: 'fetch unknow error.'
        }
      };
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) {
        return;
      }

      const { response, status } = xhr;

      try {
        const data = (response?.length > 0) ? JSON.parse(response) : {};

        if (!/^2\d{2,}/.test(status)) {
          throw new Error('fetch is not a successful responses.', {
            ...(Object.keys(data).length > 0 && { cause: data })
          });
        }

        unit.dataset.status = 'normal';
        this.#data.units[id] = {
          ...data
        };
      } catch(err) {
        console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${err.message}`);
        const cause = (typeof err.cause !== 'undefined') ? err.cause : undefined;

        this.#fireEvent(custumEvents.error, {
          message:err.message,
          ...(cause && { cause })
        });

        unit.dataset.status = 'warn';
        this.#data.units[id] = {
          error: {
            message: err.message,
            ...(cause && { cause })
          }
        };
      }

      this.#updateStorage();

      if (!this.processing) {
        const timer = status === 0 ? 100 : 0;

        // need to wait for other event update unit data once error occured
        setTimeout(
          () => {
            this.#fireEvent(custumEvents.done);
          }
        , timer);
      }
    };

    xhr.send(fd);
  }

  _onClick(evt) {
    const button = evt.target.closest('button');
    const target = evt.target.closest('.msc-image-uploader__unit:not(label)');

    if (button && target) {
      evt.preventDefault();
      target.classList.add('msc-image-uploader__unit--dismiss');
    }
  }

  _onDown(evt) {
    const button = evt.target.closest('button');
    const target = evt.target.closest('.msc-image-uploader__unit:not(label)');
    const { main, grids, decoy } = this.#nodes;

    // remove
    if (button && target) {
      target.classList.add('msc-image-uploader__unit--dismiss');
      return;
    }

    if (!target || (typeof evt.buttons !== 'undefined' && evt.buttons !== 1) || main.dataset.action) {
      return;
    }

    evt.preventDefault();

    main.dataset.action = 'dragging';

    this.#data.ddController = new AbortController();
    const html = document.querySelector('html');
    const signal = this.#data.ddController.signal;
    const { x:pX, y:pY } = _wcl.pointer(evt);
    const { x, y, width, height } = target.getBoundingClientRect();

    this.#data.dX = pX - (_wcl.scrollX + x);
    this.#data.dY = pY - (_wcl.scrollY + y);
    this.#nodes.activeTarget = target;
    this.#nodes.units = Array.from(grids.querySelectorAll('.msc-image-uploader__unit:not(label)'));

    // decoy
    this.#mutateSize({ width, height });
    this.#mutateAxis({ pX, pY });
    decoy.querySelector('img').replaceWith(target.querySelector('img').cloneNode(true));
    decoy.classList.toggle('msc-image-uploader__unit__decoy--show', true);
    target.dataset.formerstatus = target.dataset.status;
    target.dataset.status = 'drag';
    target.focus();

    // evts
    html.addEventListener(evtMove, this._onMove, { signal });
    html.addEventListener(evtUp, this._onUp, { signal });
  }

  _onMove(evt) {
    const { main } = this.#nodes;

    if ((typeof evt.buttons !== 'undefined' && evt.buttons !== 1) || !main.dataset.action) {
      return;
    }

    const { x:pX, y:pY } = _wcl.pointer(evt);
    this.#mutateAxis({ pX, pY });

    this.#swapUnits(this.#findOverTarget({ pX, pY }));
  }

  _onUp(evt) {
    const { main, activeTarget, decoy } = this.#nodes;

    if ((typeof evt.buttons !== 'undefined' && (evt.buttons & 1)) || !main.dataset.action) {
      return;
    }

    this.#data.ddController.abort();
    delete main.dataset.action;
    decoy.classList.toggle('msc-image-uploader__unit__decoy--show', false);
    
    const { formerstatus } = activeTarget.dataset;
    if (formerstatus !== 'process') {
      activeTarget.dataset.status = formerstatus;
    }
    delete activeTarget.dataset.formerstatus;

    this.#updateStorage();
  }

  _onAnimationEnd(evt) {
    const unit = evt.target;
    const id = unit.id;

    unit.remove();

    if (this.#data.units[id]) {
      delete this.#data.units[id];
    }

    this.#fireEvent(custumEvents.remove);
    this.#markDecorations();
    this.#updateStorage();
  }

  _onKeyDown(evt) {
    const { main, grids } = this.#nodes;
    const { key } = evt;
    const target = this.shadowRoot.activeElement.closest('.msc-image-uploader__unit:not(label)');

    if (!MscImageUploader.supportedKeyboardKeys.includes(key) || main.dataset.action || !target) {
      return;
    }

    evt.preventDefault();

    const units = Array.from(grids.querySelectorAll('.msc-image-uploader__unit:not(label)'));
    const totalCount = units.length;
    const currentIndex = units.indexOf(target);
    const compStyles = window.getComputedStyle(main);
    const columns = +compStyles.getPropertyValue('--column-count').trim();
    const rows = Math.ceil((totalCount + 1) / columns);
    this.#nodes.activeTarget = target;

    switch (key) {
      case 'Escape':
        target.blur();
        break;

      case 'ArrowLeft': {
        const prevIndex = (currentIndex - 1 + totalCount) % totalCount;
        this.#swapUnits(units[prevIndex]);
        break;
      }

      case 'ArrowRight': {
        const nextIndex = (currentIndex + 1 + totalCount) % totalCount;
        this.#swapUnits(units[nextIndex]);
        break;
      }

      case 'ArrowDown': {
        let nextIndex = (currentIndex + 1) + columns;

        if (!units[nextIndex - 1]) {
          for (let i=-1;++i<rows;) {
            let idx = (currentIndex + 1) - (i * columns);
            if (units[idx - 1]) {
              nextIndex = idx;
            }
          }
        }

        this.#swapUnits(units[nextIndex - 1]);
        break;
      }

      case 'ArrowUp': {
        let prevIndex = (currentIndex + 1) - columns;
        if (!units[prevIndex - 1]) {
          for (let i=-1;++i<rows;) {
            let idx = (currentIndex + 1) + (i * columns);
            if (units[idx - 1]) {
              prevIndex = idx;
            }
          }
        }

        this.#swapUnits(units[prevIndex - 1]);
        break;
      }
    }

    if (key !== 'Escape') {
      target.focus();
    }
  }

  _onDnD(evt) {
    const { type, dataTransfer } = evt;

    evt.preventDefault();

    if (type === 'drop') {
      evt.stopPropagation();

      this._onFilesChange({
        target: {
          files: dataTransfer.files
        }
      });
    }
  }

  _onPaste(evt) {
    const dataTransfer = evt.clipboardData || window.clipboardData;

    this._onFilesChange({
      target: {
        files: dataTransfer.files
      }
    });
  }

  async _onFilesChange(evt) {
    const {
      target: { files }
    } = evt;

    if (!files || !files.length) {
      return;
    }

    const { maxcount } = this.limitation;
    const { main, input } = this.#nodes;

    main.classList.add('main--loading');
    const results = await Promise.all(
      Array.from(files).map(
        (file) => {
          return this.#validation(file);
        }
      )
    );
    main.classList.remove('main--loading');

    // upload
    results
      .reduce(
        (acc, cur) => {
          const { dataURL, file } = cur;

          if (dataURL) {
            return acc.concat({
              src: dataURL,
              file
            });
          } else {
            return acc;
          }
        }
      , [])
      .slice(0, maxcount - this.count)
      .forEach(
        (data) => {
          this.#upload(data);
        }
      );

    input.value = '';
    this.#fireEvent(custumEvents.pick);
  }

  showPicker() {
    this.#nodes.input?.showPicker();
  }

  removeAll() {
    const { grids } = this.#nodes;

    Array.from(grids.querySelectorAll('.msc-image-uploader__unit:not(label)'))
      .forEach(
        (unit) => {
          unit.remove();
        }
      );

    this.#data.units = {};
    this.#updateStorage();
  }
}

// define web component
const S = _wcl.supports();
const T = _wcl.classToTagName(MscImageUploader.name);
if (S.customElements && S.shadowDOM && S.template && !window.customElements.get(T)) {
  window.customElements.define(T, MscImageUploader);

  // handle root dd and prevent default
  _wcl.addStylesheetRules(
  '.msc-image-uploader--dnd',
    {
      '--msc-image-uploader-main-drop-display': 'block'
    }
  );

  let counter = 0;
  const html = document.querySelector('html');
  const handler = (evt) => {
    evt.preventDefault();

    switch (evt.type) {
      case 'dragenter':
        counter += 1;
        break;

      case 'dragleave':
        counter -= 1;
        break;

      case 'drop':
        counter = 0;
        break;
    }

    document.body.classList.toggle('msc-image-uploader--dnd', Boolean(counter));
  };
  
  ['dragenter', 'dragleave', 'dragover', 'drop'].forEach(
    (evt) => {
      html.addEventListener(evt, handler, { capture:true });
    }
  );
}