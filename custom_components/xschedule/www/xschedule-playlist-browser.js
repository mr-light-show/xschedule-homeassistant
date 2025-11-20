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
 * xSchedule Playlist Browser Card for Home Assistant
 *
 * A companion card for browsing and selecting xSchedule playlists with schedule information
 */


class XSchedulePlaylistBrowser extends i {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _entity: { type: Object },
      _playlists: { type: Array },
      _playlistSchedules: { type: Object },
      _loading: { type: Boolean },
      _expandedPlaylist: { type: String },
      _playlistSongs: { type: Object },
    };
  }

  constructor() {
    super();
    this._playlists = [];
    this._playlistSchedules = {};
    this._loading = false;
    this._expandedPlaylist = null; // Track which playlist is expanded
    this._playlistSongs = {}; // Cache of songs for each playlist
    this._updateInterval = null; // Timer for time display updates only
    this._initialLoad = true; // Track if this is the first load

    // Track previous values for render optimization
    this._previousState = null;
    this._previousPlaylists = null;
    this._previousSchedules = null;
    this._previousExpandedPlaylist = null;
    this._previousPlaylistSongs = null;
    this._previousTimeUpdate = null;
    this._lastTimeUpdate = Date.now();
  }

  connectedCallback() {
    super.connectedCallback();
    // Update every 5 minutes to refresh relative time displays
    this._updateInterval = setInterval(() => {
      this._lastTimeUpdate = Date.now();
      this.requestUpdate();
    }, 300000); // 5 minutes

    // Subscribe to cache invalidation events when hass is available
    if (this._hass) {
      this._subscribeToCacheEvents();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
    // Unsubscribe from cache events
    this._unsubscribeCacheEvents();
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }

    this.config = {
      entity: config.entity,
      sort_by: config.sort_by || 'schedule',
      show_duration: config.show_duration !== false,
      show_status: config.show_status !== false,
      compact_mode: config.compact_mode || false,
      confirm_play: config.confirm_play !== false,
      ...config,
    };
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    // Subscribe to events if hass just became available
    if (!oldHass && hass) {
      this._subscribeToCacheEvents();
    }

    // Get entity
    const entityId = this.config.entity;
    this._entity = hass.states[entityId];

    if (this._entity) {
      // Always use current source_list from entity (no caching)
      const newSourceList = this._entity.attributes.source_list || [];

      // If playlists changed, update and fetch schedule info
      if (JSON.stringify(this._playlists) !== JSON.stringify(newSourceList)) {
        this._playlists = newSourceList;
        if (newSourceList.length > 0) {
          // On initial load: show cached data, then force refresh
          // On subsequent updates: just use cache normally
          const forceRefresh = this._initialLoad;
          if (this._initialLoad) {
            this._initialLoad = false;
          }
          this._fetchScheduleInfo(forceRefresh);
        }
      }
    }

    // Note: Don't call requestUpdate() here - let _fetchScheduleInfo() trigger it when data is ready
  }

  shouldUpdate(changedProperties) {
    // If entity exists, check if meaningful data changed
    if (this._entity) {
      // Check if this is the first time we have entity data
      const isFirstRender = this._previousState === null;

      const stateChanged = this._entity.state !== this._previousState;
      const playlistsChanged = JSON.stringify(this._entity.attributes.source_list) !== this._previousPlaylists;
      const schedulesChanged = JSON.stringify(this._playlistSchedules) !== this._previousSchedules;
      const expandedChanged = this._expandedPlaylist !== this._previousExpandedPlaylist;
      const songsChanged = JSON.stringify(this._playlistSongs) !== this._previousPlaylistSongs;
      const timeElapsed = this._lastTimeUpdate !== this._previousTimeUpdate;

      // Update tracking variables
      this._previousState = this._entity.state;
      this._previousPlaylists = JSON.stringify(this._entity.attributes.source_list);
      this._previousSchedules = JSON.stringify(this._playlistSchedules);
      this._previousExpandedPlaylist = this._expandedPlaylist;
      this._previousPlaylistSongs = JSON.stringify(this._playlistSongs);
      this._previousTimeUpdate = this._lastTimeUpdate;

      // Allow first render, or only if something meaningful changed
      return isFirstRender || stateChanged || playlistsChanged || schedulesChanged ||
             expandedChanged || songsChanged || timeElapsed;
    }

    return super.shouldUpdate(changedProperties);
  }

  // Feature detection helpers
  _isXSchedulePlayer() {
    if (!this._entity) return false;
    // Detect xSchedule player by checking for xSchedule-specific attributes
    return (
      this._entity.attributes.integration === 'xschedule' ||
      this._entity.attributes.playlist_songs !== undefined ||
      this._entity.attributes.queue !== undefined
    );
  }

  _supportsBrowseMedia() {
    if (!this._entity) return false;
    const features = this._entity.attributes.supported_features || 0;
    const SUPPORT_BROWSE_MEDIA = 0x800; // 2048
    return (features & SUPPORT_BROWSE_MEDIA) !== 0;
  }

  async _fetchScheduleInfo(forceRefresh = false) {
    // Don't fetch if already in progress
    if (this._loading) return;

    this._loading = true;

    try {
      // For non-xSchedule players, skip fetching schedule info
      if (!this._isXSchedulePlayer()) {
        this._playlistSchedules = {}; // Clear any existing schedules
        this._loading = false;
        this.requestUpdate();
        return;
      }

      const newSchedules = {};

      // Fetch playlist metadata (including durations) once for all playlists
      let playlistsMetadata = {};
      try {
        const metadataResponse = await this._hass.callWS({
          type: 'call_service',
          domain: 'xschedule',
          service: 'get_playlists_with_metadata',
          service_data: {
            entity_id: this.config.entity,
            force_refresh: forceRefresh,
          },
          return_response: true,
        });

        if (metadataResponse && metadataResponse.response && metadataResponse.response.playlists) {
          // Convert array to map by playlist name
          playlistsMetadata = metadataResponse.response.playlists.reduce((acc, playlist) => {
            acc[playlist.name] = playlist;
            return acc;
          }, {});
        }
      } catch (err) {
        console.error('Failed to fetch playlists metadata:', err);
      }

      // Fetch schedule info for each playlist
      for (const playlist of this._playlists) {
        try {
          const response = await this._hass.callWS({
            type: 'call_service',
            domain: 'xschedule',
            service: 'get_playlist_schedules',
            service_data: {
              entity_id: this.config.entity,
              playlist: playlist,
              force_refresh: forceRefresh,
            },
            return_response: true,
          });


          if (response && response.response && response.response.schedules && response.response.schedules.length > 0) {
            const schedules = response.response.schedules;

            // Find the best schedule to display:
            // 1. Currently active schedule (active: "TRUE" or nextactive: "NOW!")
            // 2. Soonest upcoming schedule (earliest valid date)
            let schedule = null;

            // First, look for active schedule
            const activeSchedule = schedules.find(s => s.active === "TRUE" || s.nextactive === "NOW!");
            if (activeSchedule) {
              schedule = activeSchedule;
            } else {
              // Find soonest upcoming schedule (skip "A long time from now" and invalid dates)
              const upcomingSchedules = schedules
                .filter(s => {
                  const na = s.nextactive;
                  return na && na !== "A long time from now" && na !== "N/A" && na.match(/\d{4}-\d{2}-\d{2}/);
                })
                .sort((a, b) => {
                  // Sort by nextactive date (earliest first)
                  return new Date(a.nextactive) - new Date(b.nextactive);
                });

              schedule = upcomingSchedules.length > 0 ? upcomingSchedules[0] : schedules[0];
            }

            if (!schedule) {
              continue; // Skip this playlist
            }

            // Get duration from metadata (lengthms field is milliseconds, convert to seconds)
            let totalDuration = 0;
            if (playlistsMetadata[playlist] && playlistsMetadata[playlist].lengthms) {
              totalDuration = parseInt(playlistsMetadata[playlist].lengthms) / 1000;
            }

            newSchedules[playlist] = {
              nextActiveTime: schedule.nextactive,  // Fixed: field is "nextactive" not "nextactivetime"
              enabled: schedule.enabled,
              active: schedule.active,
              duration: totalDuration,
            };
          }
        } catch (err) {
          console.error(`Failed to fetch schedule for ${playlist}:`, err);
        }
      }

      this._playlistSchedules = newSchedules;
      // Force shouldUpdate to detect this change by clearing previous state
      this._previousSchedules = null;
    } finally {
      // Always reset loading state, even if there's an unexpected error
      this._loading = false;
      this.requestUpdate();
    }
  }

  _subscribeToCacheEvents() {
    if (!this._hass || this._cacheEventUnsub) return;

    // Subscribe to xSchedule cache invalidation events
    this._cacheEventUnsub = this._hass.connection.subscribeEvents(
      (event) => {
        // Only refetch if this is our entity
        if (event.data.entity_id === this.config.entity) {
          console.debug('Backend cache invalidated, refetching schedule info');
          this._fetchScheduleInfo(true); // Force refresh to get fresh data
        }
      },
      'xschedule_cache_invalidated'
    );
  }

  _unsubscribeCacheEvents() {
    if (this._cacheEventUnsub) {
      this._cacheEventUnsub.then(unsub => unsub());
      this._cacheEventUnsub = null;
    }
  }

  render() {
    if (!this.config) {
      return x``;
    }

    if (!this._entity) {
      return x`
        <ha-card>
          <div class="card-content error">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            <p>Entity ${this.config.entity} not found</p>
          </div>
        </ha-card>
      `;
    }

    return x`
      <ha-card>
        <div class="card-header">
          <h1 class="card-title">
            <ha-icon icon="mdi:playlist-music"></ha-icon>
            xSchedule Playlists
            ${this._loading && this._playlists.length > 0
              ? x`<ha-circular-progress active style="--md-circular-progress-size: 16px; margin-left: 8px;"></ha-circular-progress>`
              : ''}
          </h1>
        </div>

        <div class="card-content ${this.config.compact_mode ? 'compact' : ''}">
          ${this._loading && this._playlists.length === 0
            ? x`
                <div class="loading">
                  <ha-circular-progress active></ha-circular-progress>
                  <p>Loading playlists...</p>
                </div>
              `
            : this._renderPlaylists()}
        </div>
      </ha-card>
    `;
  }

  _renderPlaylists() {
    if (this._playlists.length === 0) {
      return x`
        <div class="empty-state">
          <ha-icon icon="mdi:playlist-music-outline"></ha-icon>
          <p>No playlists found</p>
        </div>
      `;
    }

    const sortedPlaylists = this._getSortedPlaylists();
    const currentPlaylist = this._entity.attributes.media_playlist || 
                           this._entity.attributes.playlist ||
                           this._entity.attributes.source;

    return x`
      <div class="playlist-list">
        ${sortedPlaylists.map((playlist) =>
          this._renderPlaylistItem(playlist, playlist === currentPlaylist)
        )}
      </div>
    `;
  }

  _renderPlaylistItem(playlistName, isPlaying) {
    const scheduleInfo = this._playlistSchedules[playlistName];
    const hasSchedule = scheduleInfo && scheduleInfo.nextActiveTime;
    const isExpanded = this._expandedPlaylist === playlistName;
    const isXSchedule = this._isXSchedulePlayer();
    const canExpand = isXSchedule || this._supportsBrowseMedia();

    return x`
      <div class="playlist-item ${isPlaying ? 'playing' : ''} ${this.config.compact_mode ? 'compact' : ''} ${isExpanded ? 'expanded' : ''}">
        <div class="playlist-header" @click=${canExpand ? () => this._togglePlaylist(playlistName) : null}>
          <ha-icon
            icon=${isPlaying ? 'mdi:play-circle' : hasSchedule ? 'mdi:clock-outline' : 'mdi:playlist-music'}
            class="playlist-icon"
          ></ha-icon>
          <div class="playlist-name">${playlistName}</div>
          ${isXSchedule ? this._renderScheduleInfo(isPlaying, scheduleInfo) : ''}
          <button
            class="play-btn"
            @click=${(e) => this._playPlaylist(e, playlistName)}
            title=${isXSchedule ? 'Play playlist' : 'Play source'}
          >
            <ha-icon icon="mdi:play-outline"></ha-icon>
          </button>
          ${canExpand ? x`
            <ha-icon
              icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
              class="expand-icon"
            ></ha-icon>
          ` : ''}
        </div>

        ${canExpand && isExpanded ? this._renderSongList(playlistName) : ''}
      </div>
    `;
  }

  _renderScheduleInfo(isPlaying, scheduleInfo) {
    const parts = [];

    // Always show playing status first
    // Check both isPlaying (current playlist) AND nextActiveTime === "NOW!" (schedule is active)
    if (isPlaying || (scheduleInfo && scheduleInfo.nextActiveTime === "NOW!")) {
      parts.push(x`<span class="schedule-info playing-status">[Playing]</span>`);
    }

    // Show duration first (if enabled and available)
    if (this.config.show_duration && scheduleInfo && scheduleInfo.duration > 0) {
      const durationStr = this._formatDuration(scheduleInfo.duration);
      parts.push(x`<span class="schedule-info duration">[${durationStr}]</span>`);
    }

    // Show schedule time second (if not playing)
    if (!isPlaying && scheduleInfo && scheduleInfo.nextActiveTime && scheduleInfo.nextActiveTime !== "NOW!") {
      // Skip special values that aren't parseable dates
      if (scheduleInfo.nextActiveTime !== "A long time from now" && scheduleInfo.nextActiveTime !== "N/A") {
        const timeStr = this._formatScheduleTime(scheduleInfo.nextActiveTime);
        parts.push(x`<span class="schedule-info schedule-time">[${timeStr}]</span>`);
      }
    }

    return parts;
  }

  _getSortedPlaylists() {
    const playlists = [...this._playlists];
    const currentPlaylist = this._entity.attributes.media_playlist || 
                           this._entity.attributes.playlist ||
                           this._entity.attributes.source;

    if (this.config.sort_by === 'schedule') {
      // Sort by schedule:
      // 1. Currently playing playlist (from media player state)
      // 2. Active schedules (nextActiveTime === "NOW!")
      // 3. Upcoming schedules (by time)
      // 4. No schedules (alphabetically)
      return playlists.sort((a, b) => {
        // Currently playing always first
        if (a === currentPlaylist) return -1;
        if (b === currentPlaylist) return 1;

        const scheduleA = this._playlistSchedules[a];
        const scheduleB = this._playlistSchedules[b];

        const isActiveA = scheduleA?.nextActiveTime === "NOW!";
        const isActiveB = scheduleB?.nextActiveTime === "NOW!";

        // Active schedules (NOW!) come next
        if (isActiveA && !isActiveB) return -1;
        if (!isActiveA && isActiveB) return 1;

        // Both active or both not active - sort by schedule time
        if (scheduleA?.nextActiveTime && scheduleB?.nextActiveTime) {
          // Skip unparseable values
          const parseableA = scheduleA.nextActiveTime !== "A long time from now" &&
                            scheduleA.nextActiveTime !== "N/A" &&
                            scheduleA.nextActiveTime !== "NOW!";
          const parseableB = scheduleB.nextActiveTime !== "A long time from now" &&
                            scheduleB.nextActiveTime !== "N/A" &&
                            scheduleB.nextActiveTime !== "NOW!";

          if (parseableA && parseableB) {
            return new Date(scheduleA.nextActiveTime) - new Date(scheduleB.nextActiveTime);
          }
          if (parseableA) return -1;
          if (parseableB) return 1;
        }
        if (scheduleA?.nextActiveTime) return -1;
        if (scheduleB?.nextActiveTime) return 1;

        // Finally alphabetically
        return a.localeCompare(b);
      });
    }

    // Alphabetical sort (but playing first)
    return playlists.sort((a, b) => {
      if (a === currentPlaylist) return -1;
      if (b === currentPlaylist) return 1;
      return a.localeCompare(b);
    });
  }

  _formatScheduleTime(timeStr) {
    const date = new Date(timeStr);
    const now = new Date();

    // Format time in 12-hour format
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const timeFormatted = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    // Normalize dates to midnight for accurate day comparison
    const dateDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((dateDate - nowDate) / (1000 * 60 * 60 * 24));

    // Same day
    if (diffDays === 0) {
      return `Today ${timeFormatted}`;
    }

    // Tomorrow
    if (diffDays === 1) {
      return `Tomorrow ${timeFormatted}`;
    }

    // Yesterday (in case of past schedules)
    if (diffDays === -1) {
      return `Yesterday ${timeFormatted}`;
    }

    // Within a week (show day name)
    if (diffDays > 0 && diffDays <= 7) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${dayNames[date.getDay()]} ${timeFormatted}`;
    }

    // Beyond a week (show month and day)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()} ${timeFormatted}`;
  }

  _formatDuration(seconds) {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }


  async _togglePlaylist(playlistName) {
    if (this._expandedPlaylist === playlistName) {
      // Collapse if already expanded
      this._expandedPlaylist = null;
    } else {
      // Expand and fetch songs if not cached
      this._expandedPlaylist = playlistName;

      if (!this._playlistSongs[playlistName]) {
        await this._fetchPlaylistSongs(playlistName);
      }
    }
    this.requestUpdate();
  }

  async _fetchPlaylistSongs(playlistName, forceRefresh = false) {
    try {
      const result = await this._hass.callWS({
        type: 'media_player/browse_media',
        entity_id: this.config.entity,
        media_content_type: 'playlist',
        media_content_id: playlistName
      });
      
      // Map browse_media children to song format (matching xSchedule format)
      const songs = result.children?.map(child => ({
        name: child.title,
        lengthms: child.duration ? Math.round(child.duration * 1000) : 0
      })) || [];
      
      this._playlistSongs[playlistName] = songs;
      this.requestUpdate();
    } catch (err) {
      console.error(`Failed to fetch songs for ${playlistName}:`, err);
      this._playlistSongs[playlistName] = [];
    }
  }

  _renderSongList(playlistName) {
    const songs = this._playlistSongs[playlistName];

    if (!songs) {
      return x`
        <div class="song-list loading">
          <ha-circular-progress active size="small"></ha-circular-progress>
        </div>
      `;
    }

    if (songs.length === 0) {
      return x`
        <div class="song-list empty">
          <p>No songs in this playlist</p>
        </div>
      `;
    }

    return x`
      <div class="song-list">
        ${songs.map((song) => x`
          <div class="song-item-compact">
            <span class="song-name-compact">${song.name}</span>
            ${song.duration ? x`<span class="song-duration-compact">${this._formatDuration(song.duration / 1000)}</span>` : ''}
          </div>
        `)}
      </div>
    `;
  }

  async _playPlaylist(e, playlistName) {
    e.stopPropagation(); // Prevent playlist toggle

    // Check if confirmation is required
    if (this.config.confirm_play) {
      const confirmed = confirm(`Play playlist "${playlistName}"?`);
      if (!confirmed) {
        return;
      }
    }

    try {
      const entity = this._hass.states[this.config.entity];
      const features = entity?.attributes?.supported_features || 0;
      
      // Feature flags from Home Assistant
      const SUPPORT_PLAY_MEDIA = 0x200;    // 512
      const SUPPORT_SELECT_SOURCE = 0x400; // 1024
      
      const isXSchedule = this._isXSchedulePlayer();
      
      // For xSchedule, prefer PLAY_MEDIA
      // For generic players, prefer SELECT_SOURCE (standard way to change source)
      if (isXSchedule && (features & SUPPORT_PLAY_MEDIA)) {
        await this._hass.callService('media_player', 'play_media', {
          entity_id: this.config.entity,
          media_content_type: 'playlist',
          media_content_id: playlistName,
        });
      } else if (features & SUPPORT_SELECT_SOURCE) {
        await this._hass.callService('media_player', 'select_source', {
          entity_id: this.config.entity,
          source: playlistName,
        });
      } else if (features & SUPPORT_PLAY_MEDIA) {
        // Fallback to PLAY_MEDIA for players that only support that
        await this._hass.callService('media_player', 'play_media', {
          entity_id: this.config.entity,
          media_content_type: 'music',
          media_content_id: playlistName,
        });
      } else {
        console.warn('Player does not support playlist playback');
        throw new Error('Player does not support playlists');
      }
    } catch (err) {
      console.error('Failed to play playlist:', err);
    }
  }

  getCardSize() {
    return this.config.compact_mode ? 4 : 6;
  }

  static get styles() {
    return i$3`
      :host {
        display: block;
      }

      ha-card {
        overflow: hidden;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 1.2em;
        font-weight: 600;
      }

      .card-content {
        padding: 12px;
      }

      .card-content.compact {
        padding: 8px;
      }

      .error,
      .loading,
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 32px;
        text-align: center;
      }

      .error {
        color: var(--error-color);
      }

      .error ha-icon,
      .loading ha-icon,
      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.5;
      }

      .playlist-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playlist-item {
        background: var(--primary-background-color);
        border-radius: 8px;
        padding: 12px;
        transition: background 0.2s;
      }

      .playlist-item.compact {
        padding: 8px;
      }

      .playlist-item.playing {
        border-left: 4px solid var(--accent-color);
        font-weight: 600;
      }

      .playlist-header {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
      }

      .playlist-icon {
        --mdc-icon-size: 24px;
        flex-shrink: 0;
      }

      .playlist-name {
        flex: 1;
        font-size: 1em;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .expand-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
        opacity: 0.7;
        transition: transform 0.2s;
      }

      .play-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
        flex-shrink: 0;
      }

      .play-btn:hover {
        background: var(--dark-primary-color);
      }

      .play-btn ha-icon {
        --mdc-icon-size: 24px;
      }

      .schedule-info {
        font-size: 0.85em;
        margin-left: 8px;
        white-space: nowrap;
      }

      .schedule-info.playing-status {
        color: var(--accent-color);
        font-weight: 600;
      }

      .schedule-info.schedule-time {
        color: var(--secondary-text-color);
      }

      .schedule-info.duration {
        color: var(--secondary-text-color);
        opacity: 0.85;
      }

      .song-list {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--divider-color);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .song-list.loading,
      .song-list.empty {
        padding: 12px;
        text-align: center;
        color: var(--secondary-text-color);
      }

      .song-item-compact {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        background: var(--card-background-color);
        border-radius: 4px;
        transition: background 0.2s;
      }

      .song-item-compact:hover {
        background: var(--secondary-background-color);
      }

      .song-name-compact {
        flex: 1;
        font-size: 0.9em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .song-duration-compact {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        margin-left: auto;
        margin-right: 8px;
        white-space: nowrap;
      }


      /* Removed special styling for songs in playing playlist - songs use normal colors */

      @media (max-width: 768px) {
        .card-header {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        .schedule-info {
          font-size: 0.75em;
        }

        .playlist-name {
          font-size: 0.95em;
        }
      }
    `;
  }
}

