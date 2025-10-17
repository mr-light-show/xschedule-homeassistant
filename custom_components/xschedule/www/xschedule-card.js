/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;let o=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const e=void 0!==i&&1===i.length;e&&(t=s.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&s.set(i,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new o(s,t,i)},a=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:r,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:d,getPrototypeOf:p}=Object,u=globalThis,g=u.trustedTypes,m=g?g.emptyScript:"",y=u.reactiveElementPolyfillSupport,_=(t,e)=>t,b={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},f=(t,e)=>!r(t,e),v={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:f};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=v){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&l(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const n=s?.call(this);o?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??v}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const t=this.properties,e=[...h(t),...d(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,s)=>{if(e)i.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of s){const s=document.createElement("style"),o=t.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=e.cssText,i.appendChild(s)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:b;this._$Em=s;const n=o.fromAttribute(e,t.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(t,e,i){if(void 0!==t){const s=this.constructor,o=this[t];if(i??=s.getPropertyOptions(t),!((i.hasChanged??f)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==o||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[_("elementProperties")]=new Map,$[_("finalized")]=new Map,y?.({ReactiveElement:$}),(u.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const x=globalThis,w=x.trustedTypes,k=w?w.createPolicy("lit-html",{createHTML:t=>t}):void 0,A="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+S,P=`<${C}>`,E=document,T=()=>E.createComment(""),M=t=>null===t||"object"!=typeof t&&"function"!=typeof t,N=Array.isArray,q="[ \t\n\f\r]",D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,U=/-->/g,B=/>/g,z=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),O=/'/g,H=/"/g,j=/^(?:script|style|textarea|title)$/i,R=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),I=Symbol.for("lit-noChange"),Q=Symbol.for("lit-nothing"),L=new WeakMap,V=E.createTreeWalker(E,129);function W(t,e){if(!N(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(e):e}const X=(t,e)=>{const i=t.length-1,s=[];let o,n=2===e?"<svg>":3===e?"<math>":"",a=D;for(let e=0;e<i;e++){const i=t[e];let r,l,c=-1,h=0;for(;h<i.length&&(a.lastIndex=h,l=a.exec(i),null!==l);)h=a.lastIndex,a===D?"!--"===l[1]?a=U:void 0!==l[1]?a=B:void 0!==l[2]?(j.test(l[2])&&(o=RegExp("</"+l[2],"g")),a=z):void 0!==l[3]&&(a=z):a===z?">"===l[0]?(a=o??D,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,r=l[1],a=void 0===l[3]?z:'"'===l[3]?H:O):a===H||a===O?a=z:a===U||a===B?a=D:(a=z,o=void 0);const d=a===z&&t[e+1].startsWith("/>")?" ":"";n+=a===D?i+P:c>=0?(s.push(r),i.slice(0,c)+A+i.slice(c)+S+d):i+S+(-2===c?e:d)}return[W(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Y{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,n=0;const a=t.length-1,r=this.parts,[l,c]=X(t,e);if(this.el=Y.createElement(l,i),V.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=V.nextNode())&&r.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(A)){const e=c[n++],i=s.getAttribute(t).split(S),a=/([.?@])?(.*)/.exec(e);r.push({type:1,index:o,name:a[2],strings:i,ctor:"."===a[1]?Z:"?"===a[1]?tt:"@"===a[1]?et:K}),s.removeAttribute(t)}else t.startsWith(S)&&(r.push({type:6,index:o}),s.removeAttribute(t));if(j.test(s.tagName)){const t=s.textContent.split(S),e=t.length-1;if(e>0){s.textContent=w?w.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],T()),V.nextNode(),r.push({type:2,index:++o});s.append(t[e],T())}}}else if(8===s.nodeType)if(s.data===C)r.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(S,t+1));)r.push({type:7,index:o}),t+=S.length-1}o++}}static createElement(t,e){const i=E.createElement("template");return i.innerHTML=t,i}}function F(t,e,i=t,s){if(e===I)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const n=M(e)?void 0:e._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),void 0===n?o=void 0:(o=new n(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=F(t,o._$AS(t,e.values),o,s)),e}class G{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??E).importNode(e,!0);V.currentNode=s;let o=V.nextNode(),n=0,a=0,r=i[0];for(;void 0!==r;){if(n===r.index){let e;2===r.type?e=new J(o,o.nextSibling,this,t):1===r.type?e=new r.ctor(o,r.name,r.strings,this,t):6===r.type&&(e=new it(o,this,t)),this._$AV.push(e),r=i[++a]}n!==r?.index&&(o=V.nextNode(),n++)}return V.currentNode=E,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class J{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=Q,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=F(this,t,e),M(t)?t===Q||null==t||""===t?(this._$AH!==Q&&this._$AR(),this._$AH=Q):t!==this._$AH&&t!==I&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>N(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Q&&M(this._$AH)?this._$AA.nextSibling.data=t:this.T(E.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Y.createElement(W(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new G(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=L.get(t.strings);return void 0===e&&L.set(t.strings,e=new Y(t)),e}k(t){N(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new J(this.O(T()),this.O(T()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class K{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=Q,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Q}_$AI(t,e=this,i,s){const o=this.strings;let n=!1;if(void 0===o)t=F(this,t,e,0),n=!M(t)||t!==this._$AH&&t!==I,n&&(this._$AH=t);else{const s=t;let a,r;for(t=o[0],a=0;a<o.length-1;a++)r=F(this,s[i+a],e,a),r===I&&(r=this._$AH[a]),n||=!M(r)||r!==this._$AH[a],r===Q?t=Q:t!==Q&&(t+=(r??"")+o[a+1]),this._$AH[a]=r}n&&!s&&this.j(t)}j(t){t===Q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Z extends K{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Q?void 0:t}}class tt extends K{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Q)}}class et extends K{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=F(this,t,e,0)??Q)===I)return;const i=this._$AH,s=t===Q&&i!==Q||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==Q&&(i===Q||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class it{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){F(this,t)}}const st=x.litHtmlPolyfillSupport;st?.(Y,J),(x.litHtmlVersions??=[]).push("3.3.1");const ot=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class nt extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new J(e.insertBefore(T(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}}nt._$litElement$=!0,nt.finalized=!0,ot.litElementHydrateSupport?.({LitElement:nt});const at=ot.litElementPolyfillSupport;at?.({LitElement:nt}),(ot.litElementVersions??=[]).push("4.2.1");const rt={simple:{playlistDisplay:"collapsed",songsDisplay:"hidden",queueDisplay:"hidden",showVolumeControl:!1,showProgressBar:!0,showPlaybackControls:!0,enableSeek:!1,showEntityName:!1,showPlaylistName:!1,showSongActions:!1,showPlayButton:!0,showAddToQueueButton:!0},dj:{playlistDisplay:"expanded",songsDisplay:"expanded",queueDisplay:"expanded",showVolumeControl:!1,showProgressBar:!0,showPlaybackControls:!0,showSongActions:!0,enableSeek:!1,showEntityName:!1,showPlaylistName:!1,showPlayButton:!0,showAddToQueueButton:!0},jukebox:{playlistDisplay:"collapsed",songsDisplay:"expanded",queueDisplay:"expanded",showVolumeControl:!1,showProgressBar:!0,showPlaybackControls:!0,showSongActions:!0,enableSeek:!1,showEntityName:!1,showPlaylistName:!1,showPlayButton:!0,showAddToQueueButton:!0},minimal:{playlistDisplay:"hidden",songsDisplay:"hidden",queueDisplay:"hidden",showVolumeControl:!1,showProgressBar:!0,showPlaybackControls:!0,enableSeek:!1,showEntityName:!1,showPlaylistName:!1,showSongActions:!1,showPlayButton:!0,showAddToQueueButton:!0},custom:{}};class lt extends nt{static get properties(){return{hass:{type:Object},config:{type:Object},_entity:{type:Object},_playlists:{type:Array},_songs:{type:Array},_queue:{type:Array},_songsExpanded:{type:Boolean},_queueExpanded:{type:Boolean},_toast:{type:Object},_contextMenu:{type:Object}}}constructor(){super(),this._playlists=[],this._songs=[],this._queue=[],this._songsExpanded=!1,this._queueExpanded=!1,this._toast=null,this._contextMenu=null,this._longPressTimer=null,this._progressInterval=null,this._lastPlaylist=null,this._lastPlaylistSongs=[]}setConfig(t){if(!t.entity)throw new Error("You need to define an entity");const e=t.mode||"simple",i=rt[e]||rt.simple;this.config={entity:t.entity,mode:e,...i,...t}}connectedCallback(){super.connectedCallback(),this._progressInterval=setInterval(()=>{"playing"===this._entity?.state&&this.requestUpdate()},1e3)}disconnectedCallback(){super.disconnectedCallback(),this._progressInterval&&(clearInterval(this._progressInterval),this._progressInterval=null)}set hass(t){this._hass=t;const e=this.config.entity;if(this._entity=t.states[e],this._entity){this._playlists=this._entity.attributes.source_list||[];const t=this._entity.attributes.playlist,e=this._entity.attributes.playlist_songs||[];t&&"Queue"!==t&&e.length>0&&(this._lastPlaylist=t,this._lastPlaylistSongs=e),this._songs=e.length>0?e:this._lastPlaylistSongs,this._queue=this._entity.attributes.queue||[]}}render(){return this._entity?(this._entity.state,this._entity.state,this._entity.state,R`
      <ha-card>
        <div class="card-content ${this.config.compactMode?"compact":""}">
          ${this.config.showEntityName?this._renderEntityName():""}
          ${this._renderNowPlaying()}
          ${this._renderProgressBar()}
          ${this._renderPlaybackControls()}
          ${this.config.showVolumeControl?this._renderVolumeControl():""}
          ${this._renderPlaylistSelector()}
          ${this._renderQueue()}
          ${this._renderSongs()}
        </div>
        ${this._toast?this._renderToast():""}
        ${this._contextMenu?this._renderContextMenu():""}
      </ha-card>
    `):R`
        <ha-card>
          <div class="card-content error">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            <p>Entity ${this.config.entity} not found</p>
          </div>
        </ha-card>
      `}_renderEntityName(){const t=this._entity.attributes.friendly_name||this._entity.entity_id;return R`
      <div class="entity-name">
        <ha-icon icon="mdi:lightbulb-group"></ha-icon>
        <span>${t}</span>
      </div>
    `}_renderNowPlaying(){const t=this._entity.attributes.playlist||"No playlist",e=this._entity.attributes.song||"No song";return R`
      <div class="now-playing">
        ${this.config.showPlaylistName?R`<div class="playlist-name">${t}</div>`:""}
        <div class="song-name">${e}</div>
      </div>
    `}_renderProgressBar(){if(!this.config.showProgressBar)return"";const t=this._entity.attributes.media_duration,e=this._entity.attributes.media_position;if(!t||t<=0)return"";let i=e||0;if("playing"===this._entity.state){const e=this._entity.attributes.media_position_updated_at;if(e){const s=new Date(e);i+=(new Date-s)/1e3,i>t&&(i=t)}}const s=i/t*100;return R`
      <div class="progress-container">
        <div
          class="progress-bar ${this.config.enableSeek?"seekable":""}"
          @click=${this.config.enableSeek?this._handleSeek:null}
        >
          <div class="progress-fill" style="width: ${s}%"></div>
        </div>
        <div class="time-display">
          <span>${this._formatTime(i)}</span>
          <span>${this._formatTime(t)}</span>
        </div>
      </div>
    `}_renderPlaybackControls(){if(!this.config.showPlaybackControls)return"";const t="playing"===this._entity.state;return this._entity.state,R`
      <div class="playback-controls">
        <ha-icon-button
          @click=${this._handlePrevious}
          title="Previous"
        >
          <ha-icon icon="mdi:skip-previous"></ha-icon>
        </ha-icon-button>

        <ha-icon-button
          @click=${t?this._handlePause:this._handlePlay}
          class="play-pause"
          title=${t?"Pause":"Play"}
        >
          <ha-icon icon=${t?"mdi:pause":"mdi:play"}></ha-icon>
        </ha-icon-button>

        <ha-icon-button
          @click=${this._handleStop}
          title="Stop"
        >
          <ha-icon icon="mdi:stop"></ha-icon>
        </ha-icon-button>

        <ha-icon-button
          @click=${this._handleNext}
          title="Next"
        >
          <ha-icon icon="mdi:skip-next"></ha-icon>
        </ha-icon-button>
      </div>
    `}_renderVolumeControl(){const t=this._entity.attributes.volume_level||0,e=this._entity.attributes.is_volume_muted||!1;return R`
      <div class="volume-control">
        <ha-icon-button
          @click=${this._handleMuteToggle}
          title=${e?"Unmute":"Mute"}
        >
          <ha-icon icon=${e?"mdi:volume-off":"mdi:volume-high"}></ha-icon>
        </ha-icon-button>
        <input
          type="range"
          min="0"
          max="100"
          .value=${100*t}
          @input=${this._handleVolumeChange}
          class="volume-slider"
        />
      </div>
    `}_renderPlaylistSelector(){const t=this.config.playlistDisplay;if("hidden"===t)return"";const e=this._entity.attributes.playlist;return"collapsed"===t?R`
        <div class="section playlist-section">
          <select
            @change=${this._handlePlaylistChange}
            .value=${e||""}
            class="playlist-select"
          >
            <option value="">Select playlist...</option>
            ${this._playlists.map(t=>R`
                <option value=${t} ?selected=${t===e}>
                  ${t}
                </option>
              `)}
          </select>
        </div>
      `:R`
      <div class="section playlist-section">
        <h3>
          <ha-icon icon="mdi:playlist-music"></ha-icon>
          Playlists
        </h3>
        <div class="playlist-list">
          ${this._playlists.map(t=>R`
              <div
                class="playlist-item ${t===e?"active":""}"
                @click=${()=>this._selectPlaylist(t)}
              >
                <ha-icon icon=${t===e?"mdi:play-circle":"mdi:playlist-music"}></ha-icon>
                <span>${t}</span>
              </div>
            `)}
        </div>
      </div>
    `}_renderQueue(){const t=this.config.queueDisplay,e=this._queue.length;if(0===e)return"";if("auto"===t&&0===e)return"";if("hidden"===t)return"";const i="collapsed"===t&&!this._queueExpanded;return R`
      <div class="section queue-section">
        <div class="section-header" @click=${this._toggleQueue}>
          <h3>
            <ha-icon icon="mdi:format-list-numbered"></ha-icon>
            Queue
            ${e>0?R`<span class="badge">${e}</span>`:""}
          </h3>
          ${"collapsed"===t?R`<ha-icon icon=${this._queueExpanded?"mdi:chevron-up":"mdi:chevron-down"}></ha-icon>`:""}
        </div>

        ${i?"":R`
              <div class="queue-list">
                ${this._queue.map((t,e)=>R`
                    <div class="queue-item">
                      <span class="queue-number">${e+1}</span>
                      <div class="queue-info">
                        <span class="queue-name">${t.name}</span>
                        ${t.duration?R`<span class="queue-duration">${this._formatTime(t.duration/1e3)}</span>`:""}
                      </div>
                    </div>
                  `)}
              </div>
              <button class="clear-queue-btn" @click=${this._handleClearQueue}>
                <ha-icon icon="mdi:playlist-remove"></ha-icon>
                Clear Queue
              </button>
            `}
      </div>
    `}_renderSongs(){const t=this.config.songsDisplay;if("hidden"===t)return"";const e="collapsed"===t&&!this._songsExpanded,i=this._songs.length,s=this._entity.attributes.song;return R`
      <div class="section songs-section">
        <div class="section-header" @click=${this._toggleSongs}>
          <h3>
            <ha-icon icon="mdi:music"></ha-icon>
            Songs
            ${i>0?R`<span class="badge">${i}</span>`:""}
          </h3>
          ${"collapsed"===t?R`<ha-icon icon=${this._songsExpanded?"mdi:chevron-up":"mdi:chevron-down"}></ha-icon>`:""}
        </div>

        ${e?"":R`
              <div class="song-list">
                ${this._songs.map(t=>R`
                    <div
                      class="song-item ${t.name===s?"current":""}"
                      @touchstart=${e=>this._handleLongPressStart(e,t.name)}
                      @touchend=${this._handleLongPressEnd}
                      @touchmove=${this._handleLongPressEnd}
                      @mousedown=${e=>this._handleLongPressStart(e,t.name)}
                      @mouseup=${this._handleLongPressEnd}
                      @mouseleave=${this._handleLongPressEnd}
                    >
                      ${t.name===s?R`<ha-icon icon="mdi:music" class="current-icon"></ha-icon>`:""}
                      <span class="song-name">${t.name}</span>
                      ${!1!==this.config.showDuration&&t.duration?R`<span class="song-duration">${this._formatTime(t.duration/1e3)}</span>`:""}
                      ${!1!==this.config.showSongActions?R`
                            <div class="song-actions">
                              ${!1!==this.config.showPlayButton?R`
                                    <button
                                      @click=${()=>this._playSong(t.name)}
                                      class="action-btn-compact"
                                      title="Play Now"
                                    >
                                      <ha-icon icon="mdi:play"></ha-icon>
                                    </button>
                                  `:""}
                              ${!1!==this.config.showAddToQueueButton?R`
                                    <button
                                      @click=${()=>this._addToQueue(t.name)}
                                      class="action-btn-compact"
                                      title="Add to Queue"
                                    >
                                      <ha-icon icon="mdi:playlist-plus"></ha-icon>
                                    </button>
                                  `:""}
                            </div>
                          `:""}
                    </div>
                  `)}
              </div>
            `}
      </div>
    `}_renderToast(){return R`
      <div class="toast ${this._toast.type}">
        <ha-icon icon=${this._toast.icon}></ha-icon>
        <span>${this._toast.message}</span>
      </div>
    `}_renderContextMenu(){return R`
      <div class="context-menu-overlay" @click=${this._closeContextMenu}>
        <div
          class="context-menu"
          style="top: ${this._contextMenu.y}px; left: ${this._contextMenu.x}px"
          @click=${t=>t.stopPropagation()}
        >
          <div class="context-menu-header">
            <ha-icon icon="mdi:music"></ha-icon>
            <span>${this._contextMenu.songName}</span>
          </div>
          <button
            class="context-menu-item"
            @click=${()=>{this._playSong(this._contextMenu.songName),this._closeContextMenu()}}
          >
            <ha-icon icon="mdi:play"></ha-icon>
            <span>Play Now</span>
          </button>
          <button
            class="context-menu-item"
            @click=${()=>{this._addToQueue(this._contextMenu.songName),this._closeContextMenu()}}
          >
            <ha-icon icon="mdi:playlist-plus"></ha-icon>
            <span>Add to Queue</span>
          </button>
          <button
            class="context-menu-item"
            @click=${()=>{this._showSongInfo(this._contextMenu.songName),this._closeContextMenu()}}
          >
            <ha-icon icon="mdi:information"></ha-icon>
            <span>Song Info</span>
          </button>
        </div>
      </div>
    `}_handlePlay(){this._callService("media_play")}_handlePause(){this._callService("media_pause")}_handleStop(){this._callService("media_stop")}_handleNext(){this._callService("media_next_track")}_handlePrevious(){this._callService("media_previous_track")}_handleSeek(t){const e=t.currentTarget.getBoundingClientRect(),i=(t.clientX-e.left)/e.width,s=(this._entity.attributes.media_duration||0)*i;this._callService("media_seek",{seek_position:s})}_handleVolumeChange(t){const e=parseInt(t.target.value)/100;this._callService("volume_set",{volume_level:e})}_handleMuteToggle(){const t=this._entity.attributes.is_volume_muted||!1;this._callService("volume_mute",{is_volume_muted:!t})}_handlePlaylistChange(t){const e=t.target.value;e&&this._selectPlaylist(e)}_selectPlaylist(t){this._callService("select_source",{source:t}),this._showToast("success","mdi:check-circle",`Playing: ${t}`)}async _playSong(t){const e=this._entity.attributes.playlist;if(e){if(!1===this.config.confirmDisruptive||"playing"!==this._entity.state||confirm("Replace current song?"))try{await this._hass.callService("xschedule","play_song",{entity_id:this.config.entity,playlist:e,song:t}),this._showToast("success","mdi:play-circle",`Now playing: ${t}`)}catch(t){this._showToast("error","mdi:alert-circle","Failed to play song")}}else this._showToast("error","mdi:alert-circle","No playlist selected")}async _addToQueue(t){const e=this._entity.attributes.playlist;if(e)if(this._queue.some(e=>e.name===t))this._showToast("info","mdi:information","Already in queue");else try{await this._hass.callService("xschedule","add_to_queue",{entity_id:this.config.entity,playlist:e,song:t}),this._showToast("success","mdi:check-circle","Added to queue")}catch(t){this._showToast("error","mdi:alert-circle","Failed to add to queue")}else this._showToast("error","mdi:alert-circle","No playlist selected")}async _handleClearQueue(){if(confirm("Clear entire queue?"))try{await this._hass.callService("xschedule","clear_queue",{entity_id:this.config.entity}),this._showToast("success","mdi:check-circle","Queue cleared")}catch(t){this._showToast("error","mdi:alert-circle","Failed to clear queue")}}_toggleSongs(){"collapsed"===this.config.songsDisplay&&(this._songsExpanded=!this._songsExpanded,this.requestUpdate())}_toggleQueue(){"collapsed"===this.config.queueDisplay&&(this._queueExpanded=!this._queueExpanded,this.requestUpdate())}_handleLongPressStart(t,e){this._longPressTimer&&clearTimeout(this._longPressTimer),this._longPressTimer=setTimeout(()=>{t.preventDefault();const i=t.touches?t.touches[0].clientX:t.clientX,s=t.touches?t.touches[0].clientY:t.clientY;this._contextMenu={songName:e,x:Math.min(i,window.innerWidth-220),y:Math.min(s,window.innerHeight-200)},this.requestUpdate(),navigator.vibrate&&navigator.vibrate(50)},500)}_handleLongPressEnd(){this._longPressTimer&&(clearTimeout(this._longPressTimer),this._longPressTimer=null)}_closeContextMenu(){this._contextMenu=null,this.requestUpdate()}_showSongInfo(t){const e=this._songs.find(e=>e.name===t);if(e){const i=e.duration?this._formatTime(e.duration/1e3):"Unknown";this._showToast("info","mdi:information",`${t} - Duration: ${i}`)}}_callService(t,e={}){this._hass.callService("media_player",t,{entity_id:this.config.entity,...e})}_formatTime(t){if(!t||t<0)return"0:00";return`${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,"0")}`}_showToast(t,e,i){this._toast={type:t,icon:e,message:i},this.requestUpdate(),setTimeout(()=>{this._toast=null,this.requestUpdate()},2e3)}getCardSize(){return 3}static get styles(){return n`
      :host {
        display: block;
      }

      ha-card {
        padding: 16px;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .card-content.compact {
        gap: 12px;
      }

      .card-content.compact ha-card {
        padding: 12px;
      }

      .error {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: var(--error-color);
      }

      .entity-name {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 0.95em;
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .entity-name ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .now-playing {
        text-align: left;
        margin-bottom: 8px;
      }

      .playlist-name {
        font-size: 1.1em;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .song-name {
        font-size: 1.3em;
        font-weight: 700;
        color: var(--primary-text-color);
        margin-top: 4px;
      }

      .progress-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .progress-bar {
        height: 6px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.2));
        border-radius: 3px;
        position: relative;
        overflow: hidden;
      }

      .progress-bar.seekable {
        cursor: pointer;
      }

      .progress-fill {
        height: 100%;
        background: var(--accent-color, var(--primary-color, #03a9f4));
        border-radius: 3px;
        transition: width 0.1s linear;
      }

      .time-display {
        display: flex;
        justify-content: space-between;
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }

      .playback-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
      }

      .playback-controls ha-icon-button {
        --mdc-icon-button-size: 40px;
        --mdc-icon-size: 28px;
      }

      .playback-controls .play-pause {
        --mdc-icon-button-size: 56px;
        --mdc-icon-size: 40px;
      }

      .volume-control {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .volume-slider {
        flex: 1;
        height: 6px;
      }

      .section {
        border-top: 1px solid var(--divider-color);
        padding-top: 12px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        margin-bottom: 8px;
      }

      .section h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 1em;
        font-weight: 600;
      }

      .badge {
        background: var(--accent-color);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.85em;
        font-weight: 600;
      }

      .playlist-select {
        width: 100%;
        padding: 12px;
        font-size: 1em;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
      }

      .playlist-list,
      .song-list,
      .queue-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playlist-item,
      .song-item,
      .queue-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        border-radius: 8px;
        background: var(--primary-background-color);
        cursor: pointer;
        transition: background 0.2s;
      }

      .playlist-item:hover {
        background: var(--secondary-background-color);
      }

      .playlist-item.active {
        background: var(--accent-color);
        color: white;
      }

      .song-item {
        flex-direction: row;
        align-items: center;
        cursor: default;
      }

      .song-item.current {
        background: var(--accent-color);
        color: white;
      }

      .song-item .current-icon {
        --mdc-icon-size: 18px;
        flex-shrink: 0;
      }

      .song-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .song-duration,
      .queue-duration {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }

      .song-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
        margin-left: auto;
      }

      .action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 8px 12px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.9em;
        cursor: pointer;
        transition: background 0.2s;
      }

      .action-btn:hover {
        background: var(--dark-primary-color);
      }

      .action-btn-compact {
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
      }

      .action-btn-compact:hover {
        background: var(--dark-primary-color);
      }

      .action-btn-compact ha-icon {
        --mdc-icon-size: 18px;
      }

      .queue-number {
        font-weight: 700;
        color: var(--accent-color);
      }

      .queue-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .clear-queue-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 10px;
        margin-top: 8px;
        background: var(--error-color);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.9em;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .clear-queue-btn:hover {
        opacity: 0.8;
      }

      .empty-state {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        color: var(--secondary-text-color);
      }

      .empty-state ha-icon {
        --mdc-icon-size: 20px;
        opacity: 0.5;
      }

      .empty-state p {
        margin: 0;
        font-size: 0.9em;
      }

      .empty-state .hint {
        display: none;
      }

      .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: var(--primary-background-color);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideUp 0.3s ease;
      }

      .toast.success {
        background: var(--success-color, #4caf50);
        color: white;
      }

      .toast.error {
        background: var(--error-color);
        color: white;
      }

      .toast.info {
        background: var(--info-color, #2196f3);
        color: white;
      }

      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(100%);
        }
        to {
          transform: translateX(-50%) translateY(0);
        }
      }

      .context-menu-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1001;
        animation: fadeIn 0.2s ease;
      }

      .context-menu {
        position: fixed;
        background: var(--card-background-color);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        padding: 8px;
        min-width: 200px;
        animation: scaleIn 0.2s ease;
        z-index: 1002;
      }

      .context-menu-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        border-bottom: 1px solid var(--divider-color);
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .context-menu-header ha-icon {
        --mdc-icon-size: 20px;
        color: var(--accent-color);
      }

      .context-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px;
        background: none;
        border: none;
        border-radius: 6px;
        color: var(--primary-text-color);
        font-size: 14px;
        text-align: left;
        cursor: pointer;
        transition: background 0.2s;
      }

      .context-menu-item:hover {
        background: var(--secondary-background-color);
      }

      .context-menu-item ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes scaleIn {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .action-btn span {
          display: none;
        }

        .context-menu {
          min-width: 180px;
        }
      }
    `}}customElements.define("xschedule-card",lt),window.customCards=window.customCards||[],window.customCards.push({type:"xschedule-card",name:"xSchedule Media Player",description:"A custom card for controlling xSchedule lighting sequencer",preview:!0}),lt.getConfigElement=async()=>(await Promise.resolve().then(function(){return pt}),document.createElement("xschedule-card-editor")),lt.getStubConfig=()=>({entity:"",mode:"simple"});const ct=[{value:"simple",label:"Simple (Default)"},{value:"dj",label:"DJ Mode"},{value:"jukebox",label:"Jukebox Mode"},{value:"minimal",label:"Minimal"},{value:"custom",label:"Custom"}],ht=[{value:"expanded",label:"Expanded"},{value:"collapsed",label:"Collapsed"},{value:"hidden",label:"Hidden"}],dt=[{value:"auto",label:"Auto (show when has items)"},{value:"expanded",label:"Expanded"},{value:"collapsed",label:"Collapsed"},{value:"hidden",label:"Hidden"}];customElements.define("xschedule-card-editor",class extends nt{static get properties(){return{hass:{type:Object},config:{type:Object},_currentTab:{type:String}}}constructor(){super(),this._currentTab="general"}setConfig(t){this.config=t}render(){if(!this.config)return R``;const t="custom"===this.config.mode;return R`
      <div class="card-config">
        <!-- General Settings -->
        <div class="form-group">
          <label for="entity">Entity (required)</label>
          <select
            id="entity"
            .value=${this.config.entity||""}
            @change=${this._entityChanged}
          >
            <option value="">Select entity...</option>
            ${this._getMediaPlayerEntities().map(t=>R`
                <option value=${t.entity_id} ?selected=${t.entity_id===this.config.entity}>
                  ${t.attributes.friendly_name||t.entity_id}
                </option>
              `)}
          </select>
        </div>

        <div class="form-group">
          <label for="mode">Card Mode</label>
          <select
            id="mode"
            .value=${this.config.mode||"simple"}
            @change=${this._modeChanged}
          >
            ${ct.map(t=>R`
                <option value=${t.value} ?selected=${this.config.mode===t.value}>
                  ${t.label}
                </option>
              `)}
          </select>
          <div class="hint">
            ${this._getModeDescription(this.config.mode||"simple")}
          </div>
        </div>

        ${t?R`
              <!-- Tabs for Custom Mode -->
              <div class="tabs">
                <button
                  class="tab ${"general"===this._currentTab?"active":""}"
                  @click=${()=>this._selectTab("general")}
                >
                  General
                </button>
                <button
                  class="tab ${"appearance"===this._currentTab?"active":""}"
                  @click=${()=>this._selectTab("appearance")}
                >
                  Appearance
                </button>
                <button
                  class="tab ${"controls"===this._currentTab?"active":""}"
                  @click=${()=>this._selectTab("controls")}
                >
                  Controls
                </button>
                <button
                  class="tab ${"advanced"===this._currentTab?"active":""}"
                  @click=${()=>this._selectTab("advanced")}
                >
                  Advanced
                </button>
              </div>

              <!-- Tab Content -->
              ${"general"===this._currentTab?this._renderGeneralTab():""}
              ${"appearance"===this._currentTab?this._renderAppearanceTab():""}
              ${"controls"===this._currentTab?this._renderControlsTab():""}
              ${"advanced"===this._currentTab?this._renderAdvancedTab():""}
            `:R`
              <div class="preset-info">
                <ha-icon icon="mdi:information"></ha-icon>
                <p>
                  This preset mode has predefined settings.
                  Switch to <strong>Custom</strong> mode to configure individual options.
                </p>
              </div>
            `}
      </div>
    `}_renderGeneralTab(){return R`
      <div class="tab-content">
        <h3>Display Options</h3>

        <div class="form-group">
          <label for="playlistDisplay">Playlist Display</label>
          <select
            id="playlistDisplay"
            .value=${this.config.playlistDisplay||"collapsed"}
            @change=${this._valueChanged}
          >
            ${ht.map(t=>R`
                <option value=${t.value}>
                  ${t.label}
                </option>
              `)}
          </select>
        </div>

        <div class="form-group">
          <label for="songsDisplay">Songs Display</label>
          <select
            id="songsDisplay"
            .value=${this.config.songsDisplay||"collapsed"}
            @change=${this._valueChanged}
          >
            ${ht.map(t=>R`
                <option value=${t.value}>
                  ${t.label}
                </option>
              `)}
          </select>
        </div>

        <div class="form-group">
          <label for="queueDisplay">Queue Display</label>
          <select
            id="queueDisplay"
            .value=${this.config.queueDisplay||"auto"}
            @change=${this._valueChanged}
          >
            ${dt.map(t=>R`
                <option value=${t.value}>
                  ${t.label}
                </option>
              `)}
          </select>
        </div>
      </div>
    `}_renderAppearanceTab(){return R`
      <div class="tab-content">
        <h3>Visual Options</h3>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showEntityName||!1}
              @change=${t=>this._checkboxChanged("showEntityName",t)}
            />
            Show entity name header
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showPlaylistName||!1}
              @change=${t=>this._checkboxChanged("showPlaylistName",t)}
            />
            Show playlist name
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${!1!==this.config.showProgressBar}
              @change=${t=>this._checkboxChanged("showProgressBar",t)}
            />
            Show progress bar
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              id="songActionsParent"
              .checked=${!1!==this.config.showSongActions}
              .indeterminate=${this._getSongActionsIndeterminate()}
              @change=${t=>this._songActionsParentChanged(t)}
            />
            Show song actions (enable both buttons below)
          </label>
        </div>

        <div class="form-group checkbox">
          <label style="padding-left: 20px;">
            <input
              type="checkbox"
              .checked=${!1!==this.config.showPlayButton}
              @change=${t=>this._songActionsChildChanged("showPlayButton",t)}
            />
            Show "Play Now" button
          </label>
        </div>

        <div class="form-group checkbox">
          <label style="padding-left: 20px;">
            <input
              type="checkbox"
              .checked=${!1!==this.config.showAddToQueueButton}
              @change=${t=>this._songActionsChildChanged("showAddToQueueButton",t)}
            />
            Show "Add to Queue" button
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${!1!==this.config.showDuration}
              @change=${t=>this._checkboxChanged("showDuration",t)}
            />
            Show song duration
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.compactMode||!1}
              @change=${t=>this._checkboxChanged("compactMode",t)}
            />
            Compact mode (reduced padding)
          </label>
        </div>
      </div>
    `}_renderControlsTab(){return R`
      <div class="tab-content">
        <h3>Playback Controls</h3>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${!1!==this.config.showPlaybackControls}
              @change=${t=>this._checkboxChanged("showPlaybackControls",t)}
            />
            Show playback controls
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.showVolumeControl||!1}
              @change=${t=>this._checkboxChanged("showVolumeControl",t)}
            />
            Show volume controls
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.enableSeek||!1}
              @change=${t=>this._checkboxChanged("enableSeek",t)}
            />
            Enable seek on progress bar
          </label>
          <div class="hint">Allow clicking progress bar to seek to position</div>
        </div>
      </div>
    `}_renderAdvancedTab(){return R`
      <div class="tab-content">
        <h3>Behavior</h3>

        <div class="form-group">
          <label for="maxVisibleSongs">Maximum visible songs</label>
          <input
            type="number"
            id="maxVisibleSongs"
            min="1"
            max="50"
            .value=${this.config.maxVisibleSongs||10}
            @change=${this._valueChanged}
          />
          <div class="hint">Number of songs to show before scrolling</div>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${!1!==this.config.confirmDisruptive}
              @change=${t=>this._checkboxChanged("confirmDisruptive",t)}
            />
            Confirm before disruptive actions
          </label>
          <div class="hint">Show confirmation when replacing current song</div>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${!1!==this.config.showTooltips}
              @change=${t=>this._checkboxChanged("showTooltips",t)}
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
    `}_getMediaPlayerEntities(){return this.hass?Object.values(this.hass.states).filter(t=>t.entity_id.startsWith("media_player.")&&(void 0!==t.attributes.playlist_songs||t.entity_id.includes("xschedule"))):[]}_getModeDescription(t){return{simple:"Best for basic playback. Shows playlist selector and playback controls.",dj:"Best for live performance. Shows all playlists expanded, queue prominent, and song actions visible.",jukebox:"Best for party mode. Shows all songs expanded with prominent queue section.",minimal:"Best for small spaces. Shows only playback controls and now playing info.",custom:"Unlock all configuration options for complete customization."}[t]||""}_selectTab(t){this._currentTab=t,this.requestUpdate()}_entityChanged(t){this._updateConfig({entity:t.target.value})}_modeChanged(t){const e=t.target.value,i={entity:this.config.entity,mode:e};this._updateConfig(i)}_valueChanged(t){const e=t.target.id,i=t.target.value;this._updateConfig({[e]:i})}_checkboxChanged(t,e){this._updateConfig({[t]:e.target.checked})}_songActionsParentChanged(t){const e=t.target.checked;this._updateConfig({showSongActions:e,showPlayButton:e,showAddToQueueButton:e})}_songActionsChildChanged(t,e){const i={[t]:e.target.checked},s="showPlayButton"===t?e.target.checked:!1!==this.config.showPlayButton,o="showAddToQueueButton"===t?e.target.checked:!1!==this.config.showAddToQueueButton;i.showSongActions=!(!s||!o)||!(!s&&!o),this._updateConfig(i)}_getSongActionsIndeterminate(){return!1!==this.config.showPlayButton!==(!1!==this.config.showAddToQueueButton)}_resetToDefaults(){confirm("Reset all settings to Simple mode defaults?")&&this._updateConfig({entity:this.config.entity,mode:"simple"})}_updateConfig(t){this.config={...this.config,...t};const e=new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0});this.dispatchEvent(e)}static get styles(){return n`
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
    `}});var pt=Object.freeze({__proto__:null});
