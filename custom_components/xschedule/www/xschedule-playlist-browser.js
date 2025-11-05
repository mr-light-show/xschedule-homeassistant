/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),i=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const s=this.t;if(e&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=i.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&i.set(s,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new n(i,t,s)},r=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:a,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:d,getPrototypeOf:p}=Object,u=globalThis,_=u.trustedTypes,y=_?_.emptyScript:"",g=u.reactiveElementPolyfillSupport,f=(t,e)=>t,m={toAttribute(t,e){switch(e){case Boolean:t=t?y:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},v=(t,e)=>!a(t,e),$={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:v};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&l(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const o=i?.call(this);n?.call(this,e),this.requestUpdate(t,o,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...h(t),...d(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(r(t))}else void 0!==t&&e.push(r(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const s=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((s,i)=>{if(e)s.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of i){const i=document.createElement("style"),n=t.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=e.cssText,s.appendChild(i)}})(s,this.constructor.elementStyles),s}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const n=(void 0!==s.converter?.toAttribute?s.converter:m).toAttribute(e,s.type);this._$Em=t,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:m;this._$Em=i;const o=n.fromAttribute(e,t.type);this[i]=o??this._$Ej?.get(i)??o,this._$Em=null}}requestUpdate(t,e,s){if(void 0!==t){const i=this.constructor,n=this[t];if(s??=i.getPropertyOptions(t),!((s.hasChanged??v)(n,e)||s.useDefault&&s.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:n},o){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==n||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[f("elementProperties")]=new Map,b[f("finalized")]=new Map,g?.({ReactiveElement:b}),(u.reactiveElementVersions??=[]).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const x=globalThis,A=x.trustedTypes,S=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,w="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,P="?"+E,C=`<${P}>`,T=document,k=()=>T.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,U=Array.isArray,N="[ \t\n\f\r]",M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,D=/>/g,R=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),z=/'/g,I=/"/g,j=/^(?:script|style|textarea|title)$/i,L=(t=>(e,...s)=>({_$litType$:t,strings:e,values:s}))(1),W=Symbol.for("lit-noChange"),B=Symbol.for("lit-nothing"),q=new WeakMap,V=T.createTreeWalker(T,129);function J(t,e){if(!U(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const F=(t,e)=>{const s=t.length-1,i=[];let n,o=2===e?"<svg>":3===e?"<math>":"",r=M;for(let e=0;e<s;e++){const s=t[e];let a,l,c=-1,h=0;for(;h<s.length&&(r.lastIndex=h,l=r.exec(s),null!==l);)h=r.lastIndex,r===M?"!--"===l[1]?r=H:void 0!==l[1]?r=D:void 0!==l[2]?(j.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=R):void 0!==l[3]&&(r=R):r===R?">"===l[0]?(r=n??M,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?R:'"'===l[3]?I:z):r===I||r===z?r=R:r===H||r===D?r=M:(r=R,n=void 0);const d=r===R&&t[e+1].startsWith("/>")?" ":"";o+=r===M?s+C:c>=0?(i.push(a),s.slice(0,c)+w+s.slice(c)+E+d):s+E+(-2===c?e:d)}return[J(t,o+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class Y{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let n=0,o=0;const r=t.length-1,a=this.parts,[l,c]=F(t,e);if(this.el=Y.createElement(l,s),V.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=V.nextNode())&&a.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(w)){const e=c[o++],s=i.getAttribute(t).split(E),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:r[2],strings:s,ctor:"."===r[1]?G:"?"===r[1]?tt:"@"===r[1]?et:X}),i.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:n}),i.removeAttribute(t));if(j.test(i.tagName)){const t=i.textContent.split(E),e=t.length-1;if(e>0){i.textContent=A?A.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],k()),V.nextNode(),a.push({type:2,index:++n});i.append(t[e],k())}}}else if(8===i.nodeType)if(i.data===P)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=i.data.indexOf(E,t+1));)a.push({type:7,index:n}),t+=E.length-1}n++}}static createElement(t,e){const s=T.createElement("template");return s.innerHTML=t,s}}function K(t,e,s=t,i){if(e===W)return e;let n=void 0!==i?s._$Co?.[i]:s._$Cl;const o=O(e)?void 0:e._$litDirective$;return n?.constructor!==o&&(n?._$AO?.(!1),void 0===o?n=void 0:(n=new o(t),n._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=n:s._$Cl=n),void 0!==n&&(e=K(t,n._$AS(t,e.values),n,i)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??T).importNode(e,!0);V.currentNode=i;let n=V.nextNode(),o=0,r=0,a=s[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new Z(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new st(n,this,t)),this._$AV.push(e),a=s[++r]}o!==a?.index&&(n=V.nextNode(),o++)}return V.currentNode=T,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class Z{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=B,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=K(this,t,e),O(t)?t===B||null==t||""===t?(this._$AH!==B&&this._$AR(),this._$AH=B):t!==this._$AH&&t!==W&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>U(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==B&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=Y.createElement(J(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Q(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new Y(t)),e}k(t){U(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const n of t)i===e.length?e.push(s=new Z(this.O(k()),this.O(k()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class X{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,n){this.type=1,this._$AH=B,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=B}_$AI(t,e=this,s,i){const n=this.strings;let o=!1;if(void 0===n)t=K(this,t,e,0),o=!O(t)||t!==this._$AH&&t!==W,o&&(this._$AH=t);else{const i=t;let r,a;for(t=n[0],r=0;r<n.length-1;r++)a=K(this,i[s+r],e,r),a===W&&(a=this._$AH[r]),o||=!O(a)||a!==this._$AH[r],a===B?t=B:t!==B&&(t+=(a??"")+n[r+1]),this._$AH[r]=a}o&&!i&&this.j(t)}j(t){t===B?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class G extends X{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===B?void 0:t}}class tt extends X{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==B)}}class et extends X{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){if((t=K(this,t,e,0)??B)===W)return;const s=this._$AH,i=t===B&&s!==B||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==B&&(s===B||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){K(this,t)}}const it=x.litHtmlPolyfillSupport;it?.(Y,Z),(x.litHtmlVersions??=[]).push("3.3.1");const nt=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class ot extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let n=i._$litPart$;if(void 0===n){const t=s?.renderBefore??null;i._$litPart$=n=new Z(e.insertBefore(k(),t),t,void 0,s??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}}ot._$litElement$=!0,ot.finalized=!0,nt.litElementHydrateSupport?.({LitElement:ot});const rt=nt.litElementPolyfillSupport;rt?.({LitElement:ot}),(nt.litElementVersions??=[]).push("4.2.1");class at extends ot{static get properties(){return{hass:{type:Object},config:{type:Object},_entity:{type:Object},_playlists:{type:Array},_playlistSchedules:{type:Object},_loading:{type:Boolean},_expandedPlaylist:{type:String},_playlistSongs:{type:Object}}}constructor(){super(),this._playlists=[],this._playlistSchedules={},this._loading=!1,this._expandedPlaylist=null,this._playlistSongs={},this._updateInterval=null,this._initialLoad=!0,this._previousState=null,this._previousPlaylists=null,this._previousSchedules=null,this._previousExpandedPlaylist=null,this._previousPlaylistSongs=null,this._previousTimeUpdate=null,this._lastTimeUpdate=Date.now()}connectedCallback(){super.connectedCallback(),this._updateInterval=setInterval(()=>{this._lastTimeUpdate=Date.now(),this.requestUpdate()},3e5),this._hass&&this._subscribeToCacheEvents()}disconnectedCallback(){super.disconnectedCallback(),this._updateInterval&&(clearInterval(this._updateInterval),this._updateInterval=null),this._unsubscribeCacheEvents()}setConfig(t){if(!t.entity)throw new Error("You need to define an entity");this.config={entity:t.entity,sort_by:t.sort_by||"schedule",show_duration:!1!==t.show_duration,show_status:!1!==t.show_status,compact_mode:t.compact_mode||!1,confirm_play:!1!==t.confirm_play,...t}}set hass(t){const e=this._hass;this._hass=t,!e&&t&&this._subscribeToCacheEvents();const s=this.config.entity;if(this._entity=t.states[s],this._entity){const t=this._entity.attributes.source_list||[];if(JSON.stringify(this._playlists)!==JSON.stringify(t)&&(this._playlists=t,t.length>0)){const t=this._initialLoad;this._initialLoad&&(this._initialLoad=!1),this._fetchScheduleInfo(t)}}}shouldUpdate(t){if(this._entity){const t=null===this._previousState,e=this._entity.state!==this._previousState,s=JSON.stringify(this._entity.attributes.source_list)!==this._previousPlaylists,i=JSON.stringify(this._playlistSchedules)!==this._previousSchedules,n=this._expandedPlaylist!==this._previousExpandedPlaylist,o=JSON.stringify(this._playlistSongs)!==this._previousPlaylistSongs,r=this._lastTimeUpdate!==this._previousTimeUpdate;return this._previousState=this._entity.state,this._previousPlaylists=JSON.stringify(this._entity.attributes.source_list),this._previousSchedules=JSON.stringify(this._playlistSchedules),this._previousExpandedPlaylist=this._expandedPlaylist,this._previousPlaylistSongs=JSON.stringify(this._playlistSongs),this._previousTimeUpdate=this._lastTimeUpdate,t||e||s||i||n||o||r}return super.shouldUpdate(t)}async _fetchScheduleInfo(t=!1){if(!this._loading){this._loading=!0;try{const e={};let s={};try{const e=await this._hass.callWS({type:"call_service",domain:"xschedule",service:"get_playlists_with_metadata",service_data:{entity_id:this.config.entity,force_refresh:t},return_response:!0});e&&e.response&&e.response.playlists&&(s=e.response.playlists.reduce((t,e)=>(t[e.name]=e,t),{}))}catch(t){console.error("Failed to fetch playlists metadata:",t)}for(const i of this._playlists)try{const n=await this._hass.callWS({type:"call_service",domain:"xschedule",service:"get_playlist_schedules",service_data:{entity_id:this.config.entity,playlist:i,force_refresh:t},return_response:!0});if(n&&n.response&&n.response.schedules&&n.response.schedules.length>0){const t=n.response.schedules;let o=null;const r=t.find(t=>"TRUE"===t.active||"NOW!"===t.nextactive);if(r)o=r;else{const e=t.filter(t=>{const e=t.nextactive;return e&&"A long time from now"!==e&&"N/A"!==e&&e.match(/\d{4}-\d{2}-\d{2}/)}).sort((t,e)=>new Date(t.nextactive)-new Date(e.nextactive));o=e.length>0?e[0]:t[0]}if(!o)continue;let a=0;s[i]&&s[i].lengthms&&(a=parseInt(s[i].lengthms)/1e3),e[i]={nextActiveTime:o.nextactive,enabled:o.enabled,active:o.active,duration:a}}}catch(t){console.error(`Failed to fetch schedule for ${i}:`,t)}this._playlistSchedules=e,this._previousSchedules=null}finally{this._loading=!1,this.requestUpdate()}}}_subscribeToCacheEvents(){this._hass&&!this._cacheEventUnsub&&(this._cacheEventUnsub=this._hass.connection.subscribeEvents(t=>{t.data.entity_id===this.config.entity&&(console.debug("Backend cache invalidated, refetching schedule info"),this._fetchScheduleInfo(!0))},"xschedule_cache_invalidated"))}_unsubscribeCacheEvents(){this._cacheEventUnsub&&(this._cacheEventUnsub.then(t=>t()),this._cacheEventUnsub=null)}render(){return this.config?this._entity?L`
      <ha-card>
        <div class="card-header">
          <h1 class="card-title">
            <ha-icon icon="mdi:playlist-music"></ha-icon>
            xSchedule Playlists
            ${this._loading&&this._playlists.length>0?L`<ha-circular-progress active style="--md-circular-progress-size: 16px; margin-left: 8px;"></ha-circular-progress>`:""}
          </h1>
        </div>

        <div class="card-content ${this.config.compact_mode?"compact":""}">
          ${this._loading&&0===this._playlists.length?L`
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
      `:L``}_renderPlaylists(){if(0===this._playlists.length)return L`
        <div class="empty-state">
          <ha-icon icon="mdi:playlist-music-outline"></ha-icon>
          <p>No playlists found</p>
        </div>
      `;const t=this._getSortedPlaylists(),e=this._entity.attributes.playlist;return L`
      <div class="playlist-list">
        ${t.map(t=>this._renderPlaylistItem(t,t===e))}
      </div>
    `}_renderPlaylistItem(t,e){const s=this._playlistSchedules[t],i=s&&s.nextActiveTime,n=this._expandedPlaylist===t;return L`
      <div class="playlist-item ${e?"playing":""} ${this.config.compact_mode?"compact":""} ${n?"expanded":""}">
        <div class="playlist-header" @click=${()=>this._togglePlaylist(t)}>
          <ha-icon
            icon=${e?"mdi:play-circle":i?"mdi:clock-outline":"mdi:playlist-music"}
            class="playlist-icon"
          ></ha-icon>
          <div class="playlist-name">${t}</div>
          ${this._renderScheduleInfo(e,s)}
          <button
            class="play-btn"
            @click=${e=>this._playPlaylist(e,t)}
            title="Play playlist"
          >
            <ha-icon icon="mdi:play-outline"></ha-icon>
          </button>
          <ha-icon
            icon=${n?"mdi:chevron-up":"mdi:chevron-down"}
            class="expand-icon"
          ></ha-icon>
        </div>

        ${n?this._renderSongList(t):""}
      </div>
    `}_renderScheduleInfo(t,e){const s=[];if((t||e&&"NOW!"===e.nextActiveTime)&&s.push(L`<span class="schedule-info playing-status">[Playing]</span>`),this.config.show_duration&&e&&e.duration>0){const t=this._formatDuration(e.duration);s.push(L`<span class="schedule-info duration">[${t}]</span>`)}if(!t&&e&&e.nextActiveTime&&"NOW!"!==e.nextActiveTime&&"A long time from now"!==e.nextActiveTime&&"N/A"!==e.nextActiveTime){const t=this._formatScheduleTime(e.nextActiveTime);s.push(L`<span class="schedule-info schedule-time">[${t}]</span>`)}return s}_getSortedPlaylists(){const t=[...this._playlists],e=this._entity.attributes.playlist;return"schedule"===this.config.sort_by?t.sort((t,s)=>{if(t===e)return-1;if(s===e)return 1;const i=this._playlistSchedules[t],n=this._playlistSchedules[s],o="NOW!"===i?.nextActiveTime,r="NOW!"===n?.nextActiveTime;if(o&&!r)return-1;if(!o&&r)return 1;if(i?.nextActiveTime&&n?.nextActiveTime){const t="A long time from now"!==i.nextActiveTime&&"N/A"!==i.nextActiveTime&&"NOW!"!==i.nextActiveTime,e="A long time from now"!==n.nextActiveTime&&"N/A"!==n.nextActiveTime&&"NOW!"!==n.nextActiveTime;if(t&&e)return new Date(i.nextActiveTime)-new Date(n.nextActiveTime);if(t)return-1;if(e)return 1}return i?.nextActiveTime?-1:n?.nextActiveTime?1:t.localeCompare(s)}):t.sort((t,s)=>t===e?-1:s===e?1:t.localeCompare(s))}_formatScheduleTime(t){const e=new Date(t),s=new Date,i=e.getHours(),n=i>=12?"PM":"AM",o=`${i%12||12}:${e.getMinutes().toString().padStart(2,"0")} ${n}`,r=new Date(e.getFullYear(),e.getMonth(),e.getDate()),a=new Date(s.getFullYear(),s.getMonth(),s.getDate()),l=Math.round((r-a)/864e5);if(0===l)return`Today ${o}`;if(1===l)return`Tomorrow ${o}`;if(-1===l)return`Yesterday ${o}`;if(l>0&&l<=7){return`${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][e.getDay()]} ${o}`}return`${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][e.getMonth()]} ${e.getDate()} ${o}`}_formatDuration(t){if(!t)return"0:00";const e=Math.floor(t/3600),s=Math.floor(t%3600/60),i=Math.floor(t%60);return e>0?`${e}:${s.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`:`${s}:${i.toString().padStart(2,"0")}`}async _togglePlaylist(t){this._expandedPlaylist===t?this._expandedPlaylist=null:(this._expandedPlaylist=t,this._playlistSongs[t]||await this._fetchPlaylistSongs(t)),this.requestUpdate()}async _fetchPlaylistSongs(t,e=!1){try{const s=await this._hass.callWS({type:"call_service",domain:"xschedule",service:"get_playlist_steps",service_data:{entity_id:this.config.entity,playlist:t,force_refresh:e},return_response:!0});s&&s.response&&s.response.steps&&(this._playlistSongs[t]=s.response.steps,this.requestUpdate())}catch(e){console.error(`Failed to fetch songs for ${t}:`,e),this._playlistSongs[t]=[]}}_renderSongList(t){const e=this._playlistSongs[t];return e?0===e.length?L`
        <div class="song-list empty">
          <p>No songs in this playlist</p>
        </div>
      `:L`
      <div class="song-list">
        ${e.map(e=>L`
          <div class="song-item-compact">
            <span class="song-name-compact">${e.name}</span>
            ${e.duration?L`<span class="song-duration-compact">${this._formatDuration(e.duration/1e3)}</span>`:""}
            <button
              class="add-queue-btn-compact"
              @click=${s=>this._addSongToQueue(s,t,e.name)}
              title="Add to queue"
            >
              <ha-icon icon="mdi:playlist-plus"></ha-icon>
            </button>
          </div>
        `)}
      </div>
    `:L`
        <div class="song-list loading">
          <ha-circular-progress active size="small"></ha-circular-progress>
        </div>
      `}async _addSongToQueue(t,e,s){t.stopPropagation();try{await this._hass.callService("xschedule","add_to_queue",{entity_id:this.config.entity,playlist:e,song:s})}catch(t){console.error("Failed to add to queue:",t)}}async _playPlaylist(t,e){if(t.stopPropagation(),this.config.confirm_play){if(!confirm(`Play playlist "${e}"?`))return}try{await this._hass.callService("media_player","select_source",{entity_id:this.config.entity,source:e})}catch(t){console.error("Failed to play playlist:",t)}}getCardSize(){return this.config.compact_mode?4:6}static get styles(){return o`
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
    `}}customElements.define("xschedule-playlist-browser-editor",class extends ot{static get properties(){return{hass:{type:Object},config:{type:Object}}}setConfig(t){this.config=t}_valueChanged(t){if(!this.config||!this.hass)return;const e=t.target,s="checkbox"===e.type?e.checked:e.value;if(this.config[e.configValue]===s)return;const i={...this.config,[e.configValue]:s},n=new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0});this.dispatchEvent(n)}render(){if(!this.hass||!this.config)return L``;const t=Object.keys(this.hass.states).filter(t=>t.startsWith("media_player.")&&(void 0!==this.hass.states[t].attributes.playlist_songs||t.includes("xschedule"))).sort();return L`
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
    `}static get styles(){return o`
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
    `}}),customElements.define("xschedule-playlist-browser",at),console.info("%c  XSCHEDULE-PLAYLIST-BROWSER  \n%c  Version 1.4.1-pre2  ","color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray"),at.getConfigElement=function(){return document.createElement("xschedule-playlist-browser-editor")},at.getStubConfig=function(){return{entity:"",sort_by:"schedule",show_duration:!0,show_status:!0,compact_mode:!1,confirm_play:!0}},window.customCards=window.customCards||[],window.customCards.push({type:"xschedule-playlist-browser",name:"xSchedule Playlist Browser",description:"Browse and select xSchedule playlists with schedule information",preview:!0});
