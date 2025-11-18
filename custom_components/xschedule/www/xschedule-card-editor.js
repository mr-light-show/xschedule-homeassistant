/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$2=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce(((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1]),t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$1,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$1(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach((t=>t.hostConnected?.()));}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()));}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i){if(void 0!==t){const e=this.constructor,h=this[t];if(i??=e.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(e._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i$1=t.trustedTypes,s$1=i$1?i$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,e="$lit$",h=`lit$${Math.random().toFixed(9).slice(2)}$`,o$1="?"+h,n=`<${o$1}>`,r=document,l=()=>r.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),T=Symbol.for("lit-noChange"),E=Symbol.for("lit-nothing"),A=new WeakMap,C=r.createTreeWalker(r,129);function P(t,i){if(!a(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s$1?s$1.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":3===i?"<math>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0);const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n:d>=0?(o.push(a),s.slice(0,d)+e+s.slice(d)+h+x):s+h+(-2===d?i:x);}return [P(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),o]};class N{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=V(t,s);if(this.el=N.createElement(f,n),C.currentNode=this.el.content,2===s||3===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=C.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e)){const i=v[a++],s=r.getAttribute(t).split(h),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?H:"?"===e[1]?I:"@"===e[1]?L:k}),r.removeAttribute(t);}else t.startsWith(h)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h),s=t.length-1;if(s>0){r.textContent=i$1?i$1.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l()),C.nextNode(),d.push({type:2,index:++c});r.append(t[s],l());}}}else if(8===r.nodeType)if(r.data===o$1)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h,t+1));)d.push({type:7,index:c}),t+=h.length-1;}c++;}}static createElement(t,i){const s=r.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){if(i===T)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=S(t,h._$AS(t,i.values),h,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r).importNode(i,true);C.currentNode=e;let h=C.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new R(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new z(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=C.nextNode(),o++);}return C.currentNode=r,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),c(t)?t===E||null==t||""===t?(this._$AH!==E&&this._$AR(),this._$AH=E):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):u(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==E&&c(this._$AH)?this._$AA.nextSibling.data=t:this.T(r.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=N.createElement(P(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new M(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new N(t)),i}k(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new R(this.O(l()),this.O(l()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(false,true,i);t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class k{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=E,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=E;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=S(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==T,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=S(this,e[s+n],i,n),r===T&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===E?t=E:t!==E&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===E?void 0:t;}}class I extends k{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==E);}}class L extends k{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=S(this,t,i,0)??E)===T)return;const s=this._$AH,e=t===E&&s!==E||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==E&&(s===E||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const j=t.litHtmlPolyfillSupport;j?.(N,R),(t.litHtmlVersions??=[]).push("3.3.1");const B=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new R(i.insertBefore(l(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=B(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return T}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o=s.litElementPolyfillSupport;o?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.1");

/**
 * Mode Presets for xSchedule Card
 * 
 * Shared configuration presets for different card display modes
 */

const MODE_PRESETS = {
  simple: {
    playlistDisplay: 'collapsed',
    songsDisplay: 'hidden',
    queueDisplay: 'hidden',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    enableSeek: false,
    showEntityName: false,
    showPlaylistName: false,
    showSongActions: false,
    showPlayButton: true,
    showAddToQueueButton: true,
    showDuration: true,
    compactMode: false,
    autoHideSongsWhenEmpty: true,
    showPowerOffButton: false,
    entityName: '',
    entityIcon: '',
  },
  dj: {
    playlistDisplay: 'expanded',
    songsDisplay: 'expanded',
    queueDisplay: 'expanded',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    showSongActions: true,
    enableSeek: false,
    showEntityName: false,
    showPlaylistName: false,
    showPlayButton: true,
    showAddToQueueButton: true,
    showDuration: true,
    compactMode: false,
    autoHideSongsWhenEmpty: false,
    showPowerOffButton: true,
    entityName: '',
    entityIcon: '',
  },
  jukebox: {
    playlistDisplay: 'collapsed',
    songsDisplay: 'expanded',
    queueDisplay: 'expanded',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    showSongActions: true,
    enableSeek: false,
    showEntityName: false,
    showPlaylistName: false,
    showPlayButton: true,
    showAddToQueueButton: true,
    showDuration: true,
    compactMode: false,
    autoHideSongsWhenEmpty: false,
    showPowerOffButton: false,
    entityName: '',
    entityIcon: '',
  },
  minimal: {
    playlistDisplay: 'hidden',
    songsDisplay: 'hidden',
    queueDisplay: 'hidden',
    showVolumeControl: false,
    showProgressBar: true,
    showPlaybackControls: true,
    enableSeek: false,
    showEntityName: false,
    showPlaylistName: false,
    showSongActions: false,
    showPlayButton: true,
    showAddToQueueButton: true,
    showDuration: true,
    compactMode: false,
    autoHideSongsWhenEmpty: true,
    showPowerOffButton: false,
    entityName: '',
    entityIcon: '',
  },
  custom: {
    // Custom mode uses user-provided settings
  },
};

/**
 * xSchedule Card Editor
 *
 * Configuration UI for xSchedule media player card
 */


const MODE_OPTIONS = [
  { value: 'simple', label: 'Simple (Default)' },
  { value: 'dj', label: 'DJ Mode' },
  { value: 'jukebox', label: 'Jukebox Mode' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'custom', label: 'Custom' },
];

const DISPLAY_MODE_OPTIONS = [
  { value: 'expanded', label: 'Expanded' },
  { value: 'collapsed', label: 'Collapsed' },
  { value: 'hidden', label: 'Hidden' },
];

const QUEUE_DISPLAY_OPTIONS = [
  { value: 'auto', label: 'Auto (show when has items)' },
  { value: 'expanded', label: 'Expanded' },
  { value: 'collapsed', label: 'Collapsed' },
  { value: 'hidden', label: 'Hidden' },
];

class XScheduleCardEditor extends i {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _currentTab: { type: String },
    };
  }

  constructor() {
    super();
    this._currentTab = 'general';
  }

  setConfig(config) {
    if (!config) {
      this.config = config;
      return;
    }
    
    const mode = config.mode || 'simple';
    const modePreset = MODE_PRESETS[mode] || MODE_PRESETS.simple;
    
    // Merge mode preset with config (same logic as card)
    this.config = {
      entity: config.entity,
      mode,
      ...modePreset,
      ...config, // User config overrides preset
    };
  }

  render() {
    if (!this.config) {
      return x``;
    }

    const isCustomMode = this.config.mode === 'custom';

    return x`
      <div class="card-config">
        <!-- General Settings -->
        <div class="form-group">
          <label for="entity">Entity (required)</label>
          <select
            id="entity"
            .value=${this.config.entity || ''}
            @change=${this._entityChanged}
          >
            <option value="">Select entity...</option>
            ${this._getMediaPlayerEntities().map(
              (entity) => x`
                <option value=${entity.entity_id} ?selected=${entity.entity_id === this.config.entity}>
                  ${entity.attributes.friendly_name || entity.entity_id}
                </option>
              `
            )}
          </select>
        </div>

        <div class="form-group">
          <label for="mode">Card Mode</label>
          <select
            id="mode"
            .value=${this.config.mode || 'simple'}
            @change=${this._modeChanged}
          >
            ${MODE_OPTIONS.map(
              (option) => x`
                <option value=${option.value} ?selected=${this.config.mode === option.value}>
                  ${option.label}
                </option>
              `
            )}
          </select>
          <div class="hint">
            ${this._getModeDescription(this.config.mode || 'simple')}
          </div>
        </div>

        ${isCustomMode
          ? x`
              <!-- Tabs for Custom Mode -->
              <div class="tabs">
                <button
                  class="tab ${this._currentTab === 'general' ? 'active' : ''}"
                  @click=${() => this._selectTab('general')}
                >
                  General
                </button>
                <button
                  class="tab ${this._currentTab === 'appearance' ? 'active' : ''}"
                  @click=${() => this._selectTab('appearance')}
                >
                  Appearance
                </button>
                <button
                  class="tab ${this._currentTab === 'controls' ? 'active' : ''}"
                  @click=${() => this._selectTab('controls')}
                >
                  Controls
                </button>
                <button
                  class="tab ${this._currentTab === 'advanced' ? 'active' : ''}"
                  @click=${() => this._selectTab('advanced')}
                >
                  Advanced
                </button>
              </div>

              <!-- Tab Content -->
              ${this._currentTab === 'general' ? this._renderGeneralTab() : ''}
              ${this._currentTab === 'appearance' ? this._renderAppearanceTab() : ''}
              ${this._currentTab === 'controls' ? this._renderControlsTab() : ''}
              ${this._currentTab === 'advanced' ? this._renderAdvancedTab() : ''}
            `
          : x`
              <div class="preset-info">
                <ha-icon icon="mdi:information"></ha-icon>
                <p>
                  This preset mode has predefined settings.
                  Switch to <strong>Custom</strong> mode to configure individual options.
                </p>
              </div>
            `}
      </div>
    `;
  }

  _renderGeneralTab() {
    return x`
      <div class="tab-content">
        <h3>Display Options</h3>

        <div class="form-group">
          <label for="playlistDisplay">Playlist Display</label>
          <select
            id="playlistDisplay"
            .value=${this.config.playlistDisplay || 'collapsed'}
            @change=${this._valueChanged}
          >
            ${DISPLAY_MODE_OPTIONS.map(
              (option) => x`
                <option value=${option.value} ?selected=${(this.config.playlistDisplay || 'collapsed') === option.value}>
                  ${option.label}
                </option>
              `
            )}
          </select>
        </div>

        <div class="form-group">
          <label for="songsDisplay">Songs Display</label>
          <select
            id="songsDisplay"
            .value=${this.config.songsDisplay || 'collapsed'}
            @change=${this._valueChanged}
          >
            ${DISPLAY_MODE_OPTIONS.map(
              (option) => x`
                <option value=${option.value} ?selected=${(this.config.songsDisplay || 'collapsed') === option.value}>
                  ${option.label}
                </option>
              `
            )}
          </select>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.autoHideSongsWhenEmpty || false}
              @change=${(e) => this._checkboxChanged('autoHideSongsWhenEmpty', e)}
            />
            Auto-hide song list when empty or single song
          </label>
          <div class="hint">Hides the song list when there are 0 or 1 songs</div>
        </div>

        <div class="form-group">
          <label for="queueDisplay">Queue Display</label>
          <select
            id="queueDisplay"
            .value=${this.config.queueDisplay || 'auto'}
            @change=${this._valueChanged}
          >
            ${QUEUE_DISPLAY_OPTIONS.map(
              (option) => x`
                <option value=${option.value} ?selected=${(this.config.queueDisplay || 'auto') === option.value}>
                  ${option.label}
                </option>
              `
            )}
          </select>
        </div>
      </div>
    `;
  }

  _renderAppearanceTab() {
    return x`
      <div class="tab-content">
        <h3>Visual Options</h3>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showEntityName || false}
              @change=${(e) => this._checkboxChanged('showEntityName', e)}
            />
            Show entity name header
          </label>
        </div>

        <div class="form-group">
          <label>Custom Entity Name</label>
          <input
            type="text"
            id="entityName"
            .value=${this.config.entityName || ''}
            @change=${this._valueChanged}
            placeholder="Leave empty to use entity friendly name"
          />
        </div>

        <div class="form-group">
          <label>Custom Entity Icon</label>
          <ha-icon-picker
            .value=${this.config.entityIcon || ''}
            @value-changed=${this._iconChanged}
            .placeholder=${'mdi:lightbulb-group'}
          ></ha-icon-picker>
          <small>Leave empty to use default icon (mdi:lightbulb-group)</small>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showPlaylistName || false}
              @change=${(e) => this._checkboxChanged('showPlaylistName', e)}
            />
            Show playlist name
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showProgressBar !== false}
              @change=${(e) => this._checkboxChanged('showProgressBar', e)}
            />
            Show progress bar
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              id="songActionsParent"
              .checked=${this.config.showSongActions !== false}
              .indeterminate=${this._getSongActionsIndeterminate()}
              @change=${(e) => this._songActionsParentChanged(e)}
            />
            Show song actions (enable both buttons below)
          </label>
        </div>

        <div class="form-group checkbox">
          <label style="padding-left: 20px;">
            <input
              type="checkbox"
              .checked=${this.config.showPlayButton !== false}
              @change=${(e) => this._songActionsChildChanged('showPlayButton', e)}
            />
            Show "Play Now" button
          </label>
        </div>

        <div class="form-group checkbox">
          <label style="padding-left: 20px;">
            <input
              type="checkbox"
              .checked=${this.config.showAddToQueueButton !== false}
              @change=${(e) => this._songActionsChildChanged('showAddToQueueButton', e)}
            />
            Show "Add to Queue" button
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showDuration !== false}
              @change=${(e) => this._checkboxChanged('showDuration', e)}
            />
            Show song duration
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.compactMode || false}
              @change=${(e) => this._checkboxChanged('compactMode', e)}
            />
            Compact mode (reduced padding)
          </label>
        </div>
      </div>
    `;
  }

  _renderControlsTab() {
    return x`
      <div class="tab-content">
        <h3>Playback Controls</h3>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showPlaybackControls !== false}
              @change=${(e) => this._checkboxChanged('showPlaybackControls', e)}
            />
            Show playback controls
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showVolumeControl || false}
              @change=${(e) => this._checkboxChanged('showVolumeControl', e)}
            />
            Show volume controls
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showPowerOffButton || false}
              @change=${(e) => this._checkboxChanged('showPowerOffButton', e)}
            />
            Show power off button
          </label>
          <div class="hint">Stops all playlists, schedules, and clears queue</div>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.enableSeek || false}
              @change=${(e) => this._checkboxChanged('enableSeek', e)}
            />
            Enable seek on progress bar
          </label>
          <div class="hint">Allow clicking progress bar to seek to position</div>
        </div>
      </div>
    `;
  }

  _renderAdvancedTab() {
    return x`
      <div class="tab-content">
        <h3>Behavior</h3>

        <div class="form-group">
          <label for="maxVisibleSongs">Maximum visible songs</label>
          <input
            type="number"
            id="maxVisibleSongs"
            min="1"
            max="50"
            .value=${this.config.maxVisibleSongs || 10}
            @change=${this._valueChanged}
          />
          <div class="hint">Number of songs to show before scrolling</div>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.confirmDisruptive !== false}
              @change=${(e) => this._checkboxChanged('confirmDisruptive', e)}
            />
            Confirm before disruptive actions
          </label>
          <div class="hint">Show confirmation when replacing current song</div>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showTooltips !== false}
              @change=${(e) => this._checkboxChanged('showTooltips', e)}
            />
            Show tooltips on hover
          </label>
        </div>

        <div class="form-group">
          <button class="reset-button" @click=${this._resetToDefaults}>
            <ha-icon icon="mdi:restore"></ha-icon>
            Reset to Simple Mode
          </button>
        </div>
      </div>
    `;
  }

  _getMediaPlayerEntities() {
    if (!this.hass) return [];
    // Show all media player entities, not just xSchedule
    return Object.values(this.hass.states).filter(
      (entity) => entity.entity_id.startsWith('media_player.')
    ).sort((a, b) => {
      // Sort xSchedule players to the top for convenience
      const aIsXSchedule = a.entity_id.includes('xschedule') || a.attributes.playlist_songs !== undefined;
      const bIsXSchedule = b.entity_id.includes('xschedule') || b.attributes.playlist_songs !== undefined;
      if (aIsXSchedule && !bIsXSchedule) return -1;
      if (!aIsXSchedule && bIsXSchedule) return 1;
      // Otherwise sort alphabetically
      const aName = a.attributes.friendly_name || a.entity_id;
      const bName = b.attributes.friendly_name || b.entity_id;
      return aName.localeCompare(bName);
    });
  }

  _getModeDescription(mode) {
    const descriptions = {
      simple: 'Best for basic playback. Shows playlist selector and playback controls.',
      dj: 'Best for live performance. Shows all playlists expanded, queue prominent, and song actions visible.',
      jukebox: 'Best for party mode. Shows all songs expanded with prominent queue section.',
      minimal: 'Best for small spaces. Shows only playback controls and now playing info.',
      custom: 'Unlock all configuration options for complete customization.',
    };
    return descriptions[mode] || '';
  }

  _selectTab(tab) {
    this._currentTab = tab;
    this.requestUpdate();
  }

  _entityChanged(e) {
    this._updateConfig({ entity: e.target.value });
  }

  _modeChanged(e) {
    const mode = e.target.value;
    
    // Get all keys that are in mode presets
    const presetKeys = new Set(Object.keys(MODE_PRESETS.simple));
    
    // Extract current preset-related values BEFORE clearing
    // These will be preserved when switching to custom mode
    const currentPresetValues = {};
    for (const key of presetKeys) {
      if (this.config[key] !== undefined) {
        currentPresetValues[key] = this.config[key];
      }
    }
    
    // Preserve all fields NOT in mode-presets (metadata, advanced settings, etc.)
    const preservedFields = {};
    for (const key in this.config) {
      // Preserve: entity (handled separately), mode (handled separately), 
      // and any field not in preset keys
      if (key !== 'entity' && key !== 'mode' && !presetKeys.has(key)) {
        preservedFields[key] = this.config[key];
      }
    }
    
    // Determine which preset values to use
    let presetValuesToApply;
    if (mode === 'custom') {
      // Custom mode: preserve current preset values
      presetValuesToApply = currentPresetValues;
    } else {
      // Preset mode: apply preset values
      const modePreset = MODE_PRESETS[mode] || MODE_PRESETS.simple;
      presetValuesToApply = modePreset;
    }
    
    // Create new config: preset values override preset-related settings,
    // but all non-preset fields are preserved
    const newConfig = {
      ...preservedFields, // Preserve all fields not in mode-presets
      entity: this.config.entity,
      mode,
      ...presetValuesToApply, // Either current values (custom) or preset values
    };
    
    // Replace config entirely (don't merge with old preset-related properties)
    this.config = newConfig;
    
    // Dispatch event with fresh config
    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _valueChanged(e) {
    const key = e.target.id;
    const value = e.target.value;
    this._updateConfig({ [key]: value });
  }

  _checkboxChanged(key, e) {
    this._updateConfig({ [key]: e.target.checked });
  }

  _iconChanged(e) {
    this._updateConfig({ entityIcon: e.detail.value || '' });
  }

  _songActionsParentChanged(e) {
    // When parent checkbox changes, update both children
    const checked = e.target.checked;
    this._updateConfig({
      showSongActions: checked,
      showPlayButton: checked,
      showAddToQueueButton: checked
    });
  }

  _songActionsChildChanged(key, e) {
    // Update the child checkbox
    const updates = { [key]: e.target.checked };

    // Update parent based on children states
    const showPlayButton = key === 'showPlayButton' ? e.target.checked : (this.config.showPlayButton !== false);
    const showAddToQueueButton = key === 'showAddToQueueButton' ? e.target.checked : (this.config.showAddToQueueButton !== false);

    if (showPlayButton && showAddToQueueButton) {
      // Both checked - parent should be checked
      updates.showSongActions = true;
    } else if (!showPlayButton && !showAddToQueueButton) {
      // Both unchecked - parent should be unchecked
      updates.showSongActions = false;
    } else {
      // Mixed state - keep parent checked but we'll show indeterminate
      updates.showSongActions = true;
    }

    this._updateConfig(updates);
  }

  _getSongActionsIndeterminate() {
    const showPlayButton = this.config.showPlayButton !== false;
    const showAddToQueueButton = this.config.showAddToQueueButton !== false;
    return showPlayButton !== showAddToQueueButton;
  }

  _resetToDefaults() {
    if (confirm('Reset all settings to Simple mode defaults?')) {
      // Use same logic as _modeChanged to properly reset to mode preset
      const mode = 'simple';
      const modePreset = MODE_PRESETS[mode] || MODE_PRESETS.simple;
      
      // Get all keys that are in mode presets (these will be replaced)
      const presetKeys = new Set(Object.keys(MODE_PRESETS.simple));
      
      // Preserve all fields NOT in mode-presets (metadata, advanced settings, etc.)
      const preservedFields = {};
      for (const key in this.config) {
        // Preserve: entity (handled separately), mode (handled separately), 
        // and any field not in preset keys
        if (key !== 'entity' && key !== 'mode' && !presetKeys.has(key)) {
          preservedFields[key] = this.config[key];
        }
      }
      
      // Create new config with preset values and preserved non-preset fields
      const newConfig = {
        ...preservedFields, // Preserve all fields not in mode-presets
        entity: this.config.entity,
        mode,
        ...modePreset,
      };
      
      // Replace config entirely
      this.config = newConfig;
      
      // Dispatch event with fresh config
      const event = new CustomEvent('config-changed', {
        detail: { config: this.config },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }

  _updateConfig(updates) {
    this.config = { ...this.config, ...updates };

    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  static get styles() {
    return i$3`
      :host {
        display: block;
      }

      .card-config {
        padding: 16px;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .form-group select,
      .form-group input[type='number'] {
        width: 100%;
        padding: 8px;
        font-size: 14px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
      }

      .form-group.checkbox {
        margin-left: 0;
      }

      .form-group.checkbox label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: normal;
        cursor: pointer;
      }

      .form-group.checkbox input[type='checkbox'] {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      .hint {
        margin-top: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .preset-info {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: var(--info-color, #2196f3);
        color: white;
        border-radius: 8px;
        margin-top: 16px;
      }

      .preset-info ha-icon {
        --mdc-icon-size: 24px;
        flex-shrink: 0;
      }

      .preset-info p {
        margin: 0;
        line-height: 1.5;
      }

      .tabs {
        display: flex;
        gap: 4px;
        margin: 16px 0;
        border-bottom: 2px solid var(--divider-color);
      }

      .tab {
        padding: 8px 16px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--secondary-text-color);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: -2px;
      }

      .tab:hover {
        color: var(--primary-text-color);
        background: var(--secondary-background-color);
      }

      .tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .tab-content {
        padding: 16px 0;
      }

      .tab-content h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .reset-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px;
        background: var(--error-color);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .reset-button:hover {
        opacity: 0.9;
      }

      .reset-button ha-icon {
        --mdc-icon-size: 20px;
      }
    `;
  }
}

customElements.define('xschedule-card-editor', XScheduleCardEditor);