// Configuration Editor
class XSchedulePlaylistBrowserEditor extends i {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  setConfig(config) {
    this.config = config;
  }

  _valueChanged(ev) {
    if (!this.config || !this.hass) {
      return;
    }
    const target = ev.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    if (this.config[target.configValue] === value) {
      return;
    }

    const newConfig = {
      ...this.config,
      [target.configValue]: value,
    };

    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass || !this.config) {
      return x``;
    }

    // Get all media_player entities (not just xSchedule)
    const entities = Object.keys(this.hass.states)
      .filter(entityId => entityId.startsWith('media_player.'))
      .sort((a, b) => {
        // Sort xSchedule players to the top for convenience
        const aIsXSchedule = a.includes('xschedule') || 
                            this.hass.states[a].attributes.playlist_songs !== undefined;
        const bIsXSchedule = b.includes('xschedule') || 
                            this.hass.states[b].attributes.playlist_songs !== undefined;
        if (aIsXSchedule && !bIsXSchedule) return -1;
        if (!aIsXSchedule && bIsXSchedule) return 1;
        // Otherwise sort alphabetically
        const aName = this.hass.states[a].attributes.friendly_name || a;
        const bName = this.hass.states[b].attributes.friendly_name || b;
        return aName.localeCompare(bName);
      });

