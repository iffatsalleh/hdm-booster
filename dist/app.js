(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();var nt,b,Rn,H,Wt,Nn,Dn,it,xe,ge,Ln,Ot,_t,mt,He={},Ve=[],Lr=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,rt=Array.isArray;function M(t,e){for(var n in e)t[n]=e[n];return t}function Rt(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function xr(t,e,n){var r,i,a,s={};for(a in e)a=="key"?r=e[a]:a=="ref"?i=e[a]:s[a]=e[a];if(arguments.length>2&&(s.children=arguments.length>3?nt.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(a in t.defaultProps)s[a]===void 0&&(s[a]=t.defaultProps[a]);return Me(t,s,r,i,null)}function Me(t,e,n,r,i){var a={type:t,props:e,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:i??++Rn,__i:-1,__u:0};return i==null&&b.vnode!=null&&b.vnode(a),a}function ee(t){return t.children}function Ue(t,e){this.props=t,this.context=e}function Q(t,e){if(e==null)return t.__?Q(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?Q(t):null}function Mr(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,r=[],i=[],a=M({},e);a.__v=e.__v+1,b.vnode&&b.vnode(a),Nt(t.__P,a,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,r,n??Q(e),!!(32&e.__u),i),a.__v=e.__v,a.__.__k[a.__i]=a,Bn(r,a,i),e.__e=e.__=null,a.__e!=n&&xn(a)}}function xn(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),xn(t)}function zt(t){(!t.__d&&(t.__d=!0)&&H.push(t)&&!je.__r++||Wt!=b.debounceRendering)&&((Wt=b.debounceRendering)||Nn)(je)}function je(){try{for(var t,e=1;H.length;)H.length>e&&H.sort(Dn),t=H.shift(),e=H.length,Mr(t)}finally{H.length=je.__r=0}}function Mn(t,e,n,r,i,a,s,l,c,u,h){var f,d,p,m,S,v,w=r&&r.__k||Ve,_=e.length;for(c=Ur(n,e,w,c,_),f=0;f<_;f++)(p=n.__k[f])!=null&&(d=p.__i!=-1&&w[p.__i]||He,p.__i=f,v=Nt(t,p,d,i,a,s,l,c,u,h),m=p.__e,p.ref&&d.ref!=p.ref&&(d.ref&&Dt(d.ref,null,p),h.push(p.ref,p.__c||m,p)),S==null&&m!=null&&(S=m),4&p.__u?(c=Un(p,c,t),d.__e&&(d.__e=null)):typeof p.type=="function"&&v!==void 0?c=v:m&&(c=m.nextSibling),p.__u&=-7);return n.__e=S,c}function Ur(t,e,n,r,i){var a,s,l,c,u,h=n.length,f=h,d=0;for(t.__k=new Array(i),a=0;a<i;a++)(s=e[a])!=null&&typeof s!="boolean"&&typeof s!="function"?(typeof s=="string"||typeof s=="number"||typeof s=="bigint"||s.constructor==String?s=t.__k[a]=Me(null,s,null,null,null):rt(s)?s=t.__k[a]=Me(ee,{children:s},null,null,null):s.constructor===void 0&&s.__b>0?s=t.__k[a]=Me(s.type,s.props,s.key,s.ref?s.ref:null,s.__v):t.__k[a]=s,c=a+d,s.__=t,s.__b=t.__b+1,l=null,(u=s.__i=$r(s,n,c,f))!=-1&&(f--,(l=n[u])&&(l.__u|=2)),l==null||l.__v==null?(u==-1&&(i>h?d--:i<h&&d++),typeof s.type!="function"&&(s.__u|=4)):u!=c&&(u==c-1?d--:u==c+1?d++:(u>c?d--:d++,s.__u|=4))):t.__k[a]=null;if(f)for(a=0;a<h;a++)(l=n[a])!=null&&!(2&l.__u)&&(l.__e==r&&(r=Q(l)),Hn(l,l));return r}function Un(t,e,n){var r,i;if(typeof t.type=="function"){for(r=t.__k,i=0;r&&i<r.length;i++)r[i]&&(r[i].__=t,e=Un(r[i],e,n));return e}t.__e!=e&&(e&&t.type&&!e.parentNode&&(e=Q(t)),e=n.insertBefore(t.__e,e||null));do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function $r(t,e,n,r){var i,a,s,l=t.key,c=t.type,u=e[n],h=u!=null&&(2&u.__u)==0;if(u===null&&l==null||h&&l==u.key&&c==u.type)return n;if(r>(h?1:0)){for(i=n-1,a=n+1;i>=0||a<e.length;)if((u=e[s=i>=0?i--:a++])!=null&&!(2&u.__u)&&l==u.key&&c==u.type)return s}return-1}function Kt(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||Lr.test(e)?n:n+"px"}function Re(t,e,n,r,i){var a,s;e:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof r=="string"&&(t.style.cssText=r=""),r)for(e in r)n&&e in n||Kt(t.style,e,"");if(n)for(e in n)r&&n[e]==r[e]||Kt(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")a=e!=(e=e.replace(Ln,"$1")),s=e.toLowerCase(),e=s in t||e=="onFocusOut"||e=="onFocusIn"?s.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+a]=n,n?r?n[ge]=r[ge]:(n[ge]=Ot,t.addEventListener(e,a?mt:_t,a)):t.removeEventListener(e,a?mt:_t,a);else{if(i=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function Gt(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[xe]==null)e[xe]=Ot++;else if(e[xe]<n[ge])return;return n(b.event?b.event(e):e)}}}function Nt(t,e,n,r,i,a,s,l,c,u){var h,f,d,p,m,S,v,w,_,T,A,C,P,fe,re,G,N=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(c=!!(32&n.__u),a=[l=e.__e=n.__e]),(h=b.__b)&&h(e);e:if(typeof N=="function"){f=s.length;try{if(_=e.props,T=N.prototype&&N.prototype.render,A=(h=N.contextType)&&r[h.__c],C=h?A?A.props.value:h.__:r,n.__c?w=(d=e.__c=n.__c).__=d.__E:(T?e.__c=d=new N(_,C):(e.__c=d=new Ue(_,C),d.constructor=N,d.render=Fr),A&&A.sub(d),d.state||(d.state={}),d.__n=r,p=d.__d=!0,d.__h=[],d._sb=[]),T&&d.__s==null&&(d.__s=d.state),T&&N.getDerivedStateFromProps!=null&&(d.__s==d.state&&(d.__s=M({},d.__s)),M(d.__s,N.getDerivedStateFromProps(_,d.__s))),m=d.props,S=d.state,d.__v=e,p)T&&N.getDerivedStateFromProps==null&&d.componentWillMount!=null&&d.componentWillMount(),T&&d.componentDidMount!=null&&d.__h.push(d.componentDidMount);else{if(T&&N.getDerivedStateFromProps==null&&_!==m&&d.componentWillReceiveProps!=null&&d.componentWillReceiveProps(_,C),e.__v==n.__v||!d.__e&&d.shouldComponentUpdate!=null&&d.shouldComponentUpdate(_,d.__s,C)===!1){e.__v!=n.__v&&(d.props=_,d.state=d.__s,d.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(ie){ie&&(ie.__=e)}),Ve.push.apply(d.__h,d._sb),d._sb=[],d.__h.length&&s.push(d),l=Q(n);break e}d.componentWillUpdate!=null&&d.componentWillUpdate(_,d.__s,C),T&&d.componentDidUpdate!=null&&d.__h.push(function(){d.componentDidUpdate(m,S,v)})}if(d.context=C,d.props=_,d.__P=t,d.__e=!1,P=b.__r,fe=0,T)d.state=d.__s,d.__d=!1,P&&P(e),h=d.render(d.props,d.state,d.context),Ve.push.apply(d.__h,d._sb),d._sb=[];else do d.__d=!1,P&&P(e),h=d.render(d.props,d.state,d.context),d.state=d.__s;while(d.__d&&++fe<25);d.state=d.__s,d.getChildContext!=null&&(r=M(M({},r),d.getChildContext())),T&&!p&&d.getSnapshotBeforeUpdate!=null&&(v=d.getSnapshotBeforeUpdate(m,S)),re=h!=null&&h.type===ee&&h.key==null?Fn(h.props.children):h,l=Mn(t,rt(re)?re:[re],e,n,r,i,a,s,l,c,u),d.base=e.__e,e.__u&=-161,d.__h.length&&s.push(d),w&&(d.__E=d.__=null)}catch(ie){if(s.length=f,e.__v=null,c||a!=null){if(ie.then){for(e.__u|=c?160:128;l&&l.nodeType==8&&l.nextSibling;)l=l.nextSibling;a!=null&&(a[a.indexOf(l)]=null),e.__e=l}else if(a!=null)for(G=a.length;G--;)Rt(a[G])}else e.__e=n.__e;e.__k==null&&(e.__k=n.__k||[]),ie.then||$n(e),b.__e(ie,e,n)}}else a==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):l=e.__e=Br(n.__e,e,n,r,i,a,s,c,u);return(h=b.diffed)&&h(e),128&e.__u?void 0:l}function $n(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some($n))}function Bn(t,e,n){for(var r=0;r<n.length;r++)Dt(n[r],n[++r],n[++r]);b.__c&&b.__c(e,t),t.some(function(i){try{t=i.__h,i.__h=[],t.some(function(a){a.call(i)})}catch(a){b.__e(a,i.__v)}})}function Fn(t){return typeof t!="object"||t==null||t.__b>0?t:rt(t)?t.map(Fn):t.constructor!==void 0?null:M({},t)}function Br(t,e,n,r,i,a,s,l,c){var u,h,f,d,p,m,S,v=n.props||He,w=e.props,_=e.type;if(_=="svg"?i="http://www.w3.org/2000/svg":_=="math"?i="http://www.w3.org/1998/Math/MathML":i||(i="http://www.w3.org/1999/xhtml"),a!=null){for(u=0;u<a.length;u++)if((p=a[u])&&"setAttribute"in p==!!_&&(_?p.localName==_:p.nodeType==3)){t=p,a[u]=null;break}}if(t==null){if(_==null)return document.createTextNode(w);t=document.createElementNS(i,_,w.is&&w),l&&(b.__m&&b.__m(e,a),l=!1),a=null}if(_==null)v===w||l&&t.data==w||(t.data=w);else{if(a=_=="textarea"&&w.defaultValue!=null?null:a&&nt.call(t.childNodes),!l&&a!=null)for(v={},u=0;u<t.attributes.length;u++)v[(p=t.attributes[u]).name]=p.value;for(u in v)p=v[u],u=="dangerouslySetInnerHTML"?f=p:u=="children"||u in w||u=="value"&&"defaultValue"in w||u=="checked"&&"defaultChecked"in w||Re(t,u,null,p,i);for(u in w)p=w[u],u=="children"?d=p:u=="dangerouslySetInnerHTML"?h=p:u=="value"?m=p:u=="checked"?S=p:l&&typeof p!="function"||v[u]===p||Re(t,u,p,v[u],i);if(h)l||f&&(h.__html==f.__html||h.__html==t.innerHTML)||(t.innerHTML=h.__html),e.__k=[];else if(f&&(t.innerHTML=""),Mn(e.type=="template"?t.content:t,rt(d)?d:[d],e,n,r,_=="foreignObject"?"http://www.w3.org/1999/xhtml":i,a,s,a?a[0]:n.__k&&Q(n,0),l,c),a!=null)for(u=a.length;u--;)Rt(a[u]);l&&_!="textarea"||(u="value",_=="progress"&&m==null?t.removeAttribute("value"):m!=null&&(m!==t[u]||_=="progress"&&!m||_=="option"&&m!=v[u])&&Re(t,u,m,v[u],i),u="checked",S!=null&&S!=t[u]&&Re(t,u,S,v[u],i))}return t}function Dt(t,e,n){try{if(typeof t=="function"){var r=typeof t.__u=="function";r&&t.__u(),r&&e==null||(t.__u=t(e))}else t.current=e}catch(i){b.__e(i,n)}}function Hn(t,e,n){var r,i;if(b.unmount&&b.unmount(t),(r=t.ref)&&(r.current&&r.current!=t.__e||Dt(r,null,e)),(r=t.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(a){b.__e(a,e)}r.base=r.__P=r.__n=null}if(r=t.__k)for(i=0;i<r.length;i++)r[i]&&Hn(r[i],e,n||typeof t.type!="function");n||Rt(t.__e),t.__c=t.__=t.__e=void 0}function Fr(t,e,n){return this.constructor(t,n)}function Hr(t,e,n){var r,i,a,s;e==document&&(e=document.documentElement),b.__&&b.__(t,e),i=(r=!1)?null:e.__k,a=[],s=[],Nt(e,t=e.__k=xr(ee,null,[t]),i||He,He,e.namespaceURI,i?null:e.firstChild?nt.call(e.childNodes):null,a,i?i.__e:e.firstChild,r,s),Bn(a,t,s),t.props.children=null}nt=Ve.slice,b={__e:function(t,e,n,r){for(var i,a,s;e=e.__;)if((i=e.__c)&&!i.__)try{if((a=i.constructor)&&a.getDerivedStateFromError!=null&&(i.setState(a.getDerivedStateFromError(t)),s=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(t,r||{}),s=i.__d),s)return i.__E=i}catch(l){t=l}throw t}},Rn=0,Ue.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=M({},this.state),typeof t=="function"&&(t=t(M({},n),this.props)),t&&M(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),zt(this))},Ue.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),zt(this))},Ue.prototype.render=ee,H=[],Nn=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Dn=function(t,e){return t.__v.__b-e.__v.__b},je.__r=0,it=Math.random().toString(8),xe="__d"+it,ge="__a"+it,Ln=/(PointerCapture)$|Capture$/i,Ot=0,_t=Gt(!1),mt=Gt(!0);var Vr=0;function o(t,e,n,r,i,a){e||(e={});var s,l,c=e;if("ref"in c)for(l in c={},e)l=="ref"?s=e[l]:c[l]=e[l];var u={type:t,props:c,key:n,ref:s,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--Vr,__i:-1,__u:0,__source:i,__self:a};if(typeof t=="function"&&(s=t.defaultProps))for(l in s)c[l]===void 0&&(c[l]=s[l]);return b.vnode&&b.vnode(u),u}var We,E,at,Jt,gt=0,Vn=[],I=b,qt=I.__b,Yt=I.__r,Xt=I.diffed,Qt=I.__c,Zt=I.unmount,en=I.__;function jn(t,e){I.__h&&I.__h(E,t,gt||e),gt=0;var n=E.__H||(E.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function k(t){return gt=1,jr(Wn,t)}function jr(t,e,n){var r=jn(We++,2);if(r.t=t,!r.__c&&(r.__=[Wn(void 0,e),function(l){var c=r.__N?r.__N[0]:r.__[0],u=r.t(c,l);c!==u&&(r.__N=[u,r.__[1]],r.__c.setState({}))}],r.__c=E,!E.__f)){var i=function(l,c,u){if(!r.__c.__H)return!0;var h=!1,f=r.__c.props!==l;if(r.__c.__H.__.some(function(p){if(p.__N){h=!0;var m=p.__[0];p.__=p.__N,p.__N=void 0,m!==p.__[0]&&(f=!0)}}),a){var d=a.call(this,l,c,u);return h?d||f:d}return!h||f};E.__f=!0;var a=E.shouldComponentUpdate,s=E.componentWillUpdate;E.componentWillUpdate=function(l,c,u){if(this.__e){var h=a;a=void 0,i(l,c,u),a=h}s&&s.call(this,l,c,u)},E.shouldComponentUpdate=i}return r.__N||r.__}function ce(t,e){var n=jn(We++,3);!I.__s&&Kr(n.__H,e)&&(n.__=t,n.u=e,E.__H.__h.push(n))}function Wr(){for(var t;t=Vn.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some($e),e.__h.some(yt),e.__h=[]}catch(n){e.__h=[],I.__e(n,t.__v)}}}I.__b=function(t){E=null,qt&&qt(t)},I.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),en&&en(t,e)},I.__r=function(t){Yt&&Yt(t),We=0;var e=(E=t.__c).__H;e&&(at===E?(e.__h=[],E.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some($e),e.__h.some(yt),e.__h=[],We=0)),at=E},I.diffed=function(t){Xt&&Xt(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(Vn.push(e)!==1&&Jt===I.requestAnimationFrame||((Jt=I.requestAnimationFrame)||zr)(Wr)),e.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),at=E=null},I.__c=function(t,e){e.some(function(n){try{n.__h.some($e),n.__h=n.__h.filter(function(r){return!r.__||yt(r)})}catch(r){e.some(function(i){i.__h&&(i.__h=[])}),e=[],I.__e(r,n.__v)}}),Qt&&Qt(t,e)},I.unmount=function(t){Zt&&Zt(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(r){try{$e(r)}catch(i){e=i}}),n.__H=void 0,e&&I.__e(e,n.__v))};var tn=typeof requestAnimationFrame=="function";function zr(t){var e,n=function(){clearTimeout(r),tn&&cancelAnimationFrame(e),setTimeout(t)},r=setTimeout(n,35);tn&&(e=requestAnimationFrame(n))}function $e(t){var e=E,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),E=e}function yt(t){var e=E;t.__c=t.__(),E=e}function Kr(t,e){return!t||t.length!==e.length||e.some(function(n,r){return n!==t[r]})}function Wn(t,e){return typeof e=="function"?e(t):e}const Gr=[["home",/^\/$/,[]],["masuk",/^\/masuk$/,[]],["daftar",/^\/daftar$/,[]],["lupa",/^\/lupa$/,[]],["onboarding",/^\/onboarding$/,[]],["ebook",/^\/ebook$/,[]],["ebook_read",/^\/ebook\/([^/]+)$/,["id"]],["tdee",/^\/tdee$/,[]],["group",/^\/group$/,[]],["akaun",/^\/akaun$/,[]],["akaun_kod",/^\/akaun\/kod$/,[]],["aktif",/^\/aktif$/,[]],["bantuan",/^\/bantuan$/,[]],["rekod",/^\/rekod$/,[]],["cabaran",/^\/cabaran$/,[]],["admin",/^\/admin(?:\/(.*))?$/,["rest"]]],Jr=new Set(["masuk","daftar","lupa"]),zn=new Set(["masuk","daftar","lupa","bantuan"]),qr=["superadmin","coach"],Yr=t=>{try{return decodeURIComponent(t)}catch{return t}};function nn(t){let e=t.replace(/^#/,"").split("?")[0];e.startsWith("/")||(e="/"+e),e.length>1&&(e=e.replace(/\/+$/,""));for(const[n,r,i]of Gr){const a=r.exec(e);if(!a)continue;const s={};return i.forEach((l,c)=>{a[c+1]!==void 0&&(s[l]=Yr(a[c+1]))}),{name:n,params:s,path:e}}return{name:"tiada",params:{},path:e}}function Xr(t,e){if(e.status==="loading"||e.status==="error")return null;const n=zn.has(t.name);return e.status==="anon"?n?null:"#/masuk":t.name==="bantuan"?null:e.onboarded?Jr.has(t.name)||t.name==="admin"&&!e.roles.some(r=>qr.includes(r))?"#/":null:n||t.name==="onboarding"?null:"#/onboarding"}function ze(t,e=!1){location.hash!==t&&(e?location.replace(t):location.hash=t)}function Qr(){const[t,e]=k(()=>nn(location.hash));return ce(()=>{const n=()=>{e(nn(location.hash)),window.scrollTo(0,0)};return window.addEventListener("hashchange",n),()=>window.removeEventListener("hashchange",n)},[]),t}const Zr={},x=t=>typeof t=="string"?t.trim():"",rn=t=>t.replace(/\/+$/,"");function ei(t,e){var r,i,a;const n=t==null?void 0:t.HDM_CONFIG;return n&&typeof n=="object"?{firebase:{apiKey:x((r=n.firebase)==null?void 0:r.apiKey),authDomain:x((i=n.firebase)==null?void 0:i.authDomain),projectId:x((a=n.firebase)==null?void 0:a.projectId)},apiUrl:rn(x(n.apiUrl)),gasUrl:x(n.gasUrl)}:{firebase:{apiKey:x(e.VITE_FIREBASE_API_KEY),authDomain:x(e.VITE_FIREBASE_AUTH_DOMAIN),projectId:x(e.VITE_FIREBASE_PROJECT_ID)},apiUrl:rn(x(e.VITE_API_URL)),gasUrl:x(e.VITE_GAS_URL)}}const Kn=ei(typeof window<"u"?window:void 0,Zr),Ke="60134417042",ti=()=>{};var an={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gn=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let i=t.charCodeAt(r);i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=i&63|128):(i&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=i&63|128):(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=i&63|128)}return e},ni=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const i=t[n++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const a=t[n++];e[r++]=String.fromCharCode((i&31)<<6|a&63)}else if(i>239&&i<365){const a=t[n++],s=t[n++],l=t[n++],c=((i&7)<<18|(a&63)<<12|(s&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const a=t[n++],s=t[n++];e[r++]=String.fromCharCode((i&15)<<12|(a&63)<<6|s&63)}}return e.join("")},Jn={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<t.length;i+=3){const a=t[i],s=i+1<t.length,l=s?t[i+1]:0,c=i+2<t.length,u=c?t[i+2]:0,h=a>>2,f=(a&3)<<4|l>>4;let d=(l&15)<<2|u>>6,p=u&63;c||(p=64,s||(d=64)),r.push(n[h],n[f],n[d],n[p])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Gn(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):ni(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<t.length;){const a=n[t.charAt(i++)],l=i<t.length?n[t.charAt(i)]:0;++i;const u=i<t.length?n[t.charAt(i)]:64;++i;const f=i<t.length?n[t.charAt(i)]:64;if(++i,a==null||l==null||u==null||f==null)throw new ri;const d=a<<2|l>>4;if(r.push(d),u!==64){const p=l<<4&240|u>>2;if(r.push(p),f!==64){const m=u<<6&192|f;r.push(m)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class ri extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const ii=function(t){const e=Gn(t);return Jn.encodeByteArray(e,!0)},qn=function(t){return ii(t).replace(/\./g,"")},Yn=function(t){try{return Jn.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ai(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const si=()=>ai().__FIREBASE_DEFAULTS__,oi=()=>{if(typeof process>"u"||typeof an>"u")return;const t=an.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},li=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Yn(t[1]);return e&&JSON.parse(e)},Xn=()=>{try{return ti()||si()||oi()||li()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},ci=()=>{var t;return(t=Xn())===null||t===void 0?void 0:t.config},ui=t=>{var e;return(e=Xn())===null||e===void 0?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class di{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qn(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function R(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function hi(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(R())}function pi(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function fi(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function _i(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function mi(){const t=R();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function gi(){try{return typeof indexedDB=="object"}catch{return!1}}function yi(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{var a;e(((a=i.error)===null||a===void 0?void 0:a.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bi="FirebaseError";class z extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=bi,Object.setPrototypeOf(this,z.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ie.prototype.create)}}class Ie{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},i=`${this.service}/${e}`,a=this.errors[e],s=a?vi(a,r):"Error",l=`${this.serviceName}: ${s} (${i}).`;return new z(i,l,r)}}function vi(t,e){return t.replace(ki,(n,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const ki=/\{\$([^}]+)}/g;function Ge(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const i of n){if(!r.includes(i))return!1;const a=t[i],s=e[i];if(sn(a)&&sn(s)){if(!Ge(a,s))return!1}else if(a!==s)return!1}for(const i of r)if(!n.includes(i))return!1;return!0}function sn(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zn(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function _e(t){const e={};return t.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,a]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(a)}}),e}function me(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function wi(t,e){const n=new Ei(t,e);return n.subscribe.bind(n)}class Ei{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let i;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");Ii(e,["next","error","complete"])?i=e:i={next:e,error:n,complete:r},i.next===void 0&&(i.next=st),i.error===void 0&&(i.error=st),i.complete===void 0&&(i.complete=st);const a=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),a}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Ii(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function st(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function te(t){return t&&t._delegate?t._delegate:t}class ue{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const J="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Si{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new di;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:n});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(a){if(i)return null;throw a}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Ai(e))try{this.getOrInitializeService({instanceIdentifier:J})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(n);try{const a=this.getOrInitializeService({instanceIdentifier:i});r.resolve(a)}catch{}}}}clearInstance(e=J){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=J){return this.instances.has(e)}getOptions(e=J){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[a,s]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(a);r===l&&s.resolve(i)}return i}onInit(e,n){var r;const i=this.normalizeInstanceIdentifier(n),a=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;a.add(e),this.onInitCallbacks.set(i,a);const s=this.instances.get(i);return s&&e(s,i),()=>{a.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const i of r)try{i(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Ti(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=J){return this.component?this.component.multipleInstances?e:J:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Ti(t){return t===J?void 0:t}function Ai(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ci{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Si(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var y;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(y||(y={}));const Pi={debug:y.DEBUG,verbose:y.VERBOSE,info:y.INFO,warn:y.WARN,error:y.ERROR,silent:y.SILENT},Oi=y.INFO,Ri={[y.DEBUG]:"log",[y.VERBOSE]:"log",[y.INFO]:"info",[y.WARN]:"warn",[y.ERROR]:"error"},Ni=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),i=Ri[e];if(i)console[i](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class er{constructor(e){this.name=e,this._logLevel=Oi,this._logHandler=Ni,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in y))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Pi[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,y.DEBUG,...e),this._logHandler(this,y.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,y.VERBOSE,...e),this._logHandler(this,y.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,y.INFO,...e),this._logHandler(this,y.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,y.WARN,...e),this._logHandler(this,y.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,y.ERROR,...e),this._logHandler(this,y.ERROR,...e)}}const Di=(t,e)=>e.some(n=>t instanceof n);let on,ln;function Li(){return on||(on=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function xi(){return ln||(ln=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const tr=new WeakMap,bt=new WeakMap,nr=new WeakMap,ot=new WeakMap,Lt=new WeakMap;function Mi(t){const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("success",a),t.removeEventListener("error",s)},a=()=>{n(W(t.result)),i()},s=()=>{r(t.error),i()};t.addEventListener("success",a),t.addEventListener("error",s)});return e.then(n=>{n instanceof IDBCursor&&tr.set(n,t)}).catch(()=>{}),Lt.set(e,t),e}function Ui(t){if(bt.has(t))return;const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("complete",a),t.removeEventListener("error",s),t.removeEventListener("abort",s)},a=()=>{n(),i()},s=()=>{r(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",a),t.addEventListener("error",s),t.addEventListener("abort",s)});bt.set(t,e)}let vt={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return bt.get(t);if(e==="objectStoreNames")return t.objectStoreNames||nr.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return W(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function $i(t){vt=t(vt)}function Bi(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(lt(this),e,...n);return nr.set(r,e.sort?e.sort():[e]),W(r)}:xi().includes(t)?function(...e){return t.apply(lt(this),e),W(tr.get(this))}:function(...e){return W(t.apply(lt(this),e))}}function Fi(t){return typeof t=="function"?Bi(t):(t instanceof IDBTransaction&&Ui(t),Di(t,Li())?new Proxy(t,vt):t)}function W(t){if(t instanceof IDBRequest)return Mi(t);if(ot.has(t))return ot.get(t);const e=Fi(t);return e!==t&&(ot.set(t,e),Lt.set(e,t)),e}const lt=t=>Lt.get(t);function Hi(t,e,{blocked:n,upgrade:r,blocking:i,terminated:a}={}){const s=indexedDB.open(t,e),l=W(s);return r&&s.addEventListener("upgradeneeded",c=>{r(W(s.result),c.oldVersion,c.newVersion,W(s.transaction),c)}),n&&s.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),l.then(c=>{a&&c.addEventListener("close",()=>a()),i&&c.addEventListener("versionchange",u=>i(u.oldVersion,u.newVersion,u))}).catch(()=>{}),l}const Vi=["get","getKey","getAll","getAllKeys","count"],ji=["put","add","delete","clear"],ct=new Map;function cn(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(ct.get(e))return ct.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,i=ji.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(i||Vi.includes(n)))return;const a=async function(s,...l){const c=this.transaction(s,i?"readwrite":"readonly");let u=c.store;return r&&(u=u.index(l.shift())),(await Promise.all([u[n](...l),i&&c.done]))[0]};return ct.set(e,a),a}$i(t=>({...t,get:(e,n,r)=>cn(e,n)||t.get(e,n,r),has:(e,n)=>!!cn(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wi{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(zi(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function zi(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const kt="@firebase/app",un="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $=new er("@firebase/app"),Ki="@firebase/app-compat",Gi="@firebase/analytics-compat",Ji="@firebase/analytics",qi="@firebase/app-check-compat",Yi="@firebase/app-check",Xi="@firebase/auth",Qi="@firebase/auth-compat",Zi="@firebase/database",ea="@firebase/data-connect",ta="@firebase/database-compat",na="@firebase/functions",ra="@firebase/functions-compat",ia="@firebase/installations",aa="@firebase/installations-compat",sa="@firebase/messaging",oa="@firebase/messaging-compat",la="@firebase/performance",ca="@firebase/performance-compat",ua="@firebase/remote-config",da="@firebase/remote-config-compat",ha="@firebase/storage",pa="@firebase/storage-compat",fa="@firebase/firestore",_a="@firebase/ai",ma="@firebase/firestore-compat",ga="firebase",ya="11.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ba="[DEFAULT]",va={[kt]:"fire-core",[Ki]:"fire-core-compat",[Ji]:"fire-analytics",[Gi]:"fire-analytics-compat",[Yi]:"fire-app-check",[qi]:"fire-app-check-compat",[Xi]:"fire-auth",[Qi]:"fire-auth-compat",[Zi]:"fire-rtdb",[ea]:"fire-data-connect",[ta]:"fire-rtdb-compat",[na]:"fire-fn",[ra]:"fire-fn-compat",[ia]:"fire-iid",[aa]:"fire-iid-compat",[sa]:"fire-fcm",[oa]:"fire-fcm-compat",[la]:"fire-perf",[ca]:"fire-perf-compat",[ua]:"fire-rc",[da]:"fire-rc-compat",[ha]:"fire-gcs",[pa]:"fire-gcs-compat",[fa]:"fire-fst",[ma]:"fire-fst-compat",[_a]:"fire-vertex","fire-js":"fire-js",[ga]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wt=new Map,ka=new Map,Et=new Map;function dn(t,e){try{t.container.addComponent(e)}catch(n){$.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function ve(t){const e=t.name;if(Et.has(e))return $.debug(`There were multiple attempts to register component ${e}.`),!1;Et.set(e,t);for(const n of wt.values())dn(n,t);for(const n of ka.values())dn(n,t);return!0}function wa(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function j(t){return t==null?!1:t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ea={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},X=new Ie("app","Firebase",Ea);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ia{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new ue("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw X.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xt=ya;function Sa(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:ba,automaticDataCollectionEnabled:!0},e),i=r.name;if(typeof i!="string"||!i)throw X.create("bad-app-name",{appName:String(i)});if(n||(n=ci()),!n)throw X.create("no-options");const a=wt.get(i);if(a){if(Ge(n,a.options)&&Ge(r,a.config))return a;throw X.create("duplicate-app",{appName:i})}const s=new Ci(i);for(const c of Et.values())s.addComponent(c);const l=new Ia(n,r,s);return wt.set(i,l),l}function ae(t,e,n){var r;let i=(r=va[t])!==null&&r!==void 0?r:t;n&&(i+=`-${n}`);const a=i.match(/\s|\//),s=e.match(/\s|\//);if(a||s){const l=[`Unable to register library "${i}" with version "${e}":`];a&&l.push(`library name "${i}" contains illegal characters (whitespace or "/")`),a&&s&&l.push("and"),s&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),$.warn(l.join(" "));return}ve(new ue(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ta="firebase-heartbeat-database",Aa=1,ke="firebase-heartbeat-store";let ut=null;function rr(){return ut||(ut=Hi(Ta,Aa,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(ke)}catch(n){console.warn(n)}}}}).catch(t=>{throw X.create("idb-open",{originalErrorMessage:t.message})})),ut}async function Ca(t){try{const n=(await rr()).transaction(ke),r=await n.objectStore(ke).get(ir(t));return await n.done,r}catch(e){if(e instanceof z)$.warn(e.message);else{const n=X.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});$.warn(n.message)}}}async function hn(t,e){try{const r=(await rr()).transaction(ke,"readwrite");await r.objectStore(ke).put(e,ir(t)),await r.done}catch(n){if(n instanceof z)$.warn(n.message);else{const r=X.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});$.warn(r.message)}}}function ir(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pa=1024,Oa=30;class Ra{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Da(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=pn();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(s=>s.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:i}),this._heartbeatsCache.heartbeats.length>Oa){const s=La(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(s,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){$.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=pn(),{heartbeatsToSend:r,unsentEntries:i}=Na(this._heartbeatsCache.heartbeats),a=qn(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),a}catch(n){return $.warn(n),""}}}function pn(){return new Date().toISOString().substring(0,10)}function Na(t,e=Pa){const n=[];let r=t.slice();for(const i of t){const a=n.find(s=>s.agent===i.agent);if(a){if(a.dates.push(i.date),fn(n)>e){a.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),fn(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class Da{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return gi()?yi().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Ca(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return hn(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return hn(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function fn(t){return qn(JSON.stringify({version:2,heartbeats:t})).length}function La(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xa(t){ve(new ue("platform-logger",e=>new Wi(e),"PRIVATE")),ve(new ue("heartbeat",e=>new Ra(e),"PRIVATE")),ae(kt,un,t),ae(kt,un,"esm2017"),ae("fire-js","")}xa("");var Ma="firebase",Ua="11.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ae(Ma,Ua,"app");function ar(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(t);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(t,r[i])&&(n[r[i]]=t[r[i]]);return n}function sr(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const $a=sr,or=new Ie("auth","Firebase",sr());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Je=new er("@firebase/auth");function Ba(t,...e){Je.logLevel<=y.WARN&&Je.warn(`Auth (${xt}): ${t}`,...e)}function Be(t,...e){Je.logLevel<=y.ERROR&&Je.error(`Auth (${xt}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function de(t,...e){throw Ut(t,...e)}function Mt(t,...e){return Ut(t,...e)}function lr(t,e,n){const r=Object.assign(Object.assign({},$a()),{[e]:n});return new Ie("auth","Firebase",r).create(e,{appName:t.name})}function se(t){return lr(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Ut(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return or.create(t,...e)}function g(t,e,...n){if(!t)throw Ut(e,...n)}function U(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Be(e),new Error(e)}function qe(t,e){t||U(e)}function Fa(){return _n()==="http:"||_n()==="https:"}function _n(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ha(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Fa()||fi()||"connection"in navigator)?navigator.onLine:!0}function Va(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Se{constructor(e,n){this.shortDelay=e,this.longDelay=n,qe(n>e,"Short delay should be less than long delay!"),this.isMobile=hi()||_i()}get(){return Ha()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ja(t,e){qe(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cr{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;U("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;U("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;U("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wa={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const za=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Ka=new Se(3e4,6e4);function ne(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function K(t,e,n,r,i={}){return ur(t,i,async()=>{let a={},s={};r&&(e==="GET"?s=r:a={body:JSON.stringify(r)});const l=Zn(Object.assign({key:t.config.apiKey},s)).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const u=Object.assign({method:e,headers:c},a);return pi()||(u.referrerPolicy="no-referrer"),t.emulatorConfig&&Qn(t.emulatorConfig.host)&&(u.credentials="include"),cr.fetch()(await dr(t,t.config.apiHost,n,l),u)})}async function ur(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},Wa),e);try{const i=new Ja(t),a=await Promise.race([n(),i.promise]);i.clearNetworkTimeout();const s=await a.json();if("needConfirmation"in s)throw Ne(t,"account-exists-with-different-credential",s);if(a.ok&&!("errorMessage"in s))return s;{const l=a.ok?s.errorMessage:s.error.message,[c,u]=l.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ne(t,"credential-already-in-use",s);if(c==="EMAIL_EXISTS")throw Ne(t,"email-already-in-use",s);if(c==="USER_DISABLED")throw Ne(t,"user-disabled",s);const h=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw lr(t,h,u);de(t,h)}}catch(i){if(i instanceof z)throw i;de(t,"network-request-failed",{message:String(i)})}}async function $t(t,e,n,r,i={}){const a=await K(t,e,n,r,i);return"mfaPendingCredential"in a&&de(t,"multi-factor-auth-required",{_serverResponse:a}),a}async function dr(t,e,n,r){const i=`${e}${n}?${r}`,a=t,s=a.config.emulator?ja(t.config,i):`${t.config.apiScheme}://${i}`;return za.includes(n)&&(await a._persistenceManagerAvailable,a._getPersistenceType()==="COOKIE")?a._getPersistence()._getFinalTarget(s).toString():s}function Ga(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class Ja{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(Mt(this.auth,"network-request-failed")),Ka.get())})}}function Ne(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const i=Mt(t,e,r);return i.customData._tokenResponse=n,i}function mn(t){return t!==void 0&&t.enterprise!==void 0}class qa{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return Ga(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function Ya(t,e){return K(t,"GET","/v2/recaptchaConfig",ne(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xa(t,e){return K(t,"POST","/v1/accounts:delete",e)}async function Ye(t,e){return K(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ye(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Qa(t,e=!1){const n=te(t),r=await n.getIdToken(e),i=hr(r);g(i&&i.exp&&i.auth_time&&i.iat,n.auth,"internal-error");const a=typeof i.firebase=="object"?i.firebase:void 0,s=a==null?void 0:a.sign_in_provider;return{claims:i,token:r,authTime:ye(dt(i.auth_time)),issuedAtTime:ye(dt(i.iat)),expirationTime:ye(dt(i.exp)),signInProvider:s||null,signInSecondFactor:(a==null?void 0:a.sign_in_second_factor)||null}}function dt(t){return Number(t)*1e3}function hr(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return Be("JWT malformed, contained fewer than 3 sections"),null;try{const i=Yn(n);return i?JSON.parse(i):(Be("Failed to decode base64 JWT payload"),null)}catch(i){return Be("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function gn(t){const e=hr(t);return g(e,"internal-error"),g(typeof e.exp<"u","internal-error"),g(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function It(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof z&&Za(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function Za({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class es{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class St{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=ye(this.lastLoginAt),this.creationTime=ye(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xe(t){var e;const n=t.auth,r=await t.getIdToken(),i=await It(t,Ye(n,{idToken:r}));g(i==null?void 0:i.users.length,n,"internal-error");const a=i.users[0];t._notifyReloadListener(a);const s=!((e=a.providerUserInfo)===null||e===void 0)&&e.length?pr(a.providerUserInfo):[],l=ns(t.providerData,s),c=t.isAnonymous,u=!(t.email&&a.passwordHash)&&!(l!=null&&l.length),h=c?u:!1,f={uid:a.localId,displayName:a.displayName||null,photoURL:a.photoUrl||null,email:a.email||null,emailVerified:a.emailVerified||!1,phoneNumber:a.phoneNumber||null,tenantId:a.tenantId||null,providerData:l,metadata:new St(a.createdAt,a.lastLoginAt),isAnonymous:h};Object.assign(t,f)}async function ts(t){const e=te(t);await Xe(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function ns(t,e){return[...t.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function pr(t){return t.map(e=>{var{providerId:n}=e,r=ar(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rs(t,e){const n=await ur(t,{},async()=>{const r=Zn({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:a}=t.config,s=await dr(t,i,"/v1/token",`key=${a}`),l=await t._getAdditionalHeaders();l["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:l,body:r};return t.emulatorConfig&&Qn(t.emulatorConfig.host)&&(c.credentials="include"),cr.fetch()(s,c)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function is(t,e){return K(t,"POST","/v2/accounts:revokeToken",ne(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oe{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){g(e.idToken,"internal-error"),g(typeof e.idToken<"u","internal-error"),g(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):gn(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){g(e.length!==0,"internal-error");const n=gn(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(g(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:i,expiresIn:a}=await rs(e,n);this.updateTokensAndExpiration(r,i,Number(a))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:i,expirationTime:a}=n,s=new oe;return r&&(g(typeof r=="string","internal-error",{appName:e}),s.refreshToken=r),i&&(g(typeof i=="string","internal-error",{appName:e}),s.accessToken=i),a&&(g(typeof a=="number","internal-error",{appName:e}),s.expirationTime=a),s}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new oe,this.toJSON())}_performRefresh(){return U("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function B(t,e){g(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class L{constructor(e){var{uid:n,auth:r,stsTokenManager:i}=e,a=ar(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new es(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=a.displayName||null,this.email=a.email||null,this.emailVerified=a.emailVerified||!1,this.phoneNumber=a.phoneNumber||null,this.photoURL=a.photoURL||null,this.isAnonymous=a.isAnonymous||!1,this.tenantId=a.tenantId||null,this.providerData=a.providerData?[...a.providerData]:[],this.metadata=new St(a.createdAt||void 0,a.lastLoginAt||void 0)}async getIdToken(e){const n=await It(this,this.stsTokenManager.getToken(this.auth,e));return g(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return Qa(this,e)}reload(){return ts(this)}_assign(e){this!==e&&(g(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new L(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){g(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await Xe(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(j(this.auth.app))return Promise.reject(se(this.auth));const e=await this.getIdToken();return await It(this,Xa(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,i,a,s,l,c,u,h;const f=(r=n.displayName)!==null&&r!==void 0?r:void 0,d=(i=n.email)!==null&&i!==void 0?i:void 0,p=(a=n.phoneNumber)!==null&&a!==void 0?a:void 0,m=(s=n.photoURL)!==null&&s!==void 0?s:void 0,S=(l=n.tenantId)!==null&&l!==void 0?l:void 0,v=(c=n._redirectEventId)!==null&&c!==void 0?c:void 0,w=(u=n.createdAt)!==null&&u!==void 0?u:void 0,_=(h=n.lastLoginAt)!==null&&h!==void 0?h:void 0,{uid:T,emailVerified:A,isAnonymous:C,providerData:P,stsTokenManager:fe}=n;g(T&&fe,e,"internal-error");const re=oe.fromJSON(this.name,fe);g(typeof T=="string",e,"internal-error"),B(f,e.name),B(d,e.name),g(typeof A=="boolean",e,"internal-error"),g(typeof C=="boolean",e,"internal-error"),B(p,e.name),B(m,e.name),B(S,e.name),B(v,e.name),B(w,e.name),B(_,e.name);const G=new L({uid:T,auth:e,email:d,emailVerified:A,displayName:f,isAnonymous:C,photoURL:m,phoneNumber:p,tenantId:S,stsTokenManager:re,createdAt:w,lastLoginAt:_});return P&&Array.isArray(P)&&(G.providerData=P.map(N=>Object.assign({},N))),v&&(G._redirectEventId=v),G}static async _fromIdTokenResponse(e,n,r=!1){const i=new oe;i.updateFromServerResponse(n);const a=new L({uid:n.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await Xe(a),a}static async _fromGetAccountInfoResponse(e,n,r){const i=n.users[0];g(i.localId!==void 0,"internal-error");const a=i.providerUserInfo!==void 0?pr(i.providerUserInfo):[],s=!(i.email&&i.passwordHash)&&!(a!=null&&a.length),l=new oe;l.updateFromIdToken(r);const c=new L({uid:i.localId,auth:e,stsTokenManager:l,isAnonymous:s}),u={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:a,metadata:new St(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(a!=null&&a.length)};return Object.assign(c,u),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yn=new Map;function q(t){qe(t instanceof Function,"Expected a class definition");let e=yn.get(t);return e?(qe(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,yn.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fr{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}fr.type="NONE";const bn=fr;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ht(t,e,n){return`firebase:${t}:${e}:${n}`}class le{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:i,name:a}=this.auth;this.fullUserKey=ht(this.userKey,i.apiKey,a),this.fullPersistenceKey=ht("persistence",i.apiKey,a),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await Ye(this.auth,{idToken:e}).catch(()=>{});return n?L._fromGetAccountInfoResponse(this.auth,n,e):null}return L._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new le(q(bn),e,r);const i=(await Promise.all(n.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let a=i[0]||q(bn);const s=ht(r,e.config.apiKey,e.name);let l=null;for(const u of n)try{const h=await u._get(s);if(h){let f;if(typeof h=="string"){const d=await Ye(e,{idToken:h}).catch(()=>{});if(!d)break;f=await L._fromGetAccountInfoResponse(e,d,h)}else f=L._fromJSON(e,h);u!==a&&(l=f),a=u;break}}catch{}const c=i.filter(u=>u._shouldAllowMigration);return!a._shouldAllowMigration||!c.length?new le(a,e,r):(a=c[0],l&&await a._set(s,l.toJSON()),await Promise.all(n.map(async u=>{if(u!==a)try{await u._remove(s)}catch{}})),new le(a,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vn(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(_r(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(as(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(gr(e))return"Blackberry";if(yr(e))return"Webos";if(ss(e))return"Safari";if((e.includes("chrome/")||os(e))&&!e.includes("edge/"))return"Chrome";if(mr(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function as(t=R()){return/firefox\//i.test(t)}function ss(t=R()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function os(t=R()){return/crios\//i.test(t)}function _r(t=R()){return/iemobile/i.test(t)}function mr(t=R()){return/android/i.test(t)}function gr(t=R()){return/blackberry/i.test(t)}function yr(t=R()){return/webos/i.test(t)}function ls(t=R()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function cs(){return mi()&&document.documentMode===10}function us(t=R()){return ls(t)||mr(t)||yr(t)||gr(t)||/windows phone/i.test(t)||_r(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function br(t,e=[]){let n;switch(t){case"Browser":n=vn(R());break;case"Worker":n=`${vn(R())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${xt}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=a=>new Promise((s,l)=>{try{const c=e(a);s(c)}catch(c){l(c)}});r.onAbort=n,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const i of n)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hs(t,e={}){return K(t,"GET","/v2/passwordPolicy",ne(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ps=6;class fs{constructor(e){var n,r,i,a;const s=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=s.minPasswordLength)!==null&&n!==void 0?n:ps,s.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=s.maxPasswordLength),s.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=s.containsLowercaseCharacter),s.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=s.containsUppercaseCharacter),s.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=s.containsNumericCharacter),s.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=s.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(a=e.forceUpgradeOnSignin)!==null&&a!==void 0?a:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,i,a,s,l;const c={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,c),this.validatePasswordCharacterOptions(e,c),c.isValid&&(c.isValid=(n=c.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),c.isValid&&(c.isValid=(r=c.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),c.isValid&&(c.isValid=(i=c.containsLowercaseLetter)!==null&&i!==void 0?i:!0),c.isValid&&(c.isValid=(a=c.containsUppercaseLetter)!==null&&a!==void 0?a:!0),c.isValid&&(c.isValid=(s=c.containsNumericCharacter)!==null&&s!==void 0?s:!0),c.isValid&&(c.isValid=(l=c.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),c}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),i&&(n.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,i,a){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=a))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _s{constructor(e,n,r,i){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new kn(this),this.idTokenSubscription=new kn(this),this.beforeStateQueue=new ds(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=or,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(a=>this._resolvePersistenceManagerAvailable=a)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=q(n)),this._initializationPromise=this.queue(async()=>{var r,i,a;if(!this._deleted&&(this.persistenceManager=await le.create(this,e),(r=this._resolvePersistenceManagerAvailable)===null||r===void 0||r.call(this),!this._deleted)){if(!((i=this._popupRedirectResolver)===null||i===void 0)&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((a=this.currentUser)===null||a===void 0?void 0:a.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Ye(this,{idToken:e}),r=await L._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(j(this.app)){const s=this.app.settings.authIdToken;return s?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(s).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let i=r,a=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const s=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=i==null?void 0:i._redirectEventId,c=await this.tryRedirectSignIn(e);(!s||s===l)&&(c!=null&&c.user)&&(i=c.user,a=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(a)try{await this.beforeStateQueue.runMiddleware(i)}catch(s){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(s))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return g(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await Xe(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Va()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(j(this.app))return Promise.reject(se(this));const n=e?te(e):null;return n&&g(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&g(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return j(this.app)?Promise.reject(se(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return j(this.app)?Promise.reject(se(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(q(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await hs(this),n=new fs(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Ie("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await is(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&q(e)||this._popupRedirectResolver;g(n,this,"argument-error"),this.redirectPersistenceManager=await le.create(this,[q(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,i){if(this._deleted)return()=>{};const a=typeof n=="function"?n:n.next.bind(n);let s=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(g(l,this,"internal-error"),l.then(()=>{s||a(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,r,i);return()=>{s=!0,c()}}else{const c=e.addObserver(n);return()=>{s=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return g(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=br(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(n["X-Firebase-AppCheck"]=i),n}async _getAppCheckToken(){var e;if(j(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&Ba(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function Te(t){return te(t)}class kn{constructor(e){this.auth=e,this.observer=null,this.addObserver=wi(n=>this.observer=n)}get next(){return g(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Bt={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function ms(t){Bt=t}function gs(t){return Bt.loadJS(t)}function ys(){return Bt.recaptchaEnterpriseScript}class bs{constructor(){this.enterprise=new vs}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class vs{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}const ks="recaptcha-enterprise",vr="NO_RECAPTCHA";class ws{constructor(e){this.type=ks,this.auth=Te(e)}async verify(e="verify",n=!1){async function r(a){if(!n){if(a.tenantId==null&&a._agentRecaptchaConfig!=null)return a._agentRecaptchaConfig.siteKey;if(a.tenantId!=null&&a._tenantRecaptchaConfigs[a.tenantId]!==void 0)return a._tenantRecaptchaConfigs[a.tenantId].siteKey}return new Promise(async(s,l)=>{Ya(a,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)l(new Error("recaptcha Enterprise site key undefined"));else{const u=new qa(c);return a.tenantId==null?a._agentRecaptchaConfig=u:a._tenantRecaptchaConfigs[a.tenantId]=u,s(u.siteKey)}}).catch(c=>{l(c)})})}function i(a,s,l){const c=window.grecaptcha;mn(c)?c.enterprise.ready(()=>{c.enterprise.execute(a,{action:e}).then(u=>{s(u)}).catch(()=>{s(vr)})}):l(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new bs().execute("siteKey",{action:"verify"}):new Promise((a,s)=>{r(this.auth).then(l=>{if(!n&&mn(window.grecaptcha))i(l,a,s);else{if(typeof window>"u"){s(new Error("RecaptchaVerifier is only supported in browser"));return}let c=ys();c.length!==0&&(c+=l),gs(c).then(()=>{i(l,a,s)}).catch(u=>{s(u)})}}).catch(l=>{s(l)})})}}async function wn(t,e,n,r=!1,i=!1){const a=new ws(t);let s;if(i)s=vr;else try{s=await a.verify(n)}catch{s=await a.verify(n,!0)}const l=Object.assign({},e);if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in l){const c=l.phoneEnrollmentInfo.phoneNumber,u=l.phoneEnrollmentInfo.recaptchaToken;Object.assign(l,{phoneEnrollmentInfo:{phoneNumber:c,recaptchaToken:u,captchaResponse:s,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in l){const c=l.phoneSignInInfo.recaptchaToken;Object.assign(l,{phoneSignInInfo:{recaptchaToken:c,captchaResponse:s,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return l}return r?Object.assign(l,{captchaResp:s}):Object.assign(l,{captchaResponse:s}),Object.assign(l,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(l,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),l}async function Tt(t,e,n,r,i){var a;if(!((a=t._getRecaptchaConfig())===null||a===void 0)&&a.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const s=await wn(t,e,n,n==="getOobCode");return r(t,s)}else return r(t,e).catch(async s=>{if(s.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const l=await wn(t,e,n,n==="getOobCode");return r(t,l)}else return Promise.reject(s)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Es(t,e){const n=wa(t,"auth");if(n.isInitialized()){const i=n.getImmediate(),a=n.getOptions();if(Ge(a,e??{}))return i;de(i,"already-initialized")}return n.initialize({options:e})}function Is(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(q);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ss{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return U("not implemented")}_getIdTokenResponse(e){return U("not implemented")}_linkToIdToken(e,n){return U("not implemented")}_getReauthenticationResolver(e){return U("not implemented")}}async function Ts(t,e){return K(t,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function As(t,e){return $t(t,"POST","/v1/accounts:signInWithPassword",ne(t,e))}async function Cs(t,e){return K(t,"POST","/v1/accounts:sendOobCode",ne(t,e))}async function Ps(t,e){return Cs(t,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Os(t,e){return $t(t,"POST","/v1/accounts:signInWithEmailLink",ne(t,e))}async function Rs(t,e){return $t(t,"POST","/v1/accounts:signInWithEmailLink",ne(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class we extends Ss{constructor(e,n,r,i=null){super("password",r),this._email=e,this._password=n,this._tenantId=i}static _fromEmailAndPassword(e,n){return new we(e,n,"password")}static _fromEmailAndCode(e,n,r=null){return new we(e,n,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Tt(e,n,"signInWithPassword",As);case"emailLink":return Os(e,{email:this._email,oobCode:this._password});default:de(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const r={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Tt(e,r,"signUpPassword",Ts);case"emailLink":return Rs(e,{idToken:n,email:this._email,oobCode:this._password});default:de(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ns(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function Ds(t){const e=_e(me(t)).link,n=e?_e(me(e)).deep_link_id:null,r=_e(me(t)).deep_link_id;return(r?_e(me(r)).link:null)||r||n||e||t}class Ft{constructor(e){var n,r,i,a,s,l;const c=_e(me(e)),u=(n=c.apiKey)!==null&&n!==void 0?n:null,h=(r=c.oobCode)!==null&&r!==void 0?r:null,f=Ns((i=c.mode)!==null&&i!==void 0?i:null);g(u&&h&&f,"argument-error"),this.apiKey=u,this.operation=f,this.code=h,this.continueUrl=(a=c.continueUrl)!==null&&a!==void 0?a:null,this.languageCode=(s=c.lang)!==null&&s!==void 0?s:null,this.tenantId=(l=c.tenantId)!==null&&l!==void 0?l:null}static parseLink(e){const n=Ds(e);try{return new Ft(n)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pe{constructor(){this.providerId=pe.PROVIDER_ID}static credential(e,n){return we._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const r=Ft.parseLink(n);return g(r,"argument-error"),we._fromEmailAndCode(e,r.code,r.tenantId)}}pe.PROVIDER_ID="password";pe.EMAIL_PASSWORD_SIGN_IN_METHOD="password";pe.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qe{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,i=!1){const a=await L._fromIdTokenResponse(e,r,i),s=En(r);return new Qe({user:a,providerId:s,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const i=En(r);return new Qe({user:e,providerId:i,_tokenResponse:r,operationType:n})}}function En(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze extends z{constructor(e,n,r,i){var a;super(n.code,n.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,Ze.prototype),this.customData={appName:e.name,tenantId:(a=e.tenantId)!==null&&a!==void 0?a:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,i){return new Ze(e,n,r,i)}}function Ls(t,e,n,r){return n._getIdTokenResponse(t).catch(a=>{throw a.code==="auth/multi-factor-auth-required"?Ze._fromErrorAndOperation(t,a,e,r):a})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xs(t,e,n=!1){if(j(t.app))return Promise.reject(se(t));const r="signIn",i=await Ls(t,r,e),a=await Qe._fromIdTokenResponse(t,r,i);return n||await t._updateCurrentUser(a.user),a}async function Ms(t,e){return xs(Te(t),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Us(t){const e=Te(t);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function $s(t,e,n){const r=Te(t);await Tt(r,{requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"},"getOobCode",Ps)}function Bs(t,e,n){return j(t.app)?Promise.reject(se(t)):Ms(te(t),pe.credential(e,n)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Us(t),r})}function Fs(t,e,n,r){return te(t).onAuthStateChanged(e,n,r)}function Hs(t){return te(t).signOut()}const In="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kr{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(In,"1"),this.storage.removeItem(In),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vs=1e3,js=10;class wr extends kr{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=us(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),i=this.localCache[n];r!==i&&e(n,i,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((s,l,c)=>{this.notifyListeners(s,c)});return}const r=e.key;n?this.detachListener():this.stopPolling();const i=()=>{const s=this.storage.getItem(r);!n&&this.localCache[r]===s||this.notifyListeners(r,s)},a=this.storage.getItem(r);cs()&&a!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,js):i()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},Vs)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}wr.type="LOCAL";const Ws=wr;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zs extends kr{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}zs.type="SESSION";new Se(3e4,6e4);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Se(2e3,1e4);/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Se(3e4,6e4);/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Se(5e3,15e3);var Sn="@firebase/auth",Tn="1.10.8";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ks{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){g(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gs(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Js(t){ve(new ue("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),a=e.getProvider("app-check-internal"),{apiKey:s,authDomain:l}=r.options;g(s&&!s.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:s,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:br(t)},u=new _s(r,i,a,c);return Is(u,n),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),ve(new ue("auth-internal",e=>{const n=Te(e.getProvider("auth").getImmediate());return(r=>new Ks(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),ae(Sn,Tn,Gs(t)),ae(Sn,Tn,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qs=5*60;ui("authIdTokenMaxAge");function Ys(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}ms({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=i=>{const a=Mt("internal-error");a.customData=i,n(a)},r.type="text/javascript",r.charset="UTF-8",Ys().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Js("Browser");function Xs(){const t=Sa(Kn.firebase),e=Es(t,{persistence:Ws});return e.languageCode="ms",{onChange:n=>Fs(e,r=>n(r?{uid:r.uid,email:r.email}:null)),signIn:async(n,r)=>{await Bs(e,n,r)},resetPassword:n=>$s(e,n),signOut:()=>Hs(e),getIdToken:async n=>e.currentUser?e.currentUser.getIdToken(!!n):null}}let pt=null;function Ae(){return pt||(pt=Promise.resolve().then(Xs)),pt}class Z extends Error{constructor(e,n="",r=0){super(n),this.name="ApiError",this.reason=e,this.status=r}}const Ht="Tiada sambungan internet. Cuba lagi sebentar.",Qs="Ralat tidak dijangka. Sila cuba lagi sebentar.",De="Emel atau kata laluan salah.",An={perlu_log_masuk:"Sila log masuk semula.",tiada_profil:"Akaun ini belum didaftarkan. Sila daftar di halaman Daftar.",tiada_kebenaran:"Anda tidak mempunyai kebenaran untuk tindakan ini.",tiada:"Halaman atau tindakan tidak dijumpai.",ralat_pelayan:"Ralat pada pelayan. Sila cuba lagi sebentar lagi.",data_tidak_sah:"Maklumat tidak lengkap atau tidak sah. Semak semula dan cuba lagi.",tidak_sah:"Kod tidak sah. Semak semula kod anda.",sudah_digunakan:"Kod ini telah digunakan.",dibatalkan:"Kod ini telah dibatalkan, sila hubungi admin.",tamat_tempoh:"Kod ini telah tamat tempoh, sila hubungi admin.",terlalu_banyak_cubaan:"Terlalu banyak cubaan. Cuba lagi selepas 15 minit.",tiada_akses:"Ebook ini tersedia dalam Pakej Complete.",tiada_fail:"Fail ebook ini belum tersedia. Sila cuba lagi kemudian.",tiada_pembelian:"Emel/telefon ini tiada rekod pembelian. Pastikan sama seperti semasa beli di BCL, atau WhatsApp 60134417042.",sudah_didaftar:"Emel ini sudah ada akaun. Sila log masuk atau tekan Lupa Kata Laluan.",sedang_didaftar:"Pendaftaran untuk emel ini sedang diproses. Tunggu sebentar, kemudian cuba log masuk.",terlalu_besar:"Data yang dihantar terlalu besar.",rangkaian:Ht,masa_tamat:"Sambungan terlalu perlahan. Cuba lagi sebentar."},Cn={"auth/invalid-credential":De,"auth/invalid-login-credentials":De,"auth/wrong-password":De,"auth/user-not-found":De,"auth/invalid-email":"Emel tidak sah.","auth/missing-email":"Sila masukkan emel.","auth/missing-password":"Sila masukkan kata laluan.","auth/user-disabled":"Akaun ini telah dinyahaktifkan. Sila hubungi admin.","auth/too-many-requests":"Terlalu banyak cubaan. Cuba lagi selepas beberapa minit.","auth/network-request-failed":Ht,"auth/user-token-expired":"Sila log masuk semula."};function he(t){if(t instanceof Z&&t.message)return t.message;const e=t&&typeof t=="object"?t:{};return typeof e.reason=="string"&&An[e.reason]?An[e.reason]:typeof e.code=="string"&&Cn[e.code]?Cn[e.code]:t instanceof TypeError&&/fetch|network/i.test(String(e.message))?Ht:Qs}async function Zs(t,e,n,r){const i=new AbortController,a=setTimeout(()=>i.abort(),r);try{return await t(e,{...n,signal:i.signal})}catch(s){throw i.signal.aborted||(s==null?void 0:s.name)==="AbortError"?new Z("masa_tamat"):new Z("rangkaian")}finally{clearTimeout(a)}}async function eo(t){let e=null;try{e=await t.json()}catch{e=null}if(e&&e.ok===!0&&t.ok)return e.data;throw e&&typeof e.reason=="string"?new Z(e.reason,typeof e.message=="string"?e.message:"",t.status):new Z("ralat_pelayan","",t.status)}function to(t){const e=t.timeoutMs??2e4,n=async(r,i,a,s)=>{const l=await t.getToken(s),c={};return l&&(c.Authorization=`Bearer ${l}`),a!==void 0&&(c["Content-Type"]="application/json"),Zs(t.fetch,t.baseUrl+i,{method:r,headers:c,body:a===void 0?void 0:JSON.stringify(a)},e)};return async(r,i,a)=>{let s=await n(r,i,a,!1);return s.status===401&&(s=await n(r,i,a,!0)),eo(s)}}const no=to({baseUrl:Kn.apiUrl,fetch:(...t)=>fetch(...t),getToken:async t=>(await Ae()).getIdToken(t)});async function Er(t,e,n){return no(t,e,n)}const At={profile:null,roles:[],entitlements:new Set,batch:null,catalog:null,reading:[],error:null,errorReason:null};let D={status:"loading",user:null,...At};const Ct=new Set;function be(t){D={...D,...t},Ct.forEach(e=>e(D))}function Ir(t){return Ct.add(t),()=>Ct.delete(t)}let F=null;function Sr(){var i;const t=(i=D.user)==null?void 0:i.uid;if(F&&F.uid===t)return F.p;const e={},r=(async()=>{var a,s;try{const l=await Er("GET","/api/me");if(((a=D.user)==null?void 0:a.uid)!==t)return;be({status:"ready",profile:l.profile,roles:l.roles??[],entitlements:new Set(l.entitlements??[]),batch:l.batch??null,catalog:l.catalog??null,reading:l.reading??[],error:null,errorReason:null})}catch(l){if(((s=D.user)==null?void 0:s.uid)!==t)return;be({status:"error",error:he(l),errorReason:l instanceof Z?l.reason:null})}finally{(F==null?void 0:F.token)===e&&(F=null)}})();return F={uid:t,token:e,p:r},r}function Tr(){const t=e=>!!e.user&&(e.status==="ready"||e.status==="error");return t(D)?Promise.resolve(D):new Promise(e=>{const n=Ir(r=>{t(r)&&(n(),e(r))})})}let Pn=!1;function ro(){Pn||(Pn=!0,Ae().then(t=>t.onChange(e=>{var n;if(!e){be({status:"anon",user:null,...At});return}((n=D.user)==null?void 0:n.uid)===e.uid&&D.status!=="anon"||(be({status:"loading",user:e,...At}),Sr())})).catch(t=>be({status:"error",error:he(t),errorReason:null})))}async function Ar(t,e){await(await Ae()).signIn(t.trim().toLowerCase(),e)}async function Cr(){await(await Ae()).signOut()}async function io(t){await(await Ae()).resetPassword(t.trim().toLowerCase())}function Ce(){const[t,e]=k(D);return ce(()=>(e(D),Ir(e)),[]),t}function Pt(t,e,n=""){var i,a;const r=(a=(i=t.catalog)==null?void 0:i.settings)==null?void 0:a[e];return typeof r=="string"?r:r==null?n:String(r)}let Fe=null;const et=new Set;let ao=0,On;function so(t,e="green",n=4e3){Fe={id:++ao,text:t,tone:e},et.forEach(r=>r(Fe)),clearTimeout(On),On=setTimeout(()=>{Fe=null,et.forEach(r=>r(null))},n)}const oo={blue:"ph-fill ph-info",green:"ph-fill ph-check-circle",yellow:"ph-fill ph-warning",red:"ph-fill ph-warning-circle"};function lo(){const[t,e]=k(Fe);return ce(()=>(et.add(e),()=>{et.delete(e)}),[]),o("div",{class:"toast-host","aria-live":"polite",children:t?o("div",{class:`callout ${t.tone} toast`,role:t.tone==="red"?"alert":"status",children:[o("i",{class:oo[t.tone],"aria-hidden":"true"}),o("span",{children:t.text})]},t.id):null})}function Vt(t){return o("section",{class:"card",style:"text-align:center;padding:28px 18px",children:[o("span",{class:`ic ${t.tone??"slate"}`,style:"margin:0 auto",children:o("i",{class:t.icon,"aria-hidden":"true"})}),o("h2",{style:"font-size:20px;margin-top:12px",children:t.title}),t.text?o("p",{class:"muted small",style:"margin-top:6px",children:t.text}):null,t.children?o("div",{style:"margin-top:16px",children:t.children}):null]})}function O(t){const e=["btn",t.variant&&t.variant!=="primary"?t.variant:"",t.block?"block":"",t.sm?"sm":"",t.pulse&&!t.loading?"pulse":""].filter(Boolean).join(" "),n=o(ee,{children:[t.loading?o("i",{class:"ph-bold ph-spinner spin","aria-hidden":"true"}):t.icon?o("i",{class:t.icon,"aria-hidden":"true"}):null,t.loading?"Sila tunggu…":t.children]});return t.href?o("a",{class:e,style:t.style,href:t.href,onClick:t.onClick,...t.external?{target:"_blank",rel:"noopener noreferrer"}:{},children:n}):o("button",{class:e,style:t.style,type:t.type??"button",disabled:t.disabled||t.loading,"aria-busy":t.loading?"true":void 0,onClick:t.onClick,children:n})}function Y(t){const[e,n]=k(!1),r=t.type==="password",i=[t.error?`${t.id}-err`:"",t.hint?`${t.id}-hint`:""].filter(Boolean).join(" ")||void 0,a=o("input",{id:t.id,class:"input"+(t.error?" err":""),type:r?e?"text":"password":t.type??"text",value:t.value,onInput:s=>t.onInput(s.currentTarget.value),autocomplete:t.autocomplete,inputMode:t.inputMode,placeholder:t.placeholder,required:t.required,"aria-invalid":t.error?"true":void 0,"aria-describedby":i,style:r?"padding-right:48px":void 0});return o("div",{class:"field",style:t.style,children:[o("label",{for:t.id,children:t.label}),r?o("div",{class:"input-wrap",children:[a,o("button",{type:"button",class:"eye",style:"background:none;border:0;padding:6px;cursor:pointer;font-size:20px","aria-label":e?"Sembunyikan kata laluan":"Tunjuk kata laluan","aria-pressed":e,onClick:()=>n(!e),children:o("i",{class:e?"ph ph-eye-slash":"ph ph-eye","aria-hidden":"true"})})]}):a,t.error?o("p",{class:"error",id:`${t.id}-err`,children:[o("i",{class:"ph-fill ph-warning-circle","aria-hidden":"true"}),o("span",{children:t.error})]}):null,t.hint?o("p",{class:"hint",id:`${t.id}-hint`,children:t.hint}):null]})}function V(t){const e="card"+(t.class?" "+t.class:"");return t.href?o("a",{class:e,href:t.href,style:typeof t.style=="string"?`color:inherit;${t.style}`:{color:"inherit",...t.style},children:t.children}):o("section",{class:e,style:t.style,children:t.children})}function tt(t){return o("div",{class:`callout ${t.tone}`,style:t.style,role:t.tone==="red"?"alert":"status",children:[o("i",{class:t.icon,"aria-hidden":"true"}),o("span",{children:t.children})]})}function Pe(){return o("p",{class:"health",children:[o("i",{class:"ph ph-first-aid-kit","aria-hidden":"true"}),"Jika anda ada penyakit kronik, mengambil ubat tertentu, hamil atau menyusukan anak, dapatkan nasihat doktor dahulu sebelum mengubah rutin puasa, pemakanan atau senaman."]})}function Pr(t){if(t==null)return null;let e=String(t).replace(/\D/g,"");if(!e)return null;if(!e.startsWith("60"))if(e.startsWith("0"))e="60"+e.slice(1);else if(e.startsWith("1"))e="60"+e;else return null;return/^601\d{8,9}$/.test(e)?e:null}function jt(t,e){return`https://wa.me/${Pr(t)??String(t).replace(/\D/g,"")}?text=${encodeURIComponent(e)}`}function co(t,e){return t.replace(/\{(\w+)\}/g,(n,r)=>Object.prototype.hasOwnProperty.call(e,r)?e[r]:n)}function uo(){const[t,e]=k(""),[n,r]=k(""),[i,a]=k(!1),[s,l]=k(null);return o("div",{class:"phone no-tabs",children:[o("section",{class:"hero hero-band",style:"border-radius:0 0 24px 24px;padding-bottom:44px",children:[o("span",{class:"wordmark",children:["HDM ",o("b",{children:"BOOSTER"})]}),o("div",{style:"margin-top:18px",children:o("span",{class:"pill-t",children:[o("i",{class:"ph-fill ph-moon-stars","aria-hidden":"true"})," Rejab · Syaaban · Ramadan"]})}),o("h1",{style:"font-size:26px;margin-top:14px",children:"Selamat kembali"})]}),o("main",{style:"padding:0 16px",children:[o("form",{class:"card overlap",style:"margin:-24px 0 0",onSubmit:async u=>{if(u.preventDefault(),!i){if(!t.trim()||!n){l("Sila masukkan emel dan kata laluan.");return}a(!0),l(null);try{await Ar(t,n);const h=await Tr();ze(h.profile&&!h.profile.onboarded_at?"#/onboarding":"#/",!0)}catch(h){l(he(h)),a(!1)}}},noValidate:!0,children:[o(Y,{id:"e",label:"Emel",type:"email",autocomplete:"email",inputMode:"email",value:t,onInput:e}),o(Y,{id:"k",label:"Kata laluan",type:"password",autocomplete:"current-password",value:n,onInput:r}),o("p",{style:"text-align:right;margin-top:10px;font-size:14px",children:o("a",{href:"#/lupa",children:"Lupa kata laluan?"})}),s?o(tt,{tone:"red",icon:"ph-fill ph-warning-circle",style:"margin-top:12px",children:s}):null,o(O,{type:"submit",block:!0,loading:i,style:"margin-top:14px",children:"Log Masuk"}),o("div",{class:"divider",children:"Belum ada akaun?"}),o(O,{href:"#/daftar",variant:"outline",block:!0,children:"Daftar akaun"})]}),o(O,{href:jt(Ke,"Salam, saya perlukan bantuan log masuk HDM BOOSTER."),external:!0,variant:"green-o",block:!0,icon:"ph-bold ph-whatsapp-logo",style:"margin-top:16px",children:["Perlukan bantuan? WhatsApp ",Ke]}),o("p",{class:"linkrow",style:"margin-top:12px",children:o("a",{href:"#/bantuan",children:"Bantuan & soalan lazim"})}),o(Pe,{})]})]})}function ho(){const[t,e]=k(""),[n,r]=k(""),[i,a]=k(""),[s,l]=k(""),[c,u]=k(!1),[h,f]=k(!1),[d,p]=k(!1),[m,S]=k({}),v=()=>{const _={};return t.trim()?t.trim().length>100&&(_.name="Nama maksimum 100 aksara."):_.name="Sila masukkan nama penuh.",/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.trim())||(_.email="Emel tidak sah."),Pr(i)||(_.phone="Nombor telefon tidak sah. Contoh: 012-345 6789."),s.length<8&&(_.password="Kata laluan mesti sekurang-kurangnya 8 aksara."),c||(_.ack="Sila tandakan persetujuan Notis Privasi untuk meneruskan."),_};return o("div",{class:"phone no-tabs",children:[o("section",{class:"hero hero-band",style:"border-radius:0",children:[o("span",{class:"wordmark",children:["HDM ",o("b",{children:"BOOSTER"})]}),o("h1",{style:"font-size:26px;margin:18px 0 4px",children:"Daftar akaun"}),o("p",{class:"small",children:"Untuk pembeli HDM BOOSTER"})]}),o("main",{class:"page",children:[o(tt,{tone:"blue",icon:"ph-fill ph-info",children:"Guna emel & no. telefon yang SAMA seperti semasa beli di BCL."}),o("form",{class:"card",style:"margin-top:12px",onSubmit:async _=>{if(_.preventDefault(),d)return;const T=v();if(S(T),!Object.keys(T).length){p(!0);try{await Er("POST","/api/register",{name:t.trim(),email:n.trim(),phone:i,password:s,privacyAck:!0})}catch(A){const C=A instanceof Z?A.reason:"",P=he(A);S(C==="tiada_pembelian"?{phone:P}:C==="sudah_didaftar"?{email:P}:{form:P}),p(!1);return}try{await Ar(n,s),await Tr(),ze("#/onboarding",!0)}catch(A){so(`Akaun berjaya didaftar. ${he(A)} Sila log masuk.`,"yellow",6e3),ze("#/masuk",!0)}}},noValidate:!0,children:[o(Y,{id:"n",label:"Nama penuh",autocomplete:"name",value:t,onInput:e,error:m.name}),o(Y,{id:"e",label:"Emel",type:"email",autocomplete:"email",inputMode:"email",value:n,onInput:r,error:m.email}),o(Y,{id:"p",label:"No. telefon",type:"tel",autocomplete:"tel",inputMode:"tel",placeholder:"012-345 6789",value:i,onInput:a,error:m.phone}),o(Y,{id:"k",label:"Kata laluan",type:"password",autocomplete:"new-password",value:s,onInput:l,error:m.password,hint:"Sekurang-kurangnya 8 aksara"}),o("label",{class:"check",style:"margin-top:16px;cursor:pointer",children:[o("input",{type:"checkbox",class:"sr-only",checked:c,onChange:_=>u(_.currentTarget.checked),"aria-describedby":m.ack?"ack-err":void 0}),o("span",{class:"box"+(c?"":" off"),"aria-hidden":"true",children:c?o("i",{class:"ph-bold ph-check"}):null}),o("span",{children:["Saya bersetuju dengan"," ",o("a",{href:"#/daftar",onClick:_=>{_.preventDefault(),f(!h)},"aria-expanded":h,"aria-controls":"pdpa",children:"Notis Privasi (PDPA)"})]})]}),h?o("div",{id:"pdpa",class:"callout blue small",style:"margin-top:10px;display:block;font-weight:500;line-height:1.5",children:[o("p",{children:[o("b",{children:"Notis Privasi (PDPA)."})," Kami mengumpul nama, emel, nombor telefon dan data kesihatan yang anda masukkan (contohnya berat, ukuran dan sasaran) untuk menyediakan program HDM BOOSTER, menyemak pembelian anda dan menghubungi anda tentang program."]}),o("p",{style:"margin-top:6px",children:["Akaun log masuk diurus oleh Google Firebase, dan aplikasi ini berjalan melalui Cloudflare. Penyedia ini mungkin memproses dan menyimpan data anda di pelayan ",o("b",{children:"di luar Malaysia"}),"."]}),o("p",{style:"margin-top:6px",children:"Data anda tidak dijual. Anda boleh meminta salinan, pembetulan atau pemadaman data dengan menghubungi kami melalui WhatsApp 60134417042."})]}):null,m.ack?o("p",{class:"error",id:"ack-err",children:[o("i",{class:"ph-fill ph-warning-circle","aria-hidden":"true"}),o("span",{children:m.ack})]}):null,m.form?o(tt,{tone:"red",icon:"ph-fill ph-warning-circle",style:"margin-top:12px",children:m.form}):null,o(O,{type:"submit",block:!0,pulse:!0,loading:d,style:"margin-top:18px",children:"Daftar"})]}),o("p",{class:"linkrow",style:"margin-top:16px",children:["Sudah ada akaun? ",o("a",{href:"#/masuk",children:"Log masuk"})]}),o("p",{class:"linkrow",style:"margin-top:8px",children:["Ada kod akses? ",o("a",{href:"#/masuk",children:"Log masuk dahulu"})]}),o(Pe,{})]})]})}function po(){const[t,e]=k(""),[n,r]=k(!1),[i,a]=k(null),[s,l]=k(null);return o("div",{class:"phone no-tabs",children:[o("header",{class:"titlebar",children:[o("a",{class:"back",href:"#/masuk","aria-label":"Kembali",children:o("i",{class:"ph-bold ph-caret-left","aria-hidden":"true"})}),o("div",{children:o("h1",{children:"Kata laluan"})})]}),o("main",{class:"page",children:[o("form",{class:"card",style:"text-align:center",onSubmit:async u=>{if(u.preventDefault(),n)return;const h=t.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(h)){a("Emel tidak sah.");return}r(!0),a(null),l(null);try{await io(h),l(h)}catch(f){a(he(f))}finally{r(!1)}},noValidate:!0,children:[o("span",{class:"ic blue",style:"margin:0 auto",children:o("i",{class:"ph-bold ph-key","aria-hidden":"true"})}),o("h2",{style:"font-size:22px;margin-top:12px",children:"Lupa kata laluan?"}),o("p",{class:"muted",style:"margin-top:6px",children:"Masukkan emel anda. Kami akan hantar pautan untuk tetapkan kata laluan baharu."}),o(Y,{id:"e",label:"Emel",type:"email",autocomplete:"email",inputMode:"email",value:t,onInput:e,error:i,style:"text-align:left;margin-top:16px"}),o(O,{type:"submit",block:!0,loading:n,style:"margin-top:16px",children:"Hantar pautan"})]}),s?o(tt,{tone:"green",icon:"ph-fill ph-check-circle",style:"margin-top:12px",children:["Pautan telah dihantar ke ",s,". Semak inbox & folder Spam."]}):null,o("p",{class:"linkrow",style:"margin-top:16px",children:o("a",{href:"#/masuk",children:"Kembali ke Log Masuk"})})]})]})}const fo=864e5;function Or(t){return Date.parse(t+"T00:00:00+08:00")}function Rr(t,e){const n=Math.max(0,t-e),r=Math.floor(n/1e3);return{days:Math.floor(n/fo),hours:Math.floor(r%86400/3600),minutes:Math.floor(r%3600/60),seconds:r%60,done:n===0}}function _o(t,e){return Rr(Or(t),e).days}function mo(t,e){const n=r=>{const i=e.find(a=>a.id===r);return!!i&&i.items.length>0&&i.items.every(a=>t.has(a))};return n("complete")?{id:"complete",label:"HDM BOOSTER COMPLETE"}:n("basic")?{id:"basic",label:"HDM BOOSTER BASIC"}:t.size>0?{id:"separa",label:"Akses separa"}:{id:"tiada",label:"Tiada pakej aktif"}}function go(t,e){const n=t.filter(r=>e.has(r.item_key)).length;return{open:n,total:t.length,locked:t.length-n}}function Nr(t){return String(t??"").trim().split(/\s+/)[0]??""}function yo(t){const e=Nr(t);return e?e.slice(0,2).toUpperCase():"?"}function bo(t,e){if(!t.length)return-1;let n=0;return t.forEach((r,i)=>{r.start<=e&&(n=i)}),n}const vo=[{href:"#/",label:"Utama",icon:"house",match:["home"]},{href:"#/rekod",label:"Rekod",icon:"note-pencil",match:["rekod"]},{href:"#/ebook",label:"Ebook",icon:"books",match:["ebook","ebook_read"]},{href:"#/cabaran",label:"Cabaran",icon:"trophy",match:["cabaran"]},{href:"#/akaun",label:"Akaun",icon:"user-circle",match:["akaun","akaun_kod","aktif"]}];function ko(t){return o("nav",{class:"tabbar","aria-label":"Navigasi utama",children:vo.map(e=>{const n=e.match.includes(t.active);return o("a",{class:n?"on":void 0,href:e.href,"aria-current":n?"page":void 0,children:[o("i",{class:`${n?"ph-fill":"ph"} ph-${e.icon}`,"aria-hidden":"true"}),e.label]},e.href)})})}function Oe(t){var r;const e=Ce(),n=t.tabs??!0;return o("div",{class:"phone"+(n?"":" no-tabs"),children:[t.title?o("header",{class:"titlebar",children:[o("a",{class:"back",href:t.back??"#/","aria-label":"Kembali",children:o("i",{class:"ph-bold ph-caret-left","aria-hidden":"true"})}),o("div",{children:o("h1",{children:t.title})})]}):o("header",{class:"topbar",children:[o("a",{href:"#/",style:"color:inherit","aria-label":"Utama",children:o("span",{class:"wordmark",children:["HDM ",o("b",{children:"BOOSTER"})]})}),o("a",{href:"#/akaun",class:"avatar","aria-label":"Akaun",children:yo((r=e.profile)==null?void 0:r.full_name)})]}),o("main",{class:"page",children:t.children}),n?o(ko,{active:t.route}):null]})}function wo(t){return o("span",{class:"lock-badge",children:[o("i",{class:"ph-fill ph-lock-key","aria-hidden":"true"}),t.text??"Pakej Complete"]})}const Eo=8*60*60*1e3,Io=24*60*60*1e3;function So(t=new Date){return new Date(t.getTime()+Eo).toISOString().slice(0,10)}function Le(t){return Math.round(Date.parse(t+"T00:00:00Z")/Io)}function To(t,e){const n=Le(e)-Le(t.programStart);if(n<0)return null;const r=Math.ceil((Le(t.programEnd)-Le(t.programStart))/7);return{week:Math.min(Math.floor(n/7)+1,r),total:r}}function Ee(t){const[e,n,r]=t.split("-");return`${r}/${n}/${e}`}const Ao={rejab:"Rejab",syaaban:"Syaaban",ramadan:"Ramadan"},ft=t=>String(t).padStart(2,"0");function Dr(t=1e3){const[e,n]=k(()=>Date.now());return ce(()=>{const r=setInterval(()=>n(Date.now()),t);return()=>clearInterval(r)},[t]),e}function Co({batch:t}){const e=Dr(),n=Rr(Or(t.program_start),e),r=[[String(n.days),"Hari",!1],[ft(n.hours),"Jam",!1],[ft(n.minutes),"Minit",!1],[ft(n.seconds),"Saat",!0]];return o(ee,{children:[o("p",{class:"small","aria-hidden":"true",children:"Program bermula dalam"}),o("span",{class:"sr-only",children:`Program bermula dalam ${n.days} hari`}),o("div",{style:"display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px","aria-hidden":"true",children:r.map(([i,a,s])=>o("div",{class:"glass",style:"text-align:center;padding:10px 4px",children:[o("div",{class:"num",style:`font-size:28px${s?";color:var(--yellow)":""}`,children:i}),o("div",{class:"tiny",style:"color:var(--on-navy-m)",children:a})]},a))})]})}function Po({batch:t,name:e}){var l;const n=Dr(6e4),r=So(new Date(n)),i=!!t&&r>=t.program_start,a=t&&i?To({programStart:t.program_start,programEnd:t.program_end,phases:t.phases},r):null,s=t?bo(t.phases??[],r):-1;return o("section",{class:"hero",children:[o("i",{class:"ph-fill ph-moon-stars moon","aria-hidden":"true"}),t?o("span",{class:"pill-t",children:[o("i",{class:"ph-fill ph-moon-stars","aria-hidden":"true"})," ",t.name]}):null,o("h1",{style:"font-size:24px;margin:14px 0 4px",children:["Assalamualaikum",e?`, ${e}`:""]}),t?i?o("div",{class:"glass",style:"padding:12px;text-align:center;margin-top:10px",children:o("span",{class:"num",style:"font-size:28px;color:var(--yellow)",children:["Minggu ",(a==null?void 0:a.week)??1," / ",(a==null?void 0:a.total)??13]})}):o(Co,{batch:t}):o("p",{class:"small",children:"Maklumat batch akan dipaparkan di sini apabila tersedia."}),(l=t==null?void 0:t.phases)!=null&&l.length?o("div",{style:"display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:16px",children:t.phases.map((c,u)=>o("div",{children:[o("div",{style:`height:6px;border-radius:999px;background:${u<=s?"var(--blue)":"rgba(255,255,255,.14)"}`}),o("div",{class:"months",style:`margin-top:6px${u<=s?"":";color:var(--on-navy-m)"}`,children:Ao[c.key]??c.key})]},c.key))}):null,t?o("p",{class:"tiny",style:"margin-top:8px",children:[Ee(t.program_start)," – ",Ee(t.program_end)]}):null]})}function Oo(){var c,u,h,f;const t=Ce(),e=t.entitlements,n=mo(e,((c=t.catalog)==null?void 0:c.packages)??[]),r=go(((u=t.catalog)==null?void 0:u.ebooks)??[],e),i=Pt(t,"support_wa",Ke),a=co(Pt(t,"wa_upgrade_text","Salam, saya ingin naik taraf ke Pakej Complete HDM BOOSTER. Emel pendaftaran: {emel}"),{emel:((h=t.profile)==null?void 0:h.email)??""}),s=t.batch?Ee(t.batch.program_start):"10/12/2026",l=e.has("tdee");return o(Oe,{route:"home",children:[o(Po,{batch:t.batch,name:Nr((f=t.profile)==null?void 0:f.full_name)}),o("div",{class:"section-title",children:[o("h2",{children:"Pakej anda"}),o("span",{class:`badge ${n.id==="tiada"?"grey":"blue"}`,children:[o("i",{class:"ph-bold ph-seal-check","aria-hidden":"true"})," ",n.label]})]}),o("div",{class:"grid2",children:[o(V,{href:"#/ebook",children:[o("span",{class:"ic blue",children:o("i",{class:"ph-bold ph-book-open-text","aria-hidden":"true"})}),o("h3",{style:"font-size:16px;margin-top:10px",children:"Baca Ebook"}),o("p",{class:"small muted",children:[r.open," daripada ",r.total," dibuka"]})]}),o(V,{href:"#/tdee",children:[o("span",{class:"ic orange",children:o("i",{class:"ph-bold ph-calculator","aria-hidden":"true"})}),o("h3",{style:"font-size:16px;margin-top:10px",children:"Kalkulator TDEE"}),l?o("p",{class:"small muted",children:"Kira kalori harian"}):o("div",{style:"margin-top:4px",children:o(wo,{text:"Terkunci"})})]}),o(V,{href:"#/group",children:[o("span",{class:"ic green",children:o("i",{class:"ph-bold ph-whatsapp-logo","aria-hidden":"true"})}),o("h3",{style:"font-size:16px;margin-top:10px",children:"Group Support"}),o("p",{class:"small muted",children:"Group WhatsApp bersama coach"})]}),o(V,{href:"#/bantuan",children:[o("span",{class:"ic slate",children:o("i",{class:"ph-bold ph-lifebuoy","aria-hidden":"true"})}),o("h3",{style:"font-size:16px;margin-top:10px",children:"Bantuan"}),o("p",{class:"small muted",children:"Soalan lazim & WhatsApp"})]})]}),r.locked>0?o(V,{style:"margin-top:12px;border-left:5px solid var(--yellow)",children:[o("div",{class:"row",children:[o("span",{class:"ic navy",children:o("i",{class:"ph-fill ph-lock-key","aria-hidden":"true"})}),o("div",{style:"flex:1",children:[o("h3",{style:"font-size:16px",children:[o("span",{class:"stabilo",children:[r.locked," ebook lagi"]})," menanti anda"]}),o("p",{class:"small muted",children:"Tersedia dalam Pakej Complete"})]})]}),o(O,{href:jt(i,a),external:!0,variant:"green-o",block:!0,sm:!0,icon:"ph-bold ph-whatsapp-logo",style:"margin-top:12px",children:"Naik taraf"})]}):null,o(V,{href:"#/rekod",style:"margin-top:12px;display:block",children:o("div",{class:"row",children:[o("span",{class:"ic slate",children:o("i",{class:"ph-bold ph-calendar-check","aria-hidden":"true"})}),o("div",{children:[o("h3",{style:"font-size:15px",children:"Rekod harian & Cabaran #1"}),o("p",{class:"small muted",children:["Dibuka ",s,". Lengkapkan data permulaan anda dahulu."]})]})]})}),o(Pe,{})]})}const Ro={android:["Buka laman ini dalam Chrome.","Tekan menu tiga titik di penjuru atas.","Pilih Tambah ke Skrin Utama, kemudian Tambah."],iphone:["Buka laman ini dalam Safari.","Tekan butang Kongsi (petak dengan anak panah ke atas) di bawah skrin.","Pilih Tambah ke Skrin Utama, kemudian Tambah."]};function No(){var c;const t=Ce(),[e,n]=k(()=>/iPhone|iPad|iPod/i.test(navigator.userAgent)?"iphone":"android"),r=Pt(t,"support_wa",Ke),i=t.status==="ready"&&!!((c=t.profile)!=null&&c.onboarded_at),a=i?"#/":t.user?"#/onboarding":"#/masuk",s=t.batch?Ee(t.batch.program_start):"10/12/2026",l=[["Saya tak boleh log masuk",`Semak emel dan kata laluan anda. Jika masih gagal, tekan Lupa kata laluan atau WhatsApp kami di ${r}.`],["Lupa kata laluan","Di skrin Log Masuk, tekan Lupa kata laluan. Masukkan emel anda dan kami hantar pautan. Semak juga folder Spam."],["Kenapa emel/telefon mesti sama dengan BCL?","Sistem menyemak rekod pembelian anda di BCL untuk buka akses yang betul. Jika berbeza, akses tidak dapat dipadankan."],["Bagaimana tebus kod akses?","Pergi ke Akaun, masukkan kod format HDMB-XXXX-XXXX pada ruangan Ada kod akses?, kemudian tekan Tebus."],["Bila Rekod harian dibuka?",`Rekod harian dan Cabaran #1 dibuka pada ${s}. Sebelum itu, lengkapkan data permulaan anda.`]];return o(Oe,{route:"bantuan",title:"Bantuan",back:a,tabs:i,children:[l.map(([u,h],f)=>o("details",{class:"faq",open:f===0,children:[o("summary",{children:u}),o("p",{children:h})]},u)),o(V,{style:"margin-top:16px",children:[o("h3",{style:"font-size:17px",children:[o("i",{class:"ph-bold ph-device-mobile",style:"color:var(--blue)","aria-hidden":"true"})," Tambah ke Skrin Utama"]}),o("div",{class:"seg",role:"tablist","aria-label":"Jenis telefon",style:"margin-top:12px",children:["android","iphone"].map(u=>o("button",{type:"button",role:"tab","aria-selected":e===u,class:e===u?"on":void 0,onClick:()=>n(u),children:u==="android"?"Android":"iPhone"},u))}),o("ol",{class:"small",style:"margin:12px 0 0 20px;line-height:1.7;font-weight:600;list-style:decimal",children:Ro[e].map(u=>o("li",{children:u},u))})]}),o(O,{href:jt(r,"Salam, saya perlukan bantuan HDM BOOSTER."),external:!0,variant:"green",block:!0,icon:"ph-bold ph-whatsapp-logo",style:"margin-top:16px",children:["WhatsApp ",r]}),o(Pe,{}),o("p",{class:"health",children:[o("i",{class:"ph ph-info","aria-hidden":"true"}),"Hasil individu berbeza mengikut keadaan kesihatan, pemakanan, aktiviti fizikal dan konsistensi. Tiada jaminan penurunan berat tertentu."]})]})}const Do=[["ph-scales","Berat"],["ph-egg","Protein"],["ph-drop","Air"],["ph-timer","Puasa/IF"],["ph-barbell","Senaman"],["ph-moon","Tidur"]];function Lo({route:t}){var i,a;const e=Ce(),n=((i=e.batch)==null?void 0:i.program_start)??"2026-12-10",r=_o(n,Date.now());return o(Oe,{route:t,children:[o("section",{class:"hero",children:[o("i",{class:"ph-fill ph-calendar-check moon","aria-hidden":"true"}),o("span",{class:"pill-t",children:[o("i",{class:"ph-fill ph-lock-key","aria-hidden":"true"})," Akan dibuka"]}),o("h1",{style:"font-size:22px;margin:14px 0 6px",children:["Rekod harian & Cabaran #1 dibuka ",Ee(n)]}),o("div",{class:"glass",style:"padding:12px;text-align:center",children:[o("span",{class:"num",style:"font-size:28px;color:var(--yellow)",children:r})," ",o("span",{style:"font-weight:700",children:"hari lagi"})]})]}),o(V,{style:"margin-top:12px",children:[o("h3",{style:"font-size:16px",children:"Apa yang akan anda rekod"}),o("div",{style:"display:flex;flex-wrap:wrap;gap:8px;margin-top:12px",children:Do.map(([s,l])=>o("span",{class:"chip",children:[o("i",{class:`ph ${s}`,"aria-hidden":"true"})," ",l]},l))})]}),(a=e.profile)!=null&&a.onboarded_at?null:o(O,{href:"#/onboarding",variant:"outline",block:!0,style:"margin-top:16px",children:"Lengkapkan data permulaan"}),o(Pe,{})]})}const xo={onboarding:"Data permulaan",ebook:"Ebook",ebook_read:"Ebook",tdee:"Kalkulator TDEE",group:"Group Support",akaun:"Akaun",akaun_kod:"Kod akses",aktif:"Aktifkan pakej",admin:"Admin"};function Mo({route:t}){const[e,n]=k(!1),r=xo[t]??"HDM BOOSTER";return o(Oe,{route:t,title:r,back:"#/",tabs:t!=="onboarding",children:[o(Vt,{icon:"ph-bold ph-hourglass-medium",tone:"blue",title:"Akan datang",text:"Halaman ini sedang disiapkan.",children:t!=="onboarding"?o(O,{href:"#/",variant:"outline",block:!0,children:"Kembali ke Utama"}):null}),t==="akaun"||t==="onboarding"?o(O,{variant:"danger-t",block:!0,icon:"ph-bold ph-sign-out",loading:e,style:"margin-top:12px",onClick:async()=>{n(!0);try{await Cr()}finally{n(!1)}},children:"Log keluar"}):null]})}function Uo(){return o(Oe,{route:"tiada",title:"Tidak dijumpai",children:o(Vt,{icon:"ph-bold ph-compass",title:"Halaman tidak dijumpai",text:"Pautan ini tidak wujud.",children:o(O,{href:"#/",block:!0,children:"Kembali ke Utama"})})})}function $o(){return o("div",{class:"phone no-tabs",style:"display:grid;place-items:center","aria-busy":"true",children:o("div",{style:"text-align:center",children:[o("span",{class:"wordmark",children:["HDM ",o("b",{children:"BOOSTER"})]}),o("p",{class:"muted small",style:"margin-top:10px",children:[o("i",{class:"ph-bold ph-spinner spin","aria-hidden":"true"})," Memuatkan…"]})]})})}function Bo({s:t}){const e=t.errorReason==="tiada_profil";return o("div",{class:"phone no-tabs",children:o("main",{class:"page",style:"padding-top:48px",children:o(Vt,{icon:"ph-bold ph-warning-circle",tone:"yellow",title:e?"Akaun belum lengkap":"Tidak dapat memuatkan data",text:t.error,children:[e?null:o(O,{block:!0,onClick:()=>void Sr(),children:"Cuba lagi"}),o(O,{variant:e?"primary":"ghost",block:!0,style:"margin-top:8px",onClick:()=>void Cr(),children:"Log keluar"})]})})})}function Fo({route:t}){switch(t.name){case"masuk":return o(uo,{});case"daftar":return o(ho,{});case"lupa":return o(po,{});case"home":return o(Oo,{});case"bantuan":return o(No,{});case"rekod":case"cabaran":return o(Lo,{route:t.name});case"tiada":return o(Uo,{});default:return o(Mo,{route:t.name})}}function Ho(){var a;const t=Qr(),e=Ce();ce(()=>ro(),[]);const n=Xr(t,{status:e.status,onboarded:!!((a=e.profile)!=null&&a.onboarded_at),roles:e.roles});ce(()=>{n&&ze(n,!0)},[n]);const r=zn.has(t.name);let i;return e.status==="error"&&!r?i=o(Bo,{s:e}):n||e.status==="loading"&&!r?i=o($o,{}):i=o(Fo,{route:t}),o(ee,{children:[i,o(lo,{})]})}Hr(o(Ho,{}),document.getElementById("app"));
