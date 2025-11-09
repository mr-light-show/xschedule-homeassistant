/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),i=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const s=this.t;if(e&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=i.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&i.set(s,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new o(i,t,s)},r=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:a,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:d,getPrototypeOf:p}=Object,u=globalThis,g=u.trustedTypes,b=g?g.emptyScript:"",f=u.reactiveElementPolyfillSupport,m=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?b:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},$=(t,e)=>!a(t,e),_={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:$};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=_){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&l(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:o}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const n=i?.call(this);o?.call(this,e),this.requestUpdate(t,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??_}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const t=this.properties,e=[...h(t),...d(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(r(t))}else void 0!==t&&e.push(r(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const s=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((s,i)=>{if(e)s.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of i){const i=document.createElement("style"),o=t.litNonce;void 0!==o&&i.setAttribute("nonce",o),i.textContent=e.cssText,s.appendChild(i)}})(s,this.constructor.elementStyles),s}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const o=(void 0!==s.converter?.toAttribute?s.converter:y).toAttribute(e,s.type);this._$Em=t,null==o?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=i;const n=o.fromAttribute(e,t.type);this[i]=n??this._$Ej?.get(i)??n,this._$Em=null}}requestUpdate(t,e,s){if(void 0!==t){const i=this.constructor,o=this[t];if(s??=i.getPropertyOptions(t),!((s.hasChanged??$)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==o||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[m("elementProperties")]=new Map,v[m("finalized")]=new Map,f?.({ReactiveElement:v}),(u.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A=globalThis,w=A.trustedTypes,x=w?w.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+k,E=`<${C}>`,P=document,T=()=>P.createComment(""),D=t=>null===t||"object"!=typeof t&&"function"!=typeof t,M=Array.isArray,N="[ \t\n\f\r]",H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,U=/>/g,B=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),R=/'/g,j=/"/g,z=/^(?:script|style|textarea|title)$/i,q=(t=>(e,...s)=>({_$litType$:t,strings:e,values:s}))(1),V=Symbol.for("lit-noChange"),L=Symbol.for("lit-nothing"),W=new WeakMap,I=P.createTreeWalker(P,129);function Q(t,e){if(!M(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==x?x.createHTML(e):e}const G=(t,e)=>{const s=t.length-1,i=[];let o,n=2===e?"<svg>":3===e?"<math>":"",r=H;for(let e=0;e<s;e++){const s=t[e];let a,l,c=-1,h=0;for(;h<s.length&&(r.lastIndex=h,l=r.exec(s),null!==l);)h=r.lastIndex,r===H?"!--"===l[1]?r=O:void 0!==l[1]?r=U:void 0!==l[2]?(z.test(l[2])&&(o=RegExp("</"+l[2],"g")),r=B):void 0!==l[3]&&(r=B):r===B?">"===l[0]?(r=o??H,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?B:'"'===l[3]?j:R):r===j||r===R?r=B:r===O||r===U?r=H:(r=B,o=void 0);const d=r===B&&t[e+1].startsWith("/>")?" ":"";n+=r===H?s+E:c>=0?(i.push(a),s.slice(0,c)+S+s.slice(c)+k+d):s+k+(-2===c?e:d)}return[Q(t,n+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class J{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0;const r=t.length-1,a=this.parts,[l,c]=G(t,e);if(this.el=J.createElement(l,s),I.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=I.nextNode())&&a.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(S)){const e=c[n++],s=i.getAttribute(t).split(k),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:o,name:r[2],strings:s,ctor:"."===r[1]?Y:"?"===r[1]?tt:"@"===r[1]?et:X}),i.removeAttribute(t)}else t.startsWith(k)&&(a.push({type:6,index:o}),i.removeAttribute(t));if(z.test(i.tagName)){const t=i.textContent.split(k),e=t.length-1;if(e>0){i.textContent=w?w.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],T()),I.nextNode(),a.push({type:2,index:++o});i.append(t[e],T())}}}else if(8===i.nodeType)if(i.data===C)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=i.data.indexOf(k,t+1));)a.push({type:7,index:o}),t+=k.length-1}o++}}static createElement(t,e){const s=P.createElement("template");return s.innerHTML=t,s}}function K(t,e,s=t,i){if(e===V)return e;let o=void 0!==i?s._$Co?.[i]:s._$Cl;const n=D(e)?void 0:e._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),void 0===n?o=void 0:(o=new n(t),o._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=o:s._$Cl=o),void 0!==o&&(e=K(t,o._$AS(t,e.values),o,i)),e}class Z{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??P).importNode(e,!0);I.currentNode=i;let o=I.nextNode(),n=0,r=0,a=s[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new F(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new st(o,this,t)),this._$AV.push(e),a=s[++r]}n!==a?.index&&(o=I.nextNode(),n++)}return I.currentNode=P,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class F{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=L,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=K(this,t,e),D(t)?t===L||null==t||""===t?(this._$AH!==L&&this._$AR(),this._$AH=L):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>M(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==L&&D(this._$AH)?this._$AA.nextSibling.data=t:this.T(P.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=J.createElement(Q(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Z(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=W.get(t.strings);return void 0===e&&W.set(t.strings,e=new J(t)),e}k(t){M(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const o of t)i===e.length?e.push(s=new F(this.O(T()),this.O(T()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class X{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=L,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=L}_$AI(t,e=this,s,i){const o=this.strings;let n=!1;if(void 0===o)t=K(this,t,e,0),n=!D(t)||t!==this._$AH&&t!==V,n&&(this._$AH=t);else{const i=t;let r,a;for(t=o[0],r=0;r<o.length-1;r++)a=K(this,i[s+r],e,r),a===V&&(a=this._$AH[r]),n||=!D(a)||a!==this._$AH[r],a===L?t=L:t!==L&&(t+=(a??"")+o[r+1]),this._$AH[r]=a}n&&!i&&this.j(t)}j(t){t===L?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Y extends X{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===L?void 0:t}}class tt extends X{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==L)}}class et extends X{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=K(this,t,e,0)??L)===V)return;const s=this._$AH,i=t===L&&s!==L||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==L&&(s===L||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){K(this,t)}}const it=A.litHtmlPolyfillSupport;it?.(J,F),(A.litHtmlVersions??=[]).push("3.3.1");const ot=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class nt extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let o=i._$litPart$;if(void 0===o){const t=s?.renderBefore??null;i._$litPart$=o=new F(e.insertBefore(T(),t),t,void 0,s??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}}nt._$litElement$=!0,nt.finalized=!0,ot.litElementHydrateSupport?.({LitElement:nt});const rt=ot.litElementPolyfillSupport;rt?.({LitElement:nt}),(ot.litElementVersions??=[]).push("4.2.1");const at={simple:{playlistDisplay:"collapsed",songsDisplay:"hidden",queueDisplay:"hidden",showVolumeControl:!1,showProgressBar:!0,showPlaybackControls:!0,enableSeek:!1,showEntityName:!1,showPlaylistName:!1,showSongActions:!1,showPlayButton:!0,showAddToQueueButton:!0,showDuration:!0,compactMode:!1,autoHideSongsWhenEmpty:!0},dj:{playlistDisplay:"expanded",songsDisplay:"expanded",queueDisplay:"expanded",showVolumeControl:!1,showProgressBar:!0,showPlaybackControls:!0,showSongActions:!0,enableSeek:!1,showEntityName:!1,showPlaylistName:!1,showPlayButton:!0,showAddToQueueButton:!0,showDuration:!0,compactMode:!1,autoHideSongsWhenEmpty:!1},jukebox:{playlistDisplay:"collapsed",songsDisplay:"expanded",queueDisplay:"expanded",showVolumeControl:!1,showProgressBar:!0,showPlaybackControls:!0,showSongActions:!0,enableSeek:!1,showEntityName:!1,showPlaylistName:!1,showPlayButton:!0,showAddToQueueButton:!0,showDuration:!0,compactMode:!1,autoHideSongsWhenEmpty:!1},minimal:{playlistDisplay:"hidden",songsDisplay:"hidden",queueDisplay:"hidden",showVolumeControl:!1,showProgressBar:!0,showPlaybackControls:!0,enableSeek:!1,showEntityName:!1,showPlaylistName:!1,showSongActions:!1,showPlayButton:!0,showAddToQueueButton:!0,showDuration:!0,compactMode:!1,autoHideSongsWhenEmpty:!0},custom:{}},lt=[{value:"simple",label:"Simple (Default)"},{value:"dj",label:"DJ Mode"},{value:"jukebox",label:"Jukebox Mode"},{value:"minimal",label:"Minimal"},{value:"custom",label:"Custom"}],ct=[{value:"expanded",label:"Expanded"},{value:"collapsed",label:"Collapsed"},{value:"hidden",label:"Hidden"}],ht=[{value:"auto",label:"Auto (show when has items)"},{value:"expanded",label:"Expanded"},{value:"collapsed",label:"Collapsed"},{value:"hidden",label:"Hidden"}];customElements.define("xschedule-card-editor",class extends nt{static get properties(){return{hass:{type:Object},config:{type:Object},_currentTab:{type:String}}}constructor(){super(),this._currentTab="general"}setConfig(t){if(!t)return void(this.config=t);const e=t.mode||"simple",s=at[e]||at.simple;this.config={entity:t.entity,mode:e,...s,...t}}render(){if(!this.config)return q``;const t="custom"===this.config.mode;return q`
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
            ${this._getMediaPlayerEntities().map(t=>q`
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
            ${lt.map(t=>q`
                <option value=${t.value} ?selected=${this.config.mode===t.value}>
                  ${t.label}
                </option>
              `)}
          </select>
          <div class="hint">
            ${this._getModeDescription(this.config.mode||"simple")}
          </div>
        </div>

        ${t?q`
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
            `:q`
              <div class="preset-info">
                <ha-icon icon="mdi:information"></ha-icon>
                <p>
                  This preset mode has predefined settings.
                  Switch to <strong>Custom</strong> mode to configure individual options.
                </p>
              </div>
            `}
      </div>
    `}_renderGeneralTab(){return q`
      <div class="tab-content">
        <h3>Display Options</h3>

        <div class="form-group">
          <label for="playlistDisplay">Playlist Display</label>
          <select
            id="playlistDisplay"
            .value=${this.config.playlistDisplay||"collapsed"}
            @change=${this._valueChanged}
          >
            ${ct.map(t=>q`
                <option value=${t.value} ?selected=${(this.config.playlistDisplay||"collapsed")===t.value}>
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
            ${ct.map(t=>q`
                <option value=${t.value} ?selected=${(this.config.songsDisplay||"collapsed")===t.value}>
                  ${t.label}
                </option>
              `)}
          </select>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked=${this.config.autoHideSongsWhenEmpty||!1}
              @change=${t=>this._checkboxChanged("autoHideSongsWhenEmpty",t)}
            />
            Auto-hide song list when empty or single song
          </label>
          <div class="hint">Hides the song list when there are 0 or 1 songs</div>
        </div>

        <div class="form-group">
          <label for="queueDisplay">Queue Display</label>
          <select
            id="queueDisplay"
            .value=${this.config.queueDisplay||"auto"}
            @change=${this._valueChanged}
          >
            ${ht.map(t=>q`
                <option value=${t.value} ?selected=${(this.config.queueDisplay||"auto")===t.value}>
                  ${t.label}
                </option>
              `)}
          </select>
        </div>
      </div>
    `}_renderAppearanceTab(){return q`
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
    `}_renderControlsTab(){return q`
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
    `}_renderAdvancedTab(){return q`
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
    `}_getMediaPlayerEntities(){return this.hass?Object.values(this.hass.states).filter(t=>t.entity_id.startsWith("media_player.")).sort((t,e)=>{const s=t.entity_id.includes("xschedule")||void 0!==t.attributes.playlist_songs,i=e.entity_id.includes("xschedule")||void 0!==e.attributes.playlist_songs;if(s&&!i)return-1;if(!s&&i)return 1;const o=t.attributes.friendly_name||t.entity_id,n=e.attributes.friendly_name||e.entity_id;return o.localeCompare(n)}):[]}_getModeDescription(t){return{simple:"Best for basic playback. Shows playlist selector and playback controls.",dj:"Best for live performance. Shows all playlists expanded, queue prominent, and song actions visible.",jukebox:"Best for party mode. Shows all songs expanded with prominent queue section.",minimal:"Best for small spaces. Shows only playback controls and now playing info.",custom:"Unlock all configuration options for complete customization."}[t]||""}_selectTab(t){this._currentTab=t,this.requestUpdate()}_entityChanged(t){this._updateConfig({entity:t.target.value})}_modeChanged(t){const e=t.target.value,s=new Set(Object.keys(at.simple)),i={};for(const t of s)void 0!==this.config[t]&&(i[t]=this.config[t]);const o={};for(const t in this.config)"entity"===t||"mode"===t||s.has(t)||(o[t]=this.config[t]);let n;if("custom"===e)n=i;else{n=at[e]||at.simple}const r={...o,entity:this.config.entity,mode:e,...n};this.config=r;const a=new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0});this.dispatchEvent(a)}_valueChanged(t){const e=t.target.id,s=t.target.value;this._updateConfig({[e]:s})}_checkboxChanged(t,e){this._updateConfig({[t]:e.target.checked})}_songActionsParentChanged(t){const e=t.target.checked;this._updateConfig({showSongActions:e,showPlayButton:e,showAddToQueueButton:e})}_songActionsChildChanged(t,e){const s={[t]:e.target.checked},i="showPlayButton"===t?e.target.checked:!1!==this.config.showPlayButton,o="showAddToQueueButton"===t?e.target.checked:!1!==this.config.showAddToQueueButton;s.showSongActions=!(!i||!o)||!(!i&&!o),this._updateConfig(s)}_getSongActionsIndeterminate(){return!1!==this.config.showPlayButton!==(!1!==this.config.showAddToQueueButton)}_resetToDefaults(){if(confirm("Reset all settings to Simple mode defaults?")){const t="simple",e=at[t]||at.simple,s=new Set(Object.keys(at.simple)),i={};for(const t in this.config)"entity"===t||"mode"===t||s.has(t)||(i[t]=this.config[t]);const o={...i,entity:this.config.entity,mode:t,...e};this.config=o;const n=new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0});this.dispatchEvent(n)}}_updateConfig(t){this.config={...this.config,...t};const e=new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0});this.dispatchEvent(e)}static get styles(){return n`
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
    `}});
