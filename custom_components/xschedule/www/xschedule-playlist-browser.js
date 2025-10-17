/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),i=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const s=this.t;if(e&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=i.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&i.set(s,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new o(i,t,s)},r=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:l,defineProperty:a,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:d,getPrototypeOf:p}=Object,u=globalThis,y=u.trustedTypes,g=y?y.emptyScript:"",f=u.reactiveElementPolyfillSupport,_=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},m=(t,e)=>!l(t,e),v={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:m};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let A=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=v){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&a(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:o}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const n=i?.call(this);o?.call(this,e),this.requestUpdate(t,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??v}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const t=this.properties,e=[...h(t),...d(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(r(t))}else void 0!==t&&e.push(r(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const s=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((s,i)=>{if(e)s.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of i){const i=document.createElement("style"),o=t.litNonce;void 0!==o&&i.setAttribute("nonce",o),i.textContent=e.cssText,s.appendChild(i)}})(s,this.constructor.elementStyles),s}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const o=(void 0!==s.converter?.toAttribute?s.converter:$).toAttribute(e,s.type);this._$Em=t,null==o?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=i;const n=o.fromAttribute(e,t.type);this[i]=n??this._$Ej?.get(i)??n,this._$Em=null}}requestUpdate(t,e,s){if(void 0!==t){const i=this.constructor,o=this[t];if(s??=i.getPropertyOptions(t),!((s.hasChanged??m)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==o||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[_("elementProperties")]=new Map,A[_("finalized")]=new Map,f?.({ReactiveElement:A}),(u.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const S=globalThis,b=S.trustedTypes,x=b?b.createPolicy("lit-html",{createHTML:t=>t}):void 0,w="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+E,P=`<${C}>`,T=document,O=()=>T.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,k=Array.isArray,M="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,B=/-->/g,H=/>/g,R=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,j=/"/g,z=/^(?:script|style|textarea|title)$/i,L=(t=>(e,...s)=>({_$litType$:t,strings:e,values:s}))(1),I=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),W=new WeakMap,F=T.createTreeWalker(T,129);function q(t,e){if(!k(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==x?x.createHTML(e):e}const J=(t,e)=>{const s=t.length-1,i=[];let o,n=2===e?"<svg>":3===e?"<math>":"",r=N;for(let e=0;e<s;e++){const s=t[e];let l,a,c=-1,h=0;for(;h<s.length&&(r.lastIndex=h,a=r.exec(s),null!==a);)h=r.lastIndex,r===N?"!--"===a[1]?r=B:void 0!==a[1]?r=H:void 0!==a[2]?(z.test(a[2])&&(o=RegExp("</"+a[2],"g")),r=R):void 0!==a[3]&&(r=R):r===R?">"===a[0]?(r=o??N,c=-1):void 0===a[1]?c=-2:(c=r.lastIndex-a[2].length,l=a[1],r=void 0===a[3]?R:'"'===a[3]?j:D):r===j||r===D?r=R:r===B||r===H?r=N:(r=R,o=void 0);const d=r===R&&t[e+1].startsWith("/>")?" ":"";n+=r===N?s+P:c>=0?(i.push(l),s.slice(0,c)+w+s.slice(c)+E+d):s+E+(-2===c?e:d)}return[q(t,n+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class K{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0;const r=t.length-1,l=this.parts,[a,c]=J(t,e);if(this.el=K.createElement(a,s),F.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=F.nextNode())&&l.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(w)){const e=c[n++],s=i.getAttribute(t).split(E),r=/([.?@])?(.*)/.exec(e);l.push({type:1,index:o,name:r[2],strings:s,ctor:"."===r[1]?X:"?"===r[1]?tt:"@"===r[1]?et:Q}),i.removeAttribute(t)}else t.startsWith(E)&&(l.push({type:6,index:o}),i.removeAttribute(t));if(z.test(i.tagName)){const t=i.textContent.split(E),e=t.length-1;if(e>0){i.textContent=b?b.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],O()),F.nextNode(),l.push({type:2,index:++o});i.append(t[e],O())}}}else if(8===i.nodeType)if(i.data===C)l.push({type:2,index:o});else{let t=-1;for(;-1!==(t=i.data.indexOf(E,t+1));)l.push({type:7,index:o}),t+=E.length-1}o++}}static createElement(t,e){const s=T.createElement("template");return s.innerHTML=t,s}}function Z(t,e,s=t,i){if(e===I)return e;let o=void 0!==i?s._$Co?.[i]:s._$Cl;const n=U(e)?void 0:e._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),void 0===n?o=void 0:(o=new n(t),o._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=o:s._$Cl=o),void 0!==o&&(e=Z(t,o._$AS(t,e.values),o,i)),e}class Y{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??T).importNode(e,!0);F.currentNode=i;let o=F.nextNode(),n=0,r=0,l=s[0];for(;void 0!==l;){if(n===l.index){let e;2===l.type?e=new G(o,o.nextSibling,this,t):1===l.type?e=new l.ctor(o,l.name,l.strings,this,t):6===l.type&&(e=new st(o,this,t)),this._$AV.push(e),l=s[++r]}n!==l?.index&&(o=F.nextNode(),n++)}return F.currentNode=T,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class G{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Z(this,t,e),U(t)?t===V||null==t||""===t?(this._$AH!==V&&this._$AR(),this._$AH=V):t!==this._$AH&&t!==I&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>k(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==V&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=K.createElement(q(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Y(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=W.get(t.strings);return void 0===e&&W.set(t.strings,e=new K(t)),e}k(t){k(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const o of t)i===e.length?e.push(s=new G(this.O(O()),this.O(O()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=V,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=V}_$AI(t,e=this,s,i){const o=this.strings;let n=!1;if(void 0===o)t=Z(this,t,e,0),n=!U(t)||t!==this._$AH&&t!==I,n&&(this._$AH=t);else{const i=t;let r,l;for(t=o[0],r=0;r<o.length-1;r++)l=Z(this,i[s+r],e,r),l===I&&(l=this._$AH[r]),n||=!U(l)||l!==this._$AH[r],l===V?t=V:t!==V&&(t+=(l??"")+o[r+1]),this._$AH[r]=l}n&&!i&&this.j(t)}j(t){t===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class X extends Q{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===V?void 0:t}}class tt extends Q{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==V)}}class et extends Q{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??V)===I)return;const s=this._$AH,i=t===V&&s!==V||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==V&&(s===V||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}}const it=S.litHtmlPolyfillSupport;it?.(K,G),(S.litHtmlVersions??=[]).push("3.3.1");const ot=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class nt extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let o=i._$litPart$;if(void 0===o){const t=s?.renderBefore??null;i._$litPart$=o=new G(e.insertBefore(O(),t),t,void 0,s??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}}nt._$litElement$=!0,nt.finalized=!0,ot.litElementHydrateSupport?.({LitElement:nt});const rt=ot.litElementPolyfillSupport;rt?.({LitElement:nt}),(ot.litElementVersions??=[]).push("4.2.1");class lt extends nt{static get properties(){return{hass:{type:Object},config:{type:Object},_entity:{type:Object},_playlists:{type:Array},_playlistSchedules:{type:Object},_loading:{type:Boolean}}}constructor(){super(),this._playlists=[],this._playlistSchedules={},this._loading=!0,this._lastSourceList=null,this._initialFetchDone=!1}setConfig(t){if(!t.entity)throw new Error("You need to define an entity");this.config={entity:t.entity,sort_by:t.sort_by||"schedule",show_duration:!1!==t.show_duration,show_status:!1!==t.show_status,compact_mode:t.compact_mode||!1,confirm_play:!1!==t.confirm_play,...t}}set hass(t){this._hass=t;const e=this.config.entity;if(this._entity=t.states[e],console.log("xSchedule Playlist Browser: hass setter called, entity:",this._entity),this._entity){const t=this._entity.attributes.source_list||[];console.log("xSchedule Playlist Browser: newSourceList:",t),console.log("xSchedule Playlist Browser: _lastSourceList:",this._lastSourceList),console.log("xSchedule Playlist Browser: _initialFetchDone:",this._initialFetchDone);const e=JSON.stringify(this._lastSourceList)!==JSON.stringify(t),s=!this._initialFetchDone||e;console.log("xSchedule Playlist Browser: sourceListChanged:",e),console.log("xSchedule Playlist Browser: shouldFetch:",s),s&&t.length>0&&(this._playlists=t,this._lastSourceList=[...t],this._initialFetchDone=!0,console.log("xSchedule Playlist Browser: Calling _fetchScheduleInfo()"),this._fetchScheduleInfo())}}async _fetchScheduleInfo(){this._loading=!0;const t={};console.log("xSchedule Playlist Browser: Fetching schedule info for playlists:",this._playlists);for(const e of this._playlists)try{const s=await this._hass.callWS({type:"call_service",domain:"xschedule",service:"get_playlist_schedules",service_data:{entity_id:this.config.entity,playlist:e},return_response:!0});if(console.log(`xSchedule Playlist Browser: Response for "${e}":`,s),s&&s.response&&s.response.schedules&&s.response.schedules.length>0){const i=s.response.schedules;console.log(`xSchedule Playlist Browser: Found ${i.length} schedules for "${e}"`);let o=null;const n=i.find(t=>"TRUE"===t.active||"NOW!"===t.nextactive);if(n)o=n,console.log(`xSchedule Playlist Browser: Using active schedule for "${e}":`,o.name);else{const t=i.filter(t=>{const e=t.nextactive;return e&&"A long time from now"!==e&&"N/A"!==e&&e.match(/\d{4}-\d{2}-\d{2}/)}).sort((t,e)=>new Date(t.nextactive)-new Date(e.nextactive));o=t.length>0?t[0]:i[0],o&&console.log(`xSchedule Playlist Browser: Using soonest schedule for "${e}":`,o.name,o.nextactive)}if(!o){console.log(`xSchedule Playlist Browser: No valid schedule found for "${e}"`);continue}console.log(`xSchedule Playlist Browser: Schedule object for "${e}":`,o),console.log("xSchedule Playlist Browser: Schedule keys:",Object.keys(o));const r=await this._hass.callWS({type:"call_service",domain:"xschedule",service:"get_playlist_steps",service_data:{entity_id:this.config.entity,playlist:e},return_response:!0});let l=0;r&&r.response&&r.response.steps&&(l=r.response.steps.reduce((t,e)=>t+(e.duration||0),0)),t[e]={nextActiveTime:o.nextactive,enabled:o.enabled,active:o.active,duration:l},console.log(`xSchedule Playlist Browser: Added schedule for "${e}":`,t[e])}}catch(t){console.error(`Failed to fetch schedule for ${e}:`,t)}this._playlistSchedules=t,console.log("xSchedule Playlist Browser: All schedules:",this._playlistSchedules),this._loading=!1,this.requestUpdate()}render(){return this._entity?L`
      <ha-card>
        <div class="card-header">
          <h1 class="card-title">
            <ha-icon icon="mdi:playlist-music"></ha-icon>
            xSchedule Playlists
          </h1>
          ${this._renderSortSelector()}
        </div>

        <div class="card-content ${this.config.compact_mode?"compact":""}">
          ${this._loading?L`
                <div class="loading">
                  <ha-circular-progress active></ha-circular-progress>
                  <p>Loading playlists...</p>
                </div>
              `:this._renderPlaylists()}
        </div>
      </ha-card>
    `:L`
        <ha-card>
          <div class="card-content error">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            <p>Entity ${this.config.entity} not found</p>
          </div>
        </ha-card>
      `}_renderSortSelector(){return L`
      <select
        class="sort-select"
        .value=${this.config.sort_by}
        @change=${this._handleSortChange}
      >
        <option value="schedule">By Schedule</option>
        <option value="alphabetical">Alphabetical</option>
      </select>
    `}_renderPlaylists(){if(0===this._playlists.length)return L`
        <div class="empty-state">
          <ha-icon icon="mdi:playlist-music-outline"></ha-icon>
          <p>No playlists found</p>
        </div>
      `;const t=this._getSortedPlaylists(),e=this._entity.attributes.playlist;return L`
      <div class="playlist-list">
        ${t.map(t=>this._renderPlaylistItem(t,t===e))}
      </div>
    `}_renderPlaylistItem(t,e){const s=this._playlistSchedules[t],i=s&&s.nextActiveTime;return L`
      <div class="playlist-item ${e?"playing":""} ${this.config.compact_mode?"compact":""}">
        <div class="playlist-header">
          <ha-icon
            icon=${e?"mdi:play-circle":i?"mdi:clock-outline":"mdi:playlist-music"}
            class="playlist-icon"
          ></ha-icon>
          <div class="playlist-name">${t}</div>
        </div>

        ${this._renderScheduleInfo(e,s)}
      </div>
    `}_renderScheduleInfo(t,e){if(t)return L`
        <div class="playlist-info-line playing-status">
          [Playing]
        </div>
      `;if(e&&e.nextActiveTime){const t=this._formatScheduleTime(e.nextActiveTime);return L`
        <div class="playlist-info-line schedule-time">
          [${t}]
        </div>
      `}return""}_getSortedPlaylists(){const t=[...this._playlists],e=this._entity.attributes.playlist;return"schedule"===this.config.sort_by?t.sort((t,s)=>{if(t===e)return-1;if(s===e)return 1;const i=this._playlistSchedules[t],o=this._playlistSchedules[s];return i?.nextActiveTime&&o?.nextActiveTime?new Date(i.nextActiveTime)-new Date(o.nextActiveTime):i?.nextActiveTime?-1:o?.nextActiveTime?1:t.localeCompare(s)}):t.sort((t,s)=>t===e?-1:s===e?1:t.localeCompare(s))}_formatScheduleTime(t){const e=new Date(t),s=e-new Date,i=Math.ceil(s/864e5),o=e.getHours(),n=o>=12?"PM":"AM",r=`${o%12||12}:${e.getMinutes().toString().padStart(2,"0")} ${n}`;if(0===i)return`Today ${r}`;if(1===i)return`Tomorrow ${r}`;if(i<=7){return`${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][e.getDay()]} ${r}`}return`${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][e.getMonth()]} ${e.getDate()} ${r}`}_formatDuration(t){if(!t)return"0:00";const e=Math.floor(t/3600),s=Math.floor(t%3600/60),i=Math.floor(t%60);return e>0?`${e}:${s.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`:`${s}:${i.toString().padStart(2,"0")}`}_handleSortChange(t){this.config={...this.config,sort_by:t.target.value},this.requestUpdate()}getCardSize(){return this.config.compact_mode?4:6}static get styles(){return n`
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
    `}}customElements.define("xschedule-playlist-browser-editor",class extends nt{static get properties(){return{hass:{type:Object},config:{type:Object}}}setConfig(t){this.config=t}_valueChanged(t){if(!this.config||!this.hass)return;const e=t.target,s="checkbox"===e.type?e.checked:e.value;if(this.config[e.configValue]===s)return;const i={...this.config,[e.configValue]:s},o=new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0});this.dispatchEvent(o)}render(){if(!this.hass||!this.config)return L``;const t=Object.keys(this.hass.states).filter(t=>t.startsWith("media_player.")&&(void 0!==this.hass.states[t].attributes.playlist_songs||t.includes("xschedule"))).sort();return L`
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
            ${t.map(t=>L`
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
    `}}),customElements.define("xschedule-playlist-browser",lt),lt.getConfigElement=function(){return document.createElement("xschedule-playlist-browser-editor")},lt.getStubConfig=function(){return{entity:"",sort_by:"schedule",show_duration:!0,show_status:!0,compact_mode:!1,confirm_play:!0}},window.customCards=window.customCards||[],window.customCards.push({type:"xschedule-playlist-browser",name:"xSchedule Playlist Browser",description:"Browse and select xSchedule playlists with schedule information",preview:!0});
