/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;let o=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const e=void 0!==i&&1===i.length;e&&(t=s.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&s.set(i,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new o(s,t,i)},r=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:a,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:d,getPrototypeOf:p}=Object,u=globalThis,g=u.trustedTypes,y=g?g.emptyScript:"",_=u.reactiveElementPolyfillSupport,f=(t,e)=>t,m={toAttribute(t,e){switch(e){case Boolean:t=t?y:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!a(t,e),v={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:$};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=v){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&l(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const n=s?.call(this);o?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??v}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...h(t),...d(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(r(t))}else void 0!==t&&e.push(r(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,s)=>{if(e)i.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of s){const s=document.createElement("style"),o=t.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=e.cssText,i.appendChild(s)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:m).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:m;this._$Em=s;const n=o.fromAttribute(e,t.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(t,e,i){if(void 0!==t){const s=this.constructor,o=this[t];if(i??=s.getPropertyOptions(t),!((i.hasChanged??$)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==o||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[f("elementProperties")]=new Map,b[f("finalized")]=new Map,_?.({ReactiveElement:b}),(u.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A=globalThis,x=A.trustedTypes,S=x?x.createPolicy("lit-html",{createHTML:t=>t}):void 0,w="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+E,P=`<${C}>`,T=document,k=()=>T.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,N=Array.isArray,U="[ \t\n\f\r]",M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,R=/>/g,D=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),z=/'/g,j=/"/g,L=/^(?:script|style|textarea|title)$/i,B=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),W=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),I=new WeakMap,V=T.createTreeWalker(T,129);function F(t,e){if(!N(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const J=(t,e)=>{const i=t.length-1,s=[];let o,n=2===e?"<svg>":3===e?"<math>":"",r=M;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,h=0;for(;h<i.length&&(r.lastIndex=h,l=r.exec(i),null!==l);)h=r.lastIndex,r===M?"!--"===l[1]?r=H:void 0!==l[1]?r=R:void 0!==l[2]?(L.test(l[2])&&(o=RegExp("</"+l[2],"g")),r=D):void 0!==l[3]&&(r=D):r===D?">"===l[0]?(r=o??M,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?D:'"'===l[3]?j:z):r===j||r===z?r=D:r===H||r===R?r=M:(r=D,o=void 0);const d=r===D&&t[e+1].startsWith("/>")?" ":"";n+=r===M?i+P:c>=0?(s.push(a),i.slice(0,c)+w+i.slice(c)+E+d):i+E+(-2===c?e:d)}return[F(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class K{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,n=0;const r=t.length-1,a=this.parts,[l,c]=J(t,e);if(this.el=K.createElement(l,i),V.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=V.nextNode())&&a.length<r;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(w)){const e=c[n++],i=s.getAttribute(t).split(E),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:o,name:r[2],strings:i,ctor:"."===r[1]?X:"?"===r[1]?tt:"@"===r[1]?et:G}),s.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:o}),s.removeAttribute(t));if(L.test(s.tagName)){const t=s.textContent.split(E),e=t.length-1;if(e>0){s.textContent=x?x.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],k()),V.nextNode(),a.push({type:2,index:++o});s.append(t[e],k())}}}else if(8===s.nodeType)if(s.data===C)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(E,t+1));)a.push({type:7,index:o}),t+=E.length-1}o++}}static createElement(t,e){const i=T.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,s){if(e===W)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const n=O(e)?void 0:e._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),void 0===n?o=void 0:(o=new n(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=Q(t,o._$AS(t,e.values),o,s)),e}class Z{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??T).importNode(e,!0);V.currentNode=s;let o=V.nextNode(),n=0,r=0,a=i[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new Y(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new it(o,this,t)),this._$AV.push(e),a=i[++r]}n!==a?.index&&(o=V.nextNode(),n++)}return V.currentNode=T,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Y{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),O(t)?t===q||null==t||""===t?(this._$AH!==q&&this._$AR(),this._$AH=q):t!==this._$AH&&t!==W&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>N(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==q&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=K.createElement(F(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Z(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=I.get(t.strings);return void 0===e&&I.set(t.strings,e=new K(t)),e}k(t){N(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new Y(this.O(k()),this.O(k()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class G{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=q,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(t,e=this,i,s){const o=this.strings;let n=!1;if(void 0===o)t=Q(this,t,e,0),n=!O(t)||t!==this._$AH&&t!==W,n&&(this._$AH=t);else{const s=t;let r,a;for(t=o[0],r=0;r<o.length-1;r++)a=Q(this,s[i+r],e,r),a===W&&(a=this._$AH[r]),n||=!O(a)||a!==this._$AH[r],a===q?t=q:t!==q&&(t+=(a??"")+o[r+1]),this._$AH[r]=a}n&&!s&&this.j(t)}j(t){t===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class X extends G{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===q?void 0:t}}class tt extends G{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==q)}}class et extends G{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??q)===W)return;const i=this._$AH,s=t===q&&i!==q||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==q&&(i===q||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class it{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const st=A.litHtmlPolyfillSupport;st?.(K,Y),(A.litHtmlVersions??=[]).push("3.3.1");const ot=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class nt extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new Y(e.insertBefore(k(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}}nt._$litElement$=!0,nt.finalized=!0,ot.litElementHydrateSupport?.({LitElement:nt});const rt=ot.litElementPolyfillSupport;rt?.({LitElement:nt}),(ot.litElementVersions??=[]).push("4.2.1");class at extends nt{static get properties(){return{hass:{type:Object},config:{type:Object},_entity:{type:Object},_playlists:{type:Array},_playlistSchedules:{type:Object},_loading:{type:Boolean},_expandedPlaylist:{type:String},_playlistSongs:{type:Object}}}constructor(){super(),this._playlists=[],this._playlistSchedules={},this._loading=!0,this._lastSourceList=null,this._initialFetchDone=!1,this._expandedPlaylist=null,this._playlistSongs={}}setConfig(t){if(!t.entity)throw new Error("You need to define an entity");this.config={entity:t.entity,sort_by:t.sort_by||"schedule",show_duration:!1!==t.show_duration,show_status:!1!==t.show_status,compact_mode:t.compact_mode||!1,confirm_play:!1!==t.confirm_play,...t}}set hass(t){this._hass=t;const e=this.config.entity;if(this._entity=t.states[e],this._entity){const t=this._entity.attributes.source_list||[],e=JSON.stringify(this._lastSourceList)!==JSON.stringify(t);(!this._initialFetchDone||e)&&t.length>0&&(this._playlists=t,this._lastSourceList=[...t],this._initialFetchDone=!0,this._fetchScheduleInfo())}}async _fetchScheduleInfo(){this._loading=!0;const t={};for(const e of this._playlists)try{const i=await this._hass.callWS({type:"call_service",domain:"xschedule",service:"get_playlist_schedules",service_data:{entity_id:this.config.entity,playlist:e},return_response:!0});if(i&&i.response&&i.response.schedules&&i.response.schedules.length>0){const s=i.response.schedules;let o=null;const n=s.find(t=>"TRUE"===t.active||"NOW!"===t.nextactive);if(n)o=n;else{const t=s.filter(t=>{const e=t.nextactive;return e&&"A long time from now"!==e&&"N/A"!==e&&e.match(/\d{4}-\d{2}-\d{2}/)}).sort((t,e)=>new Date(t.nextactive)-new Date(e.nextactive));o=t.length>0?t[0]:s[0]}if(!o)continue;const r=await this._hass.callWS({type:"call_service",domain:"xschedule",service:"get_playlist_steps",service_data:{entity_id:this.config.entity,playlist:e},return_response:!0});let a=0;r&&r.response&&r.response.steps&&(a=r.response.steps.reduce((t,e)=>t+(e.duration||0),0)),t[e]={nextActiveTime:o.nextactive,enabled:o.enabled,active:o.active,duration:a}}}catch(t){console.error(`Failed to fetch schedule for ${e}:`,t)}this._playlistSchedules=t,this._loading=!1,this.requestUpdate()}render(){return this._entity?B`
      <ha-card>
        <div class="card-header">
          <h1 class="card-title">
            <ha-icon icon="mdi:playlist-music"></ha-icon>
            xSchedule Playlists
          </h1>
          ${this._renderSortSelector()}
        </div>

        <div class="card-content ${this.config.compact_mode?"compact":""}">
          ${this._loading?B`
                <div class="loading">
                  <ha-circular-progress active></ha-circular-progress>
                  <p>Loading playlists...</p>
                </div>
              `:this._renderPlaylists()}
        </div>
      </ha-card>
    `:B`
        <ha-card>
          <div class="card-content error">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            <p>Entity ${this.config.entity} not found</p>
          </div>
        </ha-card>
      `}_renderSortSelector(){return B`
      <select
        class="sort-select"
        .value=${this.config.sort_by}
        @change=${this._handleSortChange}
      >
        <option value="schedule">By Schedule</option>
        <option value="alphabetical">Alphabetical</option>
      </select>
    `}_renderPlaylists(){if(0===this._playlists.length)return B`
        <div class="empty-state">
          <ha-icon icon="mdi:playlist-music-outline"></ha-icon>
          <p>No playlists found</p>
        </div>
      `;const t=this._getSortedPlaylists(),e=this._entity.attributes.playlist;return B`
      <div class="playlist-list">
        ${t.map(t=>this._renderPlaylistItem(t,t===e))}
      </div>
    `}_renderPlaylistItem(t,e){const i=this._playlistSchedules[t],s=i&&i.nextActiveTime,o=this._expandedPlaylist===t;return B`
      <div class="playlist-item ${e?"playing":""} ${this.config.compact_mode?"compact":""} ${o?"expanded":""}">
        <div class="playlist-header" @click=${()=>this._togglePlaylist(t)}>
          <ha-icon
            icon=${e?"mdi:play-circle":s?"mdi:clock-outline":"mdi:playlist-music"}
            class="playlist-icon"
          ></ha-icon>
          <div class="playlist-name">${t}</div>
          <ha-icon
            icon=${o?"mdi:chevron-up":"mdi:chevron-down"}
            class="expand-icon"
          ></ha-icon>
        </div>

        ${this._renderScheduleInfo(e,i)}
        ${o?this._renderSongList(t):""}
      </div>
    `}_renderScheduleInfo(t,e){if(t||e&&"NOW!"===e.nextActiveTime)return B`
        <div class="playlist-info-line playing-status">
          [Playing]
        </div>
      `;if(e&&e.nextActiveTime){if("A long time from now"===e.nextActiveTime||"N/A"===e.nextActiveTime)return"";const t=this._formatScheduleTime(e.nextActiveTime);return B`
        <div class="playlist-info-line schedule-time">
          [${t}]
        </div>
      `}return""}_getSortedPlaylists(){const t=[...this._playlists],e=this._entity.attributes.playlist;return"schedule"===this.config.sort_by?t.sort((t,i)=>{if(t===e)return-1;if(i===e)return 1;const s=this._playlistSchedules[t],o=this._playlistSchedules[i],n="NOW!"===s?.nextActiveTime,r="NOW!"===o?.nextActiveTime;if(n&&!r)return-1;if(!n&&r)return 1;if(s?.nextActiveTime&&o?.nextActiveTime){const t="A long time from now"!==s.nextActiveTime&&"N/A"!==s.nextActiveTime&&"NOW!"!==s.nextActiveTime,e="A long time from now"!==o.nextActiveTime&&"N/A"!==o.nextActiveTime&&"NOW!"!==o.nextActiveTime;if(t&&e)return new Date(s.nextActiveTime)-new Date(o.nextActiveTime);if(t)return-1;if(e)return 1}return s?.nextActiveTime?-1:o?.nextActiveTime?1:t.localeCompare(i)}):t.sort((t,i)=>t===e?-1:i===e?1:t.localeCompare(i))}_formatScheduleTime(t){const e=new Date(t),i=e-new Date,s=Math.ceil(i/864e5),o=e.getHours(),n=o>=12?"PM":"AM",r=`${o%12||12}:${e.getMinutes().toString().padStart(2,"0")} ${n}`;if(0===s)return`Today ${r}`;if(1===s)return`Tomorrow ${r}`;if(s<=7){return`${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][e.getDay()]} ${r}`}return`${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][e.getMonth()]} ${e.getDate()} ${r}`}_formatDuration(t){if(!t)return"0:00";const e=Math.floor(t/3600),i=Math.floor(t%3600/60),s=Math.floor(t%60);return e>0?`${e}:${i.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`:`${i}:${s.toString().padStart(2,"0")}`}async _togglePlaylist(t){this._expandedPlaylist===t?this._expandedPlaylist=null:(this._expandedPlaylist=t,this._playlistSongs[t]||await this._fetchPlaylistSongs(t)),this.requestUpdate()}async _fetchPlaylistSongs(t){try{const e=await this._hass.callWS({type:"call_service",domain:"xschedule",service:"get_playlist_steps",service_data:{entity_id:this.config.entity,playlist:t},return_response:!0});e&&e.response&&e.response.steps&&(this._playlistSongs[t]=e.response.steps,this.requestUpdate())}catch(e){console.error(`Failed to fetch songs for ${t}:`,e),this._playlistSongs[t]=[]}}_renderSongList(t){const e=this._playlistSongs[t];return e?0===e.length?B`
        <div class="song-list empty">
          <p>No songs in this playlist</p>
        </div>
      `:B`
      <div class="song-list">
        ${e.map(e=>B`
          <div class="song-item-compact">
            <span class="song-name-compact">${e.name}</span>
            <button
              class="add-queue-btn-compact"
              @click=${i=>this._addSongToQueue(i,t,e.name)}
              title="Add to queue"
            >
              <ha-icon icon="mdi:playlist-plus"></ha-icon>
            </button>
          </div>
        `)}
      </div>
    `:B`
        <div class="song-list loading">
          <ha-circular-progress active size="small"></ha-circular-progress>
        </div>
      `}async _addSongToQueue(t,e,i){t.stopPropagation();try{await this._hass.callService("xschedule","add_to_queue",{entity_id:this.config.entity,playlist:e,song:i})}catch(t){console.error("Failed to add to queue:",t)}}_handleSortChange(t){this.config={...this.config,sort_by:t.target.value},this.requestUpdate()}getCardSize(){return this.config.compact_mode?4:6}static get styles(){return n`
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

      .sort-select {
        padding: 8px 12px;
        font-size: 0.9em;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
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
        background: var(--accent-color);
        color: white;
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

      .playlist-info-line {
        font-size: 0.9em;
        margin-top: 4px;
        margin-left: 36px;
        text-align: right;
      }

      .playlist-info-line.playing-status {
        color: var(--accent-color);
        font-weight: 600;
      }

      .playlist-item.playing .playlist-info-line.playing-status {
        color: white;
      }

      .playlist-info-line.schedule-time {
        color: var(--secondary-text-color);
      }

      .playlist-item.playing .playlist-info-line.schedule-time {
        color: rgba(255, 255, 255, 0.8);
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

      .add-queue-btn-compact {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
        flex-shrink: 0;
      }

      .add-queue-btn-compact:hover {
        background: var(--dark-primary-color);
      }

      .add-queue-btn-compact ha-icon {
        --mdc-icon-size: 18px;
      }

      .playlist-item.playing .song-list {
        border-top-color: rgba(255, 255, 255, 0.3);
      }

      .playlist-item.playing .song-item-compact {
        background: rgba(255, 255, 255, 0.1);
      }

      .playlist-item.playing .song-item-compact:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .playlist-item.playing .song-name-compact {
        color: white;
      }

      @media (max-width: 768px) {
        .card-header {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        .sort-select {
          width: 100%;
        }

        .playlist-info-line {
          font-size: 0.85em;
        }
      }
    `}}customElements.define("xschedule-playlist-browser-editor",class extends nt{static get properties(){return{hass:{type:Object},config:{type:Object}}}setConfig(t){this.config=t}_valueChanged(t){if(!this.config||!this.hass)return;const e=t.target,i="checkbox"===e.type?e.checked:e.value;if(this.config[e.configValue]===i)return;const s={...this.config,[e.configValue]:i},o=new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0});this.dispatchEvent(o)}render(){if(!this.hass||!this.config)return B``;const t=Object.keys(this.hass.states).filter(t=>t.startsWith("media_player.")&&(void 0!==this.hass.states[t].attributes.playlist_songs||t.includes("xschedule"))).sort();return B`
      <div class="card-config">
        <div class="form-group">
          <label for="entity">Entity (Required)</label>
          <select
            id="entity"
            .configValue=${"entity"}
            .value=${this.config.entity||""}
            @change=${this._valueChanged}
          >
            <option value="">Select an xSchedule entity...</option>
            ${t.map(t=>B`
              <option value="${t}" ?selected=${this.config.entity===t}>
                ${this.hass.states[t].attributes.friendly_name||t}
              </option>
            `)}
          </select>
        </div>

        <div class="form-group">
          <label for="sort_by">Sort By</label>
          <select
            id="sort_by"
            .configValue=${"sort_by"}
            .value=${this.config.sort_by||"schedule"}
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
              .configValue=${"show_duration"}
              .checked=${!1!==this.config.show_duration}
              @change=${this._valueChanged}
            />
            Show Duration
          </label>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              .configValue=${"show_status"}
              .checked=${!1!==this.config.show_status}
              @change=${this._valueChanged}
            />
            Show Status Badges
          </label>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              .configValue=${"compact_mode"}
              .checked=${this.config.compact_mode||!1}
              @change=${this._valueChanged}
            />
            Compact Mode
          </label>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              .configValue=${"confirm_play"}
              .checked=${!1!==this.config.confirm_play}
              @change=${this._valueChanged}
            />
            Confirm Before Playing
          </label>
        </div>
      </div>
    `}static get styles(){return n`
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
    `}}),customElements.define("xschedule-playlist-browser",at),at.getConfigElement=function(){return document.createElement("xschedule-playlist-browser-editor")},at.getStubConfig=function(){return{entity:"",sort_by:"schedule",show_duration:!0,show_status:!0,compact_mode:!1,confirm_play:!0}},window.customCards=window.customCards||[],window.customCards.push({type:"xschedule-playlist-browser",name:"xSchedule Playlist Browser",description:"Browse and select xSchedule playlists with schedule information",preview:!0});