    return x`
      <div class="card-config">
        <div class="form-group">
          <label for="entity">Entity (Required)</label>
          <select
            id="entity"
            .configValue=${'entity'}
            .value=${this.config.entity || ''}
            @change=${this._valueChanged}
          >
            <option value="">Select a media player...</option>
            ${entities.map(entityId => x`
              <option value="${entityId}" ?selected=${this.config.entity === entityId}>
                ${this.hass.states[entityId].attributes.friendly_name || entityId}
              </option>
            `)}
          </select>
        </div>

        <div class="form-group">
          <label for="sort_by">Sort By</label>
          <select
            id="sort_by"
            .configValue=${'sort_by'}
            .value=${this.config.sort_by || 'schedule'}
            @change=${this._valueChanged}
          >
            <option value="schedule">Schedule (Next to Play)</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              .configValue=${'show_duration'}
              .checked=${this.config.show_duration !== false}
              @change=${this._valueChanged}
            />
            Show Duration
          </label>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              .configValue=${'show_status'}
              .checked=${this.config.show_status !== false}
              @change=${this._valueChanged}
            />
            Show Status Badges
          </label>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              .configValue=${'compact_mode'}
              .checked=${this.config.compact_mode || false}
              @change=${this._valueChanged}
            />
            Compact Mode
          </label>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              .configValue=${'confirm_play'}
              .checked=${this.config.confirm_play !== false}
              @change=${this._valueChanged}
            />
            Confirm Before Playing
          </label>
        </div>
      </div>
    `;
  }

  static get styles() {
    return i$3`
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
      }

      .form-group select,
      .form-group input[type="text"] {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .form-group label input[type="checkbox"] {
        margin-right: 8px;
      }
    `;
  }
}

customElements.define('xschedule-playlist-browser-editor', XSchedulePlaylistBrowserEditor);
customElements.define('xschedule-playlist-browser', XSchedulePlaylistBrowser);

// Log card info to console
console.info(
  '%c  XSCHEDULE-PLAYLIST-BROWSER  \n%c  Version 1.7.0  ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

// Register editor
XSchedulePlaylistBrowser.getConfigElement = function() {
  return document.createElement('xschedule-playlist-browser-editor');
};

// Provide stub config for card picker
XSchedulePlaylistBrowser.getStubConfig = function() {
  return {
    entity: '',
    sort_by: 'schedule',
    show_duration: true,
    show_status: true,
    compact_mode: false,
    confirm_play: true,
  };
};

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'xschedule-playlist-browser',
  name: 'xSchedule Playlist Browser',
  description: 'Browse and select xSchedule playlists with schedule information',
  preview: true,
});
