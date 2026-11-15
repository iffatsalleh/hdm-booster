(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();var mt,A,tr,ne,cn,nr,rr,yt,Ze,Re,ar,zt,xt,Ot,it={},st=[],fa=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,gt=Array.isArray;function J(t,e){for(var n in e)t[n]=e[n];return t}function Wt(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function ma(t,e,n){var r,i,s,o={};for(s in e)s=="key"?r=e[s]:s=="ref"?i=e[s]:o[s]=e[s];if(arguments.length>2&&(o.children=arguments.length>3?mt.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(s in t.defaultProps)o[s]===void 0&&(o[s]=t.defaultProps[s]);return et(t,o,r,i,null)}function et(t,e,n,r,i){var s={type:t,props:e,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:i??++tr,__i:-1,__u:0};return i==null&&A.vnode!=null&&A.vnode(s),s}function O(t){return t.children}function tt(t,e){this.props=t,this.context=e}function he(t,e){if(e==null)return t.__?he(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?he(t):null}function ga(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,r=[],i=[],s=J({},e);s.__v=e.__v+1,A.vnode&&A.vnode(s),Gt(t.__P,s,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,r,n??he(e),!!(32&e.__u),i),s.__v=e.__v,s.__.__k[s.__i]=s,cr(r,s,i),e.__e=e.__=null,s.__e!=n&&ir(s)}}function ir(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),ir(t)}function dn(t){(!t.__d&&(t.__d=!0)&&ne.push(t)&&!ot.__r++||cn!=A.debounceRendering)&&((cn=A.debounceRendering)||nr)(ot)}function ot(){try{for(var t,e=1;ne.length;)ne.length>e&&ne.sort(rr),t=ne.shift(),e=ne.length,ga(t)}finally{ne.length=ot.__r=0}}function sr(t,e,n,r,i,s,o,l,c,d,h){var p,u,f,y,v,g,w=r&&r.__k||st,_=e.length;for(c=_a(n,e,w,c,_),p=0;p<_;p++)(f=n.__k[p])!=null&&(u=f.__i!=-1&&w[f.__i]||it,f.__i=p,g=Gt(t,f,u,i,s,o,l,c,d,h),y=f.__e,f.ref&&u.ref!=f.ref&&(u.ref&&Jt(u.ref,null,f),h.push(f.ref,f.__c||y,f)),v==null&&y!=null&&(v=y),4&f.__u?(c=or(f,c,t),u.__e&&(u.__e=null)):typeof f.type=="function"&&g!==void 0?c=g:y&&(c=y.nextSibling),f.__u&=-7);return n.__e=v,c}function _a(t,e,n,r,i){var s,o,l,c,d,h=n.length,p=h,u=0;for(t.__k=new Array(i),s=0;s<i;s++)(o=e[s])!=null&&typeof o!="boolean"&&typeof o!="function"?(typeof o=="string"||typeof o=="number"||typeof o=="bigint"||o.constructor==String?o=t.__k[s]=et(null,o,null,null,null):gt(o)?o=t.__k[s]=et(O,{children:o},null,null,null):o.constructor===void 0&&o.__b>0?o=t.__k[s]=et(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):t.__k[s]=o,c=s+u,o.__=t,o.__b=t.__b+1,l=null,(d=o.__i=ba(o,n,c,p))!=-1&&(p--,(l=n[d])&&(l.__u|=2)),l==null||l.__v==null?(d==-1&&(i>h?u--:i<h&&u++),typeof o.type!="function"&&(o.__u|=4)):d!=c&&(d==c-1?u--:d==c+1?u++:(d>c?u--:u++,o.__u|=4))):t.__k[s]=null;if(p)for(s=0;s<h;s++)(l=n[s])!=null&&!(2&l.__u)&&(l.__e==r&&(r=he(l)),ur(l,l));return r}function or(t,e,n){var r,i;if(typeof t.type=="function"){for(r=t.__k,i=0;r&&i<r.length;i++)r[i]&&(r[i].__=t,e=or(r[i],e,n));return e}t.__e!=e&&(e&&t.type&&!e.parentNode&&(e=he(t)),e=n.insertBefore(t.__e,e||null));do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function ba(t,e,n,r){var i,s,o,l=t.key,c=t.type,d=e[n],h=d!=null&&(2&d.__u)==0;if(d===null&&l==null||h&&l==d.key&&c==d.type)return n;if(r>(h?1:0)){for(i=n-1,s=n+1;i>=0||s<e.length;)if((d=e[o=i>=0?i--:s++])!=null&&!(2&d.__u)&&l==d.key&&c==d.type)return o}return-1}function un(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||fa.test(e)?n:n+"px"}function qe(t,e,n,r,i){var s,o;e:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof r=="string"&&(t.style.cssText=r=""),r)for(e in r)n&&e in n||un(t.style,e,"");if(n)for(e in n)r&&n[e]==r[e]||un(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")s=e!=(e=e.replace(ar,"$1")),o=e.toLowerCase(),e=o in t||e=="onFocusOut"||e=="onFocusIn"?o.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+s]=n,n?r?n[Re]=r[Re]:(n[Re]=zt,t.addEventListener(e,s?Ot:xt,s)):t.removeEventListener(e,s?Ot:xt,s);else{if(i=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function hn(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e[Ze]==null)e[Ze]=zt++;else if(e[Ze]<n[Re])return;return n(A.event?A.event(e):e)}}}function Gt(t,e,n,r,i,s,o,l,c,d){var h,p,u,f,y,v,g,w,_,m,k,S,C,B,_e,oe,M=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(c=!!(32&n.__u),s=[l=e.__e=n.__e]),(h=A.__b)&&h(e);e:if(typeof M=="function"){p=o.length;try{if(_=e.props,m=M.prototype&&M.prototype.render,k=(h=M.contextType)&&r[h.__c],S=h?k?k.props.value:h.__:r,n.__c?w=(u=e.__c=n.__c).__=u.__E:(m?e.__c=u=new M(_,S):(e.__c=u=new tt(_,S),u.constructor=M,u.render=ka),k&&k.sub(u),u.state||(u.state={}),u.__n=r,f=u.__d=!0,u.__h=[],u._sb=[]),m&&u.__s==null&&(u.__s=u.state),m&&M.getDerivedStateFromProps!=null&&(u.__s==u.state&&(u.__s=J({},u.__s)),J(u.__s,M.getDerivedStateFromProps(_,u.__s))),y=u.props,v=u.state,u.__v=e,f)m&&M.getDerivedStateFromProps==null&&u.componentWillMount!=null&&u.componentWillMount(),m&&u.componentDidMount!=null&&u.__h.push(u.componentDidMount);else{if(m&&M.getDerivedStateFromProps==null&&_!==y&&u.componentWillReceiveProps!=null&&u.componentWillReceiveProps(_,S),e.__v==n.__v||!u.__e&&u.shouldComponentUpdate!=null&&u.shouldComponentUpdate(_,u.__s,S)===!1){e.__v!=n.__v&&(u.props=_,u.state=u.__s,u.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(be){be&&(be.__=e)}),st.push.apply(u.__h,u._sb),u._sb=[],u.__h.length&&o.push(u),l=he(n);break e}u.componentWillUpdate!=null&&u.componentWillUpdate(_,u.__s,S),m&&u.componentDidUpdate!=null&&u.__h.push(function(){u.componentDidUpdate(y,v,g)})}if(u.context=S,u.props=_,u.__P=t,u.__e=!1,C=A.__r,B=0,m)u.state=u.__s,u.__d=!1,C&&C(e),h=u.render(u.props,u.state,u.context),st.push.apply(u.__h,u._sb),u._sb=[];else do u.__d=!1,C&&C(e),h=u.render(u.props,u.state,u.context),u.state=u.__s;while(u.__d&&++B<25);u.state=u.__s,u.getChildContext!=null&&(r=J(J({},r),u.getChildContext())),m&&!f&&u.getSnapshotBeforeUpdate!=null&&(g=u.getSnapshotBeforeUpdate(y,v)),_e=h!=null&&h.type===O&&h.key==null?dr(h.props.children):h,l=sr(t,gt(_e)?_e:[_e],e,n,r,i,s,o,l,c,d),u.base=e.__e,e.__u&=-161,u.__h.length&&o.push(u),w&&(u.__E=u.__=null)}catch(be){if(o.length=p,e.__v=null,c||s!=null){if(be.then){for(e.__u|=c?160:128;l&&l.nodeType==8&&l.nextSibling;)l=l.nextSibling;s!=null&&(s[s.indexOf(l)]=null),e.__e=l}else if(s!=null)for(oe=s.length;oe--;)Wt(s[oe])}else e.__e=n.__e;e.__k==null&&(e.__k=n.__k||[]),be.then||lr(e),A.__e(be,e,n)}}else s==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):l=e.__e=ya(n.__e,e,n,r,i,s,o,c,d);return(h=A.diffed)&&h(e),128&e.__u?void 0:l}function lr(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(lr))}function cr(t,e,n){for(var r=0;r<n.length;r++)Jt(n[r],n[++r],n[++r]);A.__c&&A.__c(e,t),t.some(function(i){try{t=i.__h,i.__h=[],t.some(function(s){s.call(i)})}catch(s){A.__e(s,i.__v)}})}function dr(t){return typeof t!="object"||t==null||t.__b>0?t:gt(t)?t.map(dr):t.constructor!==void 0?null:J({},t)}function ya(t,e,n,r,i,s,o,l,c){var d,h,p,u,f,y,v,g=n.props||it,w=e.props,_=e.type;if(_=="svg"?i="http://www.w3.org/2000/svg":_=="math"?i="http://www.w3.org/1998/Math/MathML":i||(i="http://www.w3.org/1999/xhtml"),s!=null){for(d=0;d<s.length;d++)if((f=s[d])&&"setAttribute"in f==!!_&&(_?f.localName==_:f.nodeType==3)){t=f,s[d]=null;break}}if(t==null){if(_==null)return document.createTextNode(w);t=document.createElementNS(i,_,w.is&&w),l&&(A.__m&&A.__m(e,s),l=!1),s=null}if(_==null)g===w||l&&t.data==w||(t.data=w);else{if(s=_=="textarea"&&w.defaultValue!=null?null:s&&mt.call(t.childNodes),!l&&s!=null)for(g={},d=0;d<t.attributes.length;d++)g[(f=t.attributes[d]).name]=f.value;for(d in g)f=g[d],d=="dangerouslySetInnerHTML"?p=f:d=="children"||d in w||d=="value"&&"defaultValue"in w||d=="checked"&&"defaultChecked"in w||qe(t,d,null,f,i);for(d in w)f=w[d],d=="children"?u=f:d=="dangerouslySetInnerHTML"?h=f:d=="value"?y=f:d=="checked"?v=f:l&&typeof f!="function"||g[d]===f||qe(t,d,f,g[d],i);if(h)l||p&&(h.__html==p.__html||h.__html==t.innerHTML)||(t.innerHTML=h.__html),e.__k=[];else if(p&&(t.innerHTML=""),sr(e.type=="template"?t.content:t,gt(u)?u:[u],e,n,r,_=="foreignObject"?"http://www.w3.org/1999/xhtml":i,s,o,s?s[0]:n.__k&&he(n,0),l,c),s!=null)for(d=s.length;d--;)Wt(s[d]);l&&_!="textarea"||(d="value",_=="progress"&&y==null?t.removeAttribute("value"):y!=null&&(y!==t[d]||_=="progress"&&!y||_=="option"&&y!=g[d])&&qe(t,d,y,g[d],i),d="checked",v!=null&&v!=t[d]&&qe(t,d,v,g[d],i))}return t}function Jt(t,e,n){try{if(typeof t=="function"){var r=typeof t.__u=="function";r&&t.__u(),r&&e==null||(t.__u=t(e))}else t.current=e}catch(i){A.__e(i,n)}}function ur(t,e,n){var r,i;if(A.unmount&&A.unmount(t),(r=t.ref)&&(r.current&&r.current!=t.__e||Jt(r,null,e)),(r=t.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(s){A.__e(s,e)}r.base=r.__P=r.__n=null}if(r=t.__k)for(i=0;i<r.length;i++)r[i]&&ur(r[i],e,n||typeof t.type!="function");n||Wt(t.__e),t.__c=t.__=t.__e=void 0}function ka(t,e,n){return this.constructor(t,n)}function va(t,e,n){var r,i,s,o;e==document&&(e=document.documentElement),A.__&&A.__(t,e),i=(r=!1)?null:e.__k,s=[],o=[],Gt(e,t=e.__k=ma(O,null,[t]),i||it,it,e.namespaceURI,i?null:e.firstChild?mt.call(e.childNodes):null,s,i?i.__e:e.firstChild,r,o),cr(s,t,o),t.props.children=null}mt=st.slice,A={__e:function(t,e,n,r){for(var i,s,o;e=e.__;)if((i=e.__c)&&!i.__)try{if((s=i.constructor)&&s.getDerivedStateFromError!=null&&(i.setState(s.getDerivedStateFromError(t)),o=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(t,r||{}),o=i.__d),o)return i.__E=i}catch(l){t=l}throw t}},tr=0,tt.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=J({},this.state),typeof t=="function"&&(t=t(J({},n),this.props)),t&&J(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),dn(this))},tt.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),dn(this))},tt.prototype.render=O,ne=[],nr=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,rr=function(t,e){return t.__v.__b-e.__v.__b},ot.__r=0,yt=Math.random().toString(8),Ze="__d"+yt,Re="__a"+yt,ar=/(PointerCapture)$|Capture$/i,zt=0,xt=hn(!1),Ot=hn(!0);var wa=0;function a(t,e,n,r,i,s){e||(e={});var o,l,c=e;if("ref"in c)for(l in c={},e)l=="ref"?o=e[l]:c[l]=e[l];var d={type:t,props:c,key:n,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--wa,__i:-1,__u:0,__source:i,__self:s};if(typeof t=="function"&&(o=t.defaultProps))for(l in o)c[l]===void 0&&(c[l]=o[l]);return A.vnode&&A.vnode(d),d}var Le,P,kt,pn,Rt=0,hr=[],x=A,fn=x.__b,mn=x.__r,gn=x.diffed,_n=x.__c,bn=x.unmount,yn=x.__;function qt(t,e){x.__h&&x.__h(P,t,Rt||e),Rt=0;var n=P.__H||(P.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function b(t){return Rt=1,Ea(mr,t)}function Ea(t,e,n){var r=qt(Le++,2);if(r.t=t,!r.__c&&(r.__=[mr(void 0,e),function(l){var c=r.__N?r.__N[0]:r.__[0],d=r.t(c,l);c!==d&&(r.__N=[d,r.__[1]],r.__c.setState({}))}],r.__c=P,!P.__f)){var i=function(l,c,d){if(!r.__c.__H)return!0;var h=!1,p=r.__c.props!==l;if(r.__c.__H.__.some(function(f){if(f.__N){h=!0;var y=f.__[0];f.__=f.__N,f.__N=void 0,y!==f.__[0]&&(p=!0)}}),s){var u=s.call(this,l,c,d);return h?u||p:u}return!h||p};P.__f=!0;var s=P.shouldComponentUpdate,o=P.componentWillUpdate;P.componentWillUpdate=function(l,c,d){if(this.__e){var h=s;s=void 0,i(l,c,d),s=h}o&&o.call(this,l,c,d)},P.shouldComponentUpdate=i}return r.__N||r.__}function ae(t,e){var n=qt(Le++,3);!x.__s&&fr(n.__H,e)&&(n.__=t,n.u=e,P.__H.__h.push(n))}function pr(t,e){var n=qt(Le++,7);return fr(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function Ia(){for(var t;t=hr.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(nt),e.__h.some(Dt),e.__h=[]}catch(n){e.__h=[],x.__e(n,t.__v)}}}x.__b=function(t){P=null,fn&&fn(t)},x.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),yn&&yn(t,e)},x.__r=function(t){mn&&mn(t),Le=0;var e=(P=t.__c).__H;e&&(kt===P?(e.__h=[],P.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(nt),e.__h.some(Dt),e.__h=[],Le=0)),kt=P},x.diffed=function(t){gn&&gn(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(hr.push(e)!==1&&pn===x.requestAnimationFrame||((pn=x.requestAnimationFrame)||Sa)(Ia)),e.__H.__.some(function(n){n.u&&(n.__H=n.u,n.u=void 0)})),kt=P=null},x.__c=function(t,e){e.some(function(n){try{n.__h.some(nt),n.__h=n.__h.filter(function(r){return!r.__||Dt(r)})}catch(r){e.some(function(i){i.__h&&(i.__h=[])}),e=[],x.__e(r,n.__v)}}),_n&&_n(t,e)},x.unmount=function(t){bn&&bn(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(r){try{nt(r)}catch(i){e=i}}),n.__H=void 0,e&&x.__e(e,n.__v))};var kn=typeof requestAnimationFrame=="function";function Sa(t){var e,n=function(){clearTimeout(r),kn&&cancelAnimationFrame(e),setTimeout(t)},r=setTimeout(n,35);kn&&(e=requestAnimationFrame(n))}function nt(t){var e=P,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),P=e}function Dt(t){var e=P;t.__c=t.__(),P=e}function fr(t,e){return!t||t.length!==e.length||e.some(function(n,r){return n!==t[r]})}function mr(t,e){return typeof e=="function"?e(t):e}const Ta=[["home",/^\/$/,[]],["masuk",/^\/masuk$/,[]],["daftar",/^\/daftar$/,[]],["lupa",/^\/lupa$/,[]],["onboarding",/^\/onboarding$/,[]],["ebook",/^\/ebook$/,[]],["ebook_read",/^\/ebook\/([^/]+)$/,["id"]],["tdee",/^\/tdee$/,[]],["group",/^\/group$/,[]],["akaun",/^\/akaun$/,[]],["akaun_kod",/^\/akaun\/kod$/,[]],["aktif",/^\/aktif$/,[]],["bantuan",/^\/bantuan$/,[]],["rekod",/^\/rekod$/,[]],["cabaran",/^\/cabaran$/,[]],["admin",/^\/admin(?:\/(.*))?$/,["rest"]]],Aa=new Set(["masuk","daftar","lupa"]),gr=new Set(["masuk","daftar","lupa","bantuan"]),_r=["superadmin","coach"],Nt=t=>{try{return decodeURIComponent(t)}catch{return t}};function Ca(t){const e={};if(!t)return e;for(const n of t.split("&")){if(!n)continue;const[r,i=""]=n.split("=");e[Nt(r)]=Nt(i.replace(/\+/g," "))}return e}function vn(t){const[e,n]=t.replace(/^#/,"").split("?"),r=Ca(n);let i=e;i.startsWith("/")||(i="/"+i),i.length>1&&(i=i.replace(/\/+$/,""));for(const[s,o,l]of Ta){const c=o.exec(i);if(!c)continue;const d={};return l.forEach((h,p)=>{c[p+1]!==void 0&&(d[h]=Nt(c[p+1]))}),{name:s,params:d,path:i,query:r}}return{name:"tiada",params:{},path:i,query:r}}function Pa(t,e){var i;if(e.status==="loading"||e.status==="error")return null;const n=gr.has(t.name);if(e.status==="anon")return t.name==="aktif"?"#/masuk?next=aktif":n?null:"#/masuk";if(t.name==="bantuan")return null;const r=e.roles.some(s=>_r.includes(s));return!e.onboarded&&!(r&&t.name==="admin")?n||t.name==="onboarding"?null:"#/onboarding":Aa.has(t.name)?((i=t.query)==null?void 0:i.next)==="aktif"?"#/aktif":"#/":t.name==="admin"&&!r?"#/":null}function Me(t,e=!1){location.hash!==t&&(e?location.replace(t):location.hash=t)}function xa(){const[t,e]=b(()=>vn(location.hash));return ae(()=>{const n=()=>{e(vn(location.hash)),window.scrollTo(0,0)};return window.addEventListener("hashchange",n),()=>window.removeEventListener("hashchange",n)},[]),t}const Oa={},z=t=>typeof t=="string"?t.trim():"",wn=t=>t.replace(/\/+$/,"");function Ra(t,e){var r,i,s;const n=t==null?void 0:t.HDM_CONFIG;return n&&typeof n=="object"?{firebase:{apiKey:z((r=n.firebase)==null?void 0:r.apiKey),authDomain:z((i=n.firebase)==null?void 0:i.authDomain),projectId:z((s=n.firebase)==null?void 0:s.projectId)},apiUrl:wn(z(n.apiUrl)),gasUrl:z(n.gasUrl)}:{firebase:{apiKey:z(e.VITE_FIREBASE_API_KEY),authDomain:z(e.VITE_FIREBASE_AUTH_DOMAIN),projectId:z(e.VITE_FIREBASE_PROJECT_ID)},apiUrl:wn(z(e.VITE_API_URL)),gasUrl:z(e.VITE_GAS_URL)}}const br=Ra(typeof window<"u"?window:void 0,Oa),Ee="60134417042",Da=()=>{};var En={};/**
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
 */const yr=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let i=t.charCodeAt(r);i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=i&63|128):(i&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=i&63|128):(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=i&63|128)}return e},Na=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const i=t[n++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[n++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[n++],o=t[n++],l=t[n++],c=((i&7)<<18|(s&63)<<12|(o&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const s=t[n++],o=t[n++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},kr={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,l=o?t[i+1]:0,c=i+2<t.length,d=c?t[i+2]:0,h=s>>2,p=(s&3)<<4|l>>4;let u=(l&15)<<2|d>>6,f=d&63;c||(f=64,o||(u=64)),r.push(n[h],n[p],n[u],n[f])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(yr(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Na(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<t.length;){const s=n[t.charAt(i++)],l=i<t.length?n[t.charAt(i)]:0;++i;const d=i<t.length?n[t.charAt(i)]:64;++i;const p=i<t.length?n[t.charAt(i)]:64;if(++i,s==null||l==null||d==null||p==null)throw new La;const u=s<<2|l>>4;if(r.push(u),d!==64){const f=l<<4&240|d>>2;if(r.push(f),p!==64){const y=d<<6&192|p;r.push(y)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class La extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Ma=function(t){const e=yr(t);return kr.encodeByteArray(e,!0)},vr=function(t){return Ma(t).replace(/\./g,"")},wr=function(t){try{return kr.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Ua(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const $a=()=>Ua().__FIREBASE_DEFAULTS__,Ba=()=>{if(typeof process>"u"||typeof En>"u")return;const t=En.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Fa=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&wr(t[1]);return e&&JSON.parse(e)},Er=()=>{try{return Da()||$a()||Ba()||Fa()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Ha=()=>{var t;return(t=Er())===null||t===void 0?void 0:t.config},ja=t=>{var e;return(e=Er())===null||e===void 0?void 0:e[`_${t}`]};/**
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
 */class Va{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
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
 */function Ir(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}/**
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
 */function N(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Ka(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(N())}function za(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Wa(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function Ga(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Ja(){const t=N();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function qa(){try{return typeof indexedDB=="object"}catch{return!1}}function Xa(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(n){e(n)}})}/**
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
 */const Ya="FirebaseError";class ie extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=Ya,Object.setPrototypeOf(this,ie.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ve.prototype.create)}}class Ve{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?Qa(s,r):"Error",l=`${this.serviceName}: ${o} (${i}).`;return new ie(i,l,r)}}function Qa(t,e){return t.replace(Za,(n,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const Za=/\{\$([^}]+)}/g;function lt(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const i of n){if(!r.includes(i))return!1;const s=t[i],o=e[i];if(In(s)&&In(o)){if(!lt(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!n.includes(i))return!1;return!0}function In(t){return t!==null&&typeof t=="object"}/**
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
 */function Sr(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function xe(t){const e={};return t.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function Oe(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function ei(t,e){const n=new ti(t,e);return n.subscribe.bind(n)}class ti{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let i;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");ni(e,["next","error","complete"])?i=e:i={next:e,error:n,complete:r},i.next===void 0&&(i.next=vt),i.error===void 0&&(i.error=vt),i.complete===void 0&&(i.complete=vt);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function ni(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function vt(){}/**
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
 */function Q(t){return t&&t._delegate?t._delegate:t}class Ie{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const le="[DEFAULT]";/**
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
 */class ri{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new Va;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:n});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(ii(e))try{this.getOrInitializeService({instanceIdentifier:le})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(n);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=le){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=le){return this.instances.has(e)}getOptions(e=le){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[s,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(s);r===l&&o.resolve(i)}return i}onInit(e,n){var r;const i=this.normalizeInstanceIdentifier(n),s=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;s.add(e),this.onInitCallbacks.set(i,s);const o=this.instances.get(i);return o&&e(o,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const i of r)try{i(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:ai(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=le){return this.component?this.component.multipleInstances?e:le:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function ai(t){return t===le?void 0:t}function ii(t){return t.instantiationMode==="EAGER"}/**
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
 */class si{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new ri(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var T;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(T||(T={}));const oi={debug:T.DEBUG,verbose:T.VERBOSE,info:T.INFO,warn:T.WARN,error:T.ERROR,silent:T.SILENT},li=T.INFO,ci={[T.DEBUG]:"log",[T.VERBOSE]:"log",[T.INFO]:"info",[T.WARN]:"warn",[T.ERROR]:"error"},di=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),i=ci[e];if(i)console[i](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Tr{constructor(e){this.name=e,this._logLevel=li,this._logHandler=di,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in T))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?oi[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,T.DEBUG,...e),this._logHandler(this,T.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,T.VERBOSE,...e),this._logHandler(this,T.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,T.INFO,...e),this._logHandler(this,T.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,T.WARN,...e),this._logHandler(this,T.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,T.ERROR,...e),this._logHandler(this,T.ERROR,...e)}}const ui=(t,e)=>e.some(n=>t instanceof n);let Sn,Tn;function hi(){return Sn||(Sn=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function pi(){return Tn||(Tn=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Ar=new WeakMap,Lt=new WeakMap,Cr=new WeakMap,wt=new WeakMap,Xt=new WeakMap;function fi(t){const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{n(re(t.result)),i()},o=()=>{r(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&Ar.set(n,t)}).catch(()=>{}),Xt.set(e,t),e}function mi(t){if(Lt.has(t))return;const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{n(),i()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});Lt.set(t,e)}let Mt={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return Lt.get(t);if(e==="objectStoreNames")return t.objectStoreNames||Cr.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return re(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function gi(t){Mt=t(Mt)}function _i(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(Et(this),e,...n);return Cr.set(r,e.sort?e.sort():[e]),re(r)}:pi().includes(t)?function(...e){return t.apply(Et(this),e),re(Ar.get(this))}:function(...e){return re(t.apply(Et(this),e))}}function bi(t){return typeof t=="function"?_i(t):(t instanceof IDBTransaction&&mi(t),ui(t,hi())?new Proxy(t,Mt):t)}function re(t){if(t instanceof IDBRequest)return fi(t);if(wt.has(t))return wt.get(t);const e=bi(t);return e!==t&&(wt.set(t,e),Xt.set(e,t)),e}const Et=t=>Xt.get(t);function yi(t,e,{blocked:n,upgrade:r,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),l=re(o);return r&&o.addEventListener("upgradeneeded",c=>{r(re(o.result),c.oldVersion,c.newVersion,re(o.transaction),c)}),n&&o.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),l.then(c=>{s&&c.addEventListener("close",()=>s()),i&&c.addEventListener("versionchange",d=>i(d.oldVersion,d.newVersion,d))}).catch(()=>{}),l}const ki=["get","getKey","getAll","getAllKeys","count"],vi=["put","add","delete","clear"],It=new Map;function An(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(It.get(e))return It.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,i=vi.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(i||ki.includes(n)))return;const s=async function(o,...l){const c=this.transaction(o,i?"readwrite":"readonly");let d=c.store;return r&&(d=d.index(l.shift())),(await Promise.all([d[n](...l),i&&c.done]))[0]};return It.set(e,s),s}gi(t=>({...t,get:(e,n,r)=>An(e,n)||t.get(e,n,r),has:(e,n)=>!!An(e,n)||t.has(e,n)}));/**
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
 */class wi{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(Ei(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function Ei(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Ut="@firebase/app",Cn="0.13.2";/**
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
 */const X=new Tr("@firebase/app"),Ii="@firebase/app-compat",Si="@firebase/analytics-compat",Ti="@firebase/analytics",Ai="@firebase/app-check-compat",Ci="@firebase/app-check",Pi="@firebase/auth",xi="@firebase/auth-compat",Oi="@firebase/database",Ri="@firebase/data-connect",Di="@firebase/database-compat",Ni="@firebase/functions",Li="@firebase/functions-compat",Mi="@firebase/installations",Ui="@firebase/installations-compat",$i="@firebase/messaging",Bi="@firebase/messaging-compat",Fi="@firebase/performance",Hi="@firebase/performance-compat",ji="@firebase/remote-config",Vi="@firebase/remote-config-compat",Ki="@firebase/storage",zi="@firebase/storage-compat",Wi="@firebase/firestore",Gi="@firebase/ai",Ji="@firebase/firestore-compat",qi="firebase",Xi="11.10.0";/**
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
 */const Yi="[DEFAULT]",Qi={[Ut]:"fire-core",[Ii]:"fire-core-compat",[Ti]:"fire-analytics",[Si]:"fire-analytics-compat",[Ci]:"fire-app-check",[Ai]:"fire-app-check-compat",[Pi]:"fire-auth",[xi]:"fire-auth-compat",[Oi]:"fire-rtdb",[Ri]:"fire-data-connect",[Di]:"fire-rtdb-compat",[Ni]:"fire-fn",[Li]:"fire-fn-compat",[Mi]:"fire-iid",[Ui]:"fire-iid-compat",[$i]:"fire-fcm",[Bi]:"fire-fcm-compat",[Fi]:"fire-perf",[Hi]:"fire-perf-compat",[ji]:"fire-rc",[Vi]:"fire-rc-compat",[Ki]:"fire-gcs",[zi]:"fire-gcs-compat",[Wi]:"fire-fst",[Ji]:"fire-fst-compat",[Gi]:"fire-vertex","fire-js":"fire-js",[qi]:"fire-js-all"};/**
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
 */const $t=new Map,Zi=new Map,Bt=new Map;function Pn(t,e){try{t.container.addComponent(e)}catch(n){X.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Ue(t){const e=t.name;if(Bt.has(e))return X.debug(`There were multiple attempts to register component ${e}.`),!1;Bt.set(e,t);for(const n of $t.values())Pn(n,t);for(const n of Zi.values())Pn(n,t);return!0}function es(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function G(t){return t==null?!1:t.settings!==void 0}/**
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
 */const ts={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},de=new Ve("app","Firebase",ts);/**
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
 */class ns{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Ie("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw de.create("app-deleted",{appName:this._name})}}/**
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
 */const Yt=Xi;function rs(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Yi,automaticDataCollectionEnabled:!0},e),i=r.name;if(typeof i!="string"||!i)throw de.create("bad-app-name",{appName:String(i)});if(n||(n=Ha()),!n)throw de.create("no-options");const s=$t.get(i);if(s){if(lt(n,s.options)&&lt(r,s.config))return s;throw de.create("duplicate-app",{appName:i})}const o=new si(i);for(const c of Bt.values())o.addComponent(c);const l=new ns(n,r,o);return $t.set(i,l),l}function ke(t,e,n){var r;let i=(r=Qi[t])!==null&&r!==void 0?r:t;n&&(i+=`-${n}`);const s=i.match(/\s|\//),o=e.match(/\s|\//);if(s||o){const l=[`Unable to register library "${i}" with version "${e}":`];s&&l.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&o&&l.push("and"),o&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),X.warn(l.join(" "));return}Ue(new Ie(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
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
 */const as="firebase-heartbeat-database",is=1,$e="firebase-heartbeat-store";let St=null;function Pr(){return St||(St=yi(as,is,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore($e)}catch(n){console.warn(n)}}}}).catch(t=>{throw de.create("idb-open",{originalErrorMessage:t.message})})),St}async function ss(t){try{const n=(await Pr()).transaction($e),r=await n.objectStore($e).get(xr(t));return await n.done,r}catch(e){if(e instanceof ie)X.warn(e.message);else{const n=de.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});X.warn(n.message)}}}async function xn(t,e){try{const r=(await Pr()).transaction($e,"readwrite");await r.objectStore($e).put(e,xr(t)),await r.done}catch(n){if(n instanceof ie)X.warn(n.message);else{const r=de.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});X.warn(r.message)}}}function xr(t){return`${t.name}!${t.options.appId}`}/**
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
 */const os=1024,ls=30;class cs{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new us(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=On();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>ls){const o=hs(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){X.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=On(),{heartbeatsToSend:r,unsentEntries:i}=ds(this._heartbeatsCache.heartbeats),s=vr(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(n){return X.warn(n),""}}}function On(){return new Date().toISOString().substring(0,10)}function ds(t,e=os){const n=[];let r=t.slice();for(const i of t){const s=n.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),Rn(n)>e){s.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),Rn(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class us{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return qa()?Xa().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await ss(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return xn(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return xn(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function Rn(t){return vr(JSON.stringify({version:2,heartbeats:t})).length}function hs(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
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
 */function ps(t){Ue(new Ie("platform-logger",e=>new wi(e),"PRIVATE")),Ue(new Ie("heartbeat",e=>new cs(e),"PRIVATE")),ke(Ut,Cn,t),ke(Ut,Cn,"esm2017"),ke("fire-js","")}ps("");var fs="firebase",ms="11.10.0";/**
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
 */ke(fs,ms,"app");function Or(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(t);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(t,r[i])&&(n[r[i]]=t[r[i]]);return n}function Rr(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const gs=Rr,Dr=new Ve("auth","Firebase",Rr());/**
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
 */const ct=new Tr("@firebase/auth");function _s(t,...e){ct.logLevel<=T.WARN&&ct.warn(`Auth (${Yt}): ${t}`,...e)}function rt(t,...e){ct.logLevel<=T.ERROR&&ct.error(`Auth (${Yt}): ${t}`,...e)}/**
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
 */function pe(t,...e){throw Zt(t,...e)}function Qt(t,...e){return Zt(t,...e)}function Nr(t,e,n){const r=Object.assign(Object.assign({},gs()),{[e]:n});return new Ve("auth","Firebase",r).create(e,{appName:t.name})}function ue(t){return Nr(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Zt(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return Dr.create(t,...e)}function E(t,e,...n){if(!t)throw Zt(e,...n)}function q(t){const e="INTERNAL ASSERTION FAILED: "+t;throw rt(e),new Error(e)}function dt(t,e){t||q(e)}function bs(){return Dn()==="http:"||Dn()==="https:"}function Dn(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
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
 */function ys(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(bs()||Wa()||"connection"in navigator)?navigator.onLine:!0}function ks(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
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
 */class Ke{constructor(e,n){this.shortDelay=e,this.longDelay=n,dt(n>e,"Short delay should be less than long delay!"),this.isMobile=Ka()||Ga()}get(){return ys()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function vs(t,e){dt(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
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
 */class Lr{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;q("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;q("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;q("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const ws={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const Es=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Is=new Ke(3e4,6e4);function me(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function Z(t,e,n,r,i={}){return Mr(t,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const l=Sr(Object.assign({key:t.config.apiKey},o)).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const d=Object.assign({method:e,headers:c},s);return za()||(d.referrerPolicy="no-referrer"),t.emulatorConfig&&Ir(t.emulatorConfig.host)&&(d.credentials="include"),Lr.fetch()(await Ur(t,t.config.apiHost,n,l),d)})}async function Mr(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},ws),e);try{const i=new Ts(t),s=await Promise.race([n(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw Xe(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const l=s.ok?o.errorMessage:o.error.message,[c,d]=l.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Xe(t,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw Xe(t,"email-already-in-use",o);if(c==="USER_DISABLED")throw Xe(t,"user-disabled",o);const h=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw Nr(t,h,d);pe(t,h)}}catch(i){if(i instanceof ie)throw i;pe(t,"network-request-failed",{message:String(i)})}}async function en(t,e,n,r,i={}){const s=await Z(t,e,n,r,i);return"mfaPendingCredential"in s&&pe(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function Ur(t,e,n,r){const i=`${e}${n}?${r}`,s=t,o=s.config.emulator?vs(t.config,i):`${t.config.apiScheme}://${i}`;return Es.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}function Ss(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class Ts{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(Qt(this.auth,"network-request-failed")),Is.get())})}}function Xe(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const i=Qt(t,e,r);return i.customData._tokenResponse=n,i}function Nn(t){return t!==void 0&&t.enterprise!==void 0}class As{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return Ss(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function Cs(t,e){return Z(t,"GET","/v2/recaptchaConfig",me(t,e))}/**
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
 */async function Ps(t,e){return Z(t,"POST","/v1/accounts:delete",e)}async function ut(t,e){return Z(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function De(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function xs(t,e=!1){const n=Q(t),r=await n.getIdToken(e),i=tn(r);E(i&&i.exp&&i.auth_time&&i.iat,n.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:De(Tt(i.auth_time)),issuedAtTime:De(Tt(i.iat)),expirationTime:De(Tt(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Tt(t){return Number(t)*1e3}function tn(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return rt("JWT malformed, contained fewer than 3 sections"),null;try{const i=wr(n);return i?JSON.parse(i):(rt("Failed to decode base64 JWT payload"),null)}catch(i){return rt("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function Ln(t){const e=tn(t);return E(e,"internal-error"),E(typeof e.exp<"u","internal-error"),E(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function Be(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof ie&&Os(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function Os({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class Rs{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Ft{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=De(this.lastLoginAt),this.creationTime=De(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function ht(t){var e;const n=t.auth,r=await t.getIdToken(),i=await Be(t,ut(n,{idToken:r}));E(i==null?void 0:i.users.length,n,"internal-error");const s=i.users[0];t._notifyReloadListener(s);const o=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?$r(s.providerUserInfo):[],l=Ns(t.providerData,o),c=t.isAnonymous,d=!(t.email&&s.passwordHash)&&!(l!=null&&l.length),h=c?d:!1,p={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:l,metadata:new Ft(s.createdAt,s.lastLoginAt),isAnonymous:h};Object.assign(t,p)}async function Ds(t){const e=Q(t);await ht(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Ns(t,e){return[...t.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function $r(t){return t.map(e=>{var{providerId:n}=e,r=Or(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
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
 */async function Ls(t,e){const n=await Mr(t,{},async()=>{const r=Sr({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=await Ur(t,i,"/v1/token",`key=${s}`),l=await t._getAdditionalHeaders();l["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:l,body:r};return t.emulatorConfig&&Ir(t.emulatorConfig.host)&&(c.credentials="include"),Lr.fetch()(o,c)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function Ms(t,e){return Z(t,"POST","/v2/accounts:revokeToken",me(t,e))}/**
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
 */class ve{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){E(e.idToken,"internal-error"),E(typeof e.idToken<"u","internal-error"),E(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Ln(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){E(e.length!==0,"internal-error");const n=Ln(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(E(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:i,expiresIn:s}=await Ls(e,n);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:i,expirationTime:s}=n,o=new ve;return r&&(E(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(E(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(E(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ve,this.toJSON())}_performRefresh(){return q("not implemented")}}/**
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
 */function ee(t,e){E(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class F{constructor(e){var{uid:n,auth:r,stsTokenManager:i}=e,s=Or(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new Rs(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Ft(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const n=await Be(this,this.stsTokenManager.getToken(this.auth,e));return E(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return xs(this,e)}reload(){return Ds(this)}_assign(e){this!==e&&(E(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new F(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){E(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await ht(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(G(this.auth.app))return Promise.reject(ue(this.auth));const e=await this.getIdToken();return await Be(this,Ps(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,i,s,o,l,c,d,h;const p=(r=n.displayName)!==null&&r!==void 0?r:void 0,u=(i=n.email)!==null&&i!==void 0?i:void 0,f=(s=n.phoneNumber)!==null&&s!==void 0?s:void 0,y=(o=n.photoURL)!==null&&o!==void 0?o:void 0,v=(l=n.tenantId)!==null&&l!==void 0?l:void 0,g=(c=n._redirectEventId)!==null&&c!==void 0?c:void 0,w=(d=n.createdAt)!==null&&d!==void 0?d:void 0,_=(h=n.lastLoginAt)!==null&&h!==void 0?h:void 0,{uid:m,emailVerified:k,isAnonymous:S,providerData:C,stsTokenManager:B}=n;E(m&&B,e,"internal-error");const _e=ve.fromJSON(this.name,B);E(typeof m=="string",e,"internal-error"),ee(p,e.name),ee(u,e.name),E(typeof k=="boolean",e,"internal-error"),E(typeof S=="boolean",e,"internal-error"),ee(f,e.name),ee(y,e.name),ee(v,e.name),ee(g,e.name),ee(w,e.name),ee(_,e.name);const oe=new F({uid:m,auth:e,email:u,emailVerified:k,displayName:p,isAnonymous:S,photoURL:y,phoneNumber:f,tenantId:v,stsTokenManager:_e,createdAt:w,lastLoginAt:_});return C&&Array.isArray(C)&&(oe.providerData=C.map(M=>Object.assign({},M))),g&&(oe._redirectEventId=g),oe}static async _fromIdTokenResponse(e,n,r=!1){const i=new ve;i.updateFromServerResponse(n);const s=new F({uid:n.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await ht(s),s}static async _fromGetAccountInfoResponse(e,n,r){const i=n.users[0];E(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?$r(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),l=new ve;l.updateFromIdToken(r);const c=new F({uid:i.localId,auth:e,stsTokenManager:l,isAnonymous:o}),d={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new Ft(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(c,d),c}}/**
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
 */const Mn=new Map;function ce(t){dt(t instanceof Function,"Expected a class definition");let e=Mn.get(t);return e?(dt(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Mn.set(t,e),e)}/**
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
 */class Br{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Br.type="NONE";const Un=Br;/**
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
 */function At(t,e,n){return`firebase:${t}:${e}:${n}`}class we{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=At(this.userKey,i.apiKey,s),this.fullPersistenceKey=At("persistence",i.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await ut(this.auth,{idToken:e}).catch(()=>{});return n?F._fromGetAccountInfoResponse(this.auth,n,e):null}return F._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new we(ce(Un),e,r);const i=(await Promise.all(n.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let s=i[0]||ce(Un);const o=At(r,e.config.apiKey,e.name);let l=null;for(const d of n)try{const h=await d._get(o);if(h){let p;if(typeof h=="string"){const u=await ut(e,{idToken:h}).catch(()=>{});if(!u)break;p=await F._fromGetAccountInfoResponse(e,u,h)}else p=F._fromJSON(e,h);d!==s&&(l=p),s=d;break}}catch{}const c=i.filter(d=>d._shouldAllowMigration);return!s._shouldAllowMigration||!c.length?new we(s,e,r):(s=c[0],l&&await s._set(o,l.toJSON()),await Promise.all(n.map(async d=>{if(d!==s)try{await d._remove(o)}catch{}})),new we(s,e,r))}}/**
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
 */function $n(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Fr(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Us(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(jr(e))return"Blackberry";if(Vr(e))return"Webos";if($s(e))return"Safari";if((e.includes("chrome/")||Bs(e))&&!e.includes("edge/"))return"Chrome";if(Hr(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Us(t=N()){return/firefox\//i.test(t)}function $s(t=N()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Bs(t=N()){return/crios\//i.test(t)}function Fr(t=N()){return/iemobile/i.test(t)}function Hr(t=N()){return/android/i.test(t)}function jr(t=N()){return/blackberry/i.test(t)}function Vr(t=N()){return/webos/i.test(t)}function Fs(t=N()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Hs(){return Ja()&&document.documentMode===10}function js(t=N()){return Fs(t)||Hr(t)||Vr(t)||jr(t)||/windows phone/i.test(t)||Fr(t)}/**
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
 */function Kr(t,e=[]){let n;switch(t){case"Browser":n=$n(N());break;case"Worker":n=`${$n(N())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Yt}/${r}`}/**
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
 */class Vs{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=s=>new Promise((o,l)=>{try{const c=e(s);o(c)}catch(c){l(c)}});r.onAbort=n,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const i of n)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function Ks(t,e={}){return Z(t,"GET","/v2/passwordPolicy",me(t,e))}/**
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
 */const zs=6;class Ws{constructor(e){var n,r,i,s;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=o.minPasswordLength)!==null&&n!==void 0?n:zs,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(s=e.forceUpgradeOnSignin)!==null&&s!==void 0?s:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,i,s,o,l;const c={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,c),this.validatePasswordCharacterOptions(e,c),c.isValid&&(c.isValid=(n=c.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),c.isValid&&(c.isValid=(r=c.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),c.isValid&&(c.isValid=(i=c.containsLowercaseLetter)!==null&&i!==void 0?i:!0),c.isValid&&(c.isValid=(s=c.containsUppercaseLetter)!==null&&s!==void 0?s:!0),c.isValid&&(c.isValid=(o=c.containsNumericCharacter)!==null&&o!==void 0?o:!0),c.isValid&&(c.isValid=(l=c.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),c}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),i&&(n.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class Gs{constructor(e,n,r,i){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Bn(this),this.idTokenSubscription=new Bn(this),this.beforeStateQueue=new Vs(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Dr,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=ce(n)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted&&(this.persistenceManager=await we.create(this,e),(r=this._resolvePersistenceManagerAvailable)===null||r===void 0||r.call(this),!this._deleted)){if(!((i=this._popupRedirectResolver)===null||i===void 0)&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await ut(this,{idToken:e}),r=await F._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(G(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let i=r,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=i==null?void 0:i._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===l)&&(c!=null&&c.user)&&(i=c.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return E(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await ht(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=ks()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(G(this.app))return Promise.reject(ue(this));const n=e?Q(e):null;return n&&E(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&E(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return G(this.app)?Promise.reject(ue(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return G(this.app)?Promise.reject(ue(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(ce(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Ks(this),n=new Ws(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Ve("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await Ms(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&ce(e)||this._popupRedirectResolver;E(n,this,"argument-error"),this.redirectPersistenceManager=await we.create(this,[ce(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,i){if(this._deleted)return()=>{};const s=typeof n=="function"?n:n.next.bind(n);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(E(l,this,"internal-error"),l.then(()=>{o||s(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,r,i);return()=>{o=!0,c()}}else{const c=e.addObserver(n);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return E(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Kr(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(n["X-Firebase-AppCheck"]=i),n}async _getAppCheckToken(){var e;if(G(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&_s(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function ze(t){return Q(t)}class Bn{constructor(e){this.auth=e,this.observer=null,this.addObserver=ei(n=>this.observer=n)}get next(){return E(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let nn={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Js(t){nn=t}function qs(t){return nn.loadJS(t)}function Xs(){return nn.recaptchaEnterpriseScript}class Ys{constructor(){this.enterprise=new Qs}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class Qs{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}const Zs="recaptcha-enterprise",zr="NO_RECAPTCHA";class eo{constructor(e){this.type=Zs,this.auth=ze(e)}async verify(e="verify",n=!1){async function r(s){if(!n){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(o,l)=>{Cs(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)l(new Error("recaptcha Enterprise site key undefined"));else{const d=new As(c);return s.tenantId==null?s._agentRecaptchaConfig=d:s._tenantRecaptchaConfigs[s.tenantId]=d,o(d.siteKey)}}).catch(c=>{l(c)})})}function i(s,o,l){const c=window.grecaptcha;Nn(c)?c.enterprise.ready(()=>{c.enterprise.execute(s,{action:e}).then(d=>{o(d)}).catch(()=>{o(zr)})}):l(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new Ys().execute("siteKey",{action:"verify"}):new Promise((s,o)=>{r(this.auth).then(l=>{if(!n&&Nn(window.grecaptcha))i(l,s,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let c=Xs();c.length!==0&&(c+=l),qs(c).then(()=>{i(l,s,o)}).catch(d=>{o(d)})}}).catch(l=>{o(l)})})}}async function Fn(t,e,n,r=!1,i=!1){const s=new eo(t);let o;if(i)o=zr;else try{o=await s.verify(n)}catch{o=await s.verify(n,!0)}const l=Object.assign({},e);if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in l){const c=l.phoneEnrollmentInfo.phoneNumber,d=l.phoneEnrollmentInfo.recaptchaToken;Object.assign(l,{phoneEnrollmentInfo:{phoneNumber:c,recaptchaToken:d,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in l){const c=l.phoneSignInInfo.recaptchaToken;Object.assign(l,{phoneSignInInfo:{recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return l}return r?Object.assign(l,{captchaResp:o}):Object.assign(l,{captchaResponse:o}),Object.assign(l,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(l,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),l}async function Ht(t,e,n,r,i){var s;if(!((s=t._getRecaptchaConfig())===null||s===void 0)&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await Fn(t,e,n,n==="getOobCode");return r(t,o)}else return r(t,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const l=await Fn(t,e,n,n==="getOobCode");return r(t,l)}else return Promise.reject(o)})}/**
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
 */function to(t,e){const n=es(t,"auth");if(n.isInitialized()){const i=n.getImmediate(),s=n.getOptions();if(lt(s,e??{}))return i;pe(i,"already-initialized")}return n.initialize({options:e})}function no(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(ce);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}/**
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
 */class ro{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return q("not implemented")}_getIdTokenResponse(e){return q("not implemented")}_linkToIdToken(e,n){return q("not implemented")}_getReauthenticationResolver(e){return q("not implemented")}}async function ao(t,e){return Z(t,"POST","/v1/accounts:update",e)}async function io(t,e){return Z(t,"POST","/v1/accounts:signUp",e)}/**
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
 */async function so(t,e){return en(t,"POST","/v1/accounts:signInWithPassword",me(t,e))}async function oo(t,e){return Z(t,"POST","/v1/accounts:sendOobCode",me(t,e))}async function lo(t,e){return oo(t,e)}/**
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
 */async function co(t,e){return en(t,"POST","/v1/accounts:signInWithEmailLink",me(t,e))}async function uo(t,e){return en(t,"POST","/v1/accounts:signInWithEmailLink",me(t,e))}/**
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
 */class Fe extends ro{constructor(e,n,r,i=null){super("password",r),this._email=e,this._password=n,this._tenantId=i}static _fromEmailAndPassword(e,n){return new Fe(e,n,"password")}static _fromEmailAndCode(e,n,r=null){return new Fe(e,n,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Ht(e,n,"signInWithPassword",so);case"emailLink":return co(e,{email:this._email,oobCode:this._password});default:pe(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const r={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Ht(e,r,"signUpPassword",io);case"emailLink":return uo(e,{idToken:n,email:this._email,oobCode:this._password});default:pe(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */function ho(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function po(t){const e=xe(Oe(t)).link,n=e?xe(Oe(e)).deep_link_id:null,r=xe(Oe(t)).deep_link_id;return(r?xe(Oe(r)).link:null)||r||n||e||t}class rn{constructor(e){var n,r,i,s,o,l;const c=xe(Oe(e)),d=(n=c.apiKey)!==null&&n!==void 0?n:null,h=(r=c.oobCode)!==null&&r!==void 0?r:null,p=ho((i=c.mode)!==null&&i!==void 0?i:null);E(d&&h&&p,"argument-error"),this.apiKey=d,this.operation=p,this.code=h,this.continueUrl=(s=c.continueUrl)!==null&&s!==void 0?s:null,this.languageCode=(o=c.lang)!==null&&o!==void 0?o:null,this.tenantId=(l=c.tenantId)!==null&&l!==void 0?l:null}static parseLink(e){const n=po(e);try{return new rn(n)}catch{return null}}}/**
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
 */class ge{constructor(){this.providerId=ge.PROVIDER_ID}static credential(e,n){return Fe._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const r=rn.parseLink(n);return E(r,"argument-error"),Fe._fromEmailAndCode(e,r.code,r.tenantId)}}ge.PROVIDER_ID="password";ge.EMAIL_PASSWORD_SIGN_IN_METHOD="password";ge.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class He{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,i=!1){const s=await F._fromIdTokenResponse(e,r,i),o=Hn(r);return new He({user:s,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const i=Hn(r);return new He({user:e,providerId:i,_tokenResponse:r,operationType:n})}}function Hn(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */class pt extends ie{constructor(e,n,r,i){var s;super(n.code,n.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,pt.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,i){return new pt(e,n,r,i)}}function Wr(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?pt._fromErrorAndOperation(t,s,e,r):s})}/**
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
 */async function fo(t,e,n=!1){const{auth:r}=t;if(G(r.app))return Promise.reject(ue(r));const i="reauthenticate";try{const s=await Be(t,Wr(r,i,e,t),n);E(s.idToken,r,"internal-error");const o=tn(s.idToken);E(o,r,"internal-error");const{sub:l}=o;return E(t.uid===l,r,"user-mismatch"),He._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&pe(r,"user-mismatch"),s}}/**
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
 */async function mo(t,e,n=!1){if(G(t.app))return Promise.reject(ue(t));const r="signIn",i=await Wr(t,r,e),s=await He._fromIdTokenResponse(t,r,i);return n||await t._updateCurrentUser(s.user),s}async function go(t,e){return mo(ze(t),e)}async function _o(t,e){return fo(Q(t),e)}/**
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
 */async function bo(t){const e=ze(t);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function yo(t,e,n){const r=ze(t);await Ht(r,{requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"},"getOobCode",lo)}function ko(t,e,n){return G(t.app)?Promise.reject(ue(t)):go(Q(t),ge.credential(e,n)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&bo(t),r})}function vo(t,e){return wo(Q(t),null,e)}async function wo(t,e,n){const{auth:r}=t,s={idToken:await t.getIdToken(),returnSecureToken:!0};n&&(s.password=n);const o=await Be(t,ao(r,s));await t._updateTokensIfNecessary(o,!0)}function Eo(t,e,n,r){return Q(t).onAuthStateChanged(e,n,r)}function Io(t){return Q(t).signOut()}const jn="__sak";/**
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
 */class Gr{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(jn,"1"),this.storage.removeItem(jn),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const So=1e3,To=10;class Jr extends Gr{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=js(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),i=this.localCache[n];r!==i&&e(n,i,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,l,c)=>{this.notifyListeners(o,c)});return}const r=e.key;n?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);Hs()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,To):i()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},So)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}Jr.type="LOCAL";const Ao=Jr;/**
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
 */class Co extends Gr{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}Co.type="SESSION";new Ke(3e4,6e4);/**
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
 */new Ke(2e3,1e4);/**
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
 */new Ke(3e4,6e4);/**
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
 */new Ke(5e3,15e3);var Vn="@firebase/auth",Kn="1.10.8";/**
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
 */class Po{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){E(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function xo(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Oo(t){Ue(new Ie("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=r.options;E(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:o,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Kr(t)},d=new Gs(r,i,s,c);return no(d,n),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),Ue(new Ie("auth-internal",e=>{const n=ze(e.getProvider("auth").getImmediate());return(r=>new Po(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),ke(Vn,Kn,xo(t)),ke(Vn,Kn,"esm2017")}/**
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
 */const Ro=5*60;ja("authIdTokenMaxAge");function Do(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}Js({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=i=>{const s=Qt("internal-error");s.customData=i,n(s)},r.type="text/javascript",r.charset="UTF-8",Do().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Oo("Browser");function No(){const t=rs(br.firebase),e=to(t,{persistence:Ao});return e.languageCode="ms",{onChange:n=>Eo(e,r=>n(r?{uid:r.uid,email:r.email}:null)),signIn:async(n,r)=>{await ko(e,n,r)},resetPassword:n=>yo(e,n),signOut:()=>Io(e),changePassword:async(n,r)=>{const i=e.currentUser;if(!i||!i.email)throw Object.assign(new Error("auth/user-token-expired"),{code:"auth/user-token-expired"});await _o(i,ge.credential(i.email,n)),await vo(i,r)},getIdToken:async n=>e.currentUser?e.currentUser.getIdToken(!!n):null}}let Ct=null;function Ae(){return Ct||(Ct=Promise.resolve().then(No)),Ct}class fe extends Error{constructor(e,n="",r=0){super(n),this.name="ApiError",this.reason=e,this.status=r}}const an="Tiada sambungan internet. Cuba lagi sebentar.",Lo="Ralat tidak dijangka. Sila cuba lagi sebentar.",Ye="Emel atau kata laluan salah.",zn={perlu_log_masuk:"Sila log masuk semula.",tiada_profil:"Akaun ini belum didaftarkan. Sila daftar di halaman Daftar.",tiada_kebenaran:"Anda tidak mempunyai kebenaran untuk tindakan ini.",tiada:"Halaman atau tindakan tidak dijumpai.",ralat_pelayan:"Ralat pada pelayan. Sila cuba lagi sebentar lagi.",data_tidak_sah:"Maklumat tidak lengkap atau tidak sah. Semak semula dan cuba lagi.",tidak_sah:"Kod tidak sah. Semak semula kod anda.",sudah_digunakan:"Kod ini telah digunakan.",dibatalkan:"Kod ini telah dibatalkan, sila hubungi admin.",tamat_tempoh:"Kod ini telah tamat tempoh, sila hubungi admin.",terlalu_banyak_cubaan:"Terlalu banyak cubaan. Cuba lagi selepas 15 minit.",tiada_akses:"Ebook ini tersedia dalam Pakej Complete.",tiada_fail:"Fail ebook ini belum tersedia. Sila cuba lagi kemudian.",tiada_pembelian:"Emel/telefon ini tiada rekod pembelian. Pastikan sama seperti semasa beli di BCL, atau WhatsApp 60134417042.",sudah_didaftar:"Emel ini sudah ada akaun. Sila log masuk atau tekan Lupa Kata Laluan.",sedang_didaftar:"Pendaftaran untuk emel ini sedang diproses. Tunggu sebentar, kemudian cuba log masuk.",terlalu_besar:"Data yang dihantar terlalu besar.",rangkaian:an,masa_tamat:"Sambungan terlalu perlahan. Cuba lagi sebentar."},Wn={"auth/invalid-credential":Ye,"auth/invalid-login-credentials":Ye,"auth/wrong-password":Ye,"auth/user-not-found":Ye,"auth/invalid-email":"Emel tidak sah.","auth/missing-email":"Sila masukkan emel.","auth/missing-password":"Sila masukkan kata laluan.","auth/user-disabled":"Akaun ini telah dinyahaktifkan. Sila hubungi admin.","auth/too-many-requests":"Terlalu banyak cubaan. Cuba lagi selepas beberapa minit.","auth/network-request-failed":an,"auth/user-token-expired":"Sila log masuk semula."};function L(t){if(t instanceof fe&&t.message)return t.message;const e=t&&typeof t=="object"?t:{};return typeof e.reason=="string"&&zn[e.reason]?zn[e.reason]:typeof e.code=="string"&&Wn[e.code]?Wn[e.code]:t instanceof TypeError&&/fetch|network/i.test(String(e.message))?an:Lo}async function Mo(t,e,n,r){const i=new AbortController,s=setTimeout(()=>i.abort(),r);try{return await t(e,{...n,signal:i.signal})}catch(o){throw i.signal.aborted||(o==null?void 0:o.name)==="AbortError"?new fe("masa_tamat"):new fe("rangkaian")}finally{clearTimeout(s)}}async function Uo(t){let e=null;try{e=await t.json()}catch{e=null}if(e&&e.ok===!0&&t.ok)return e.data;throw e&&typeof e.reason=="string"?new fe(e.reason,typeof e.message=="string"?e.message:"",t.status):new fe("ralat_pelayan","",t.status)}function $o(t){const e=t.timeoutMs??2e4,n=async(r,i,s,o)=>{const l=await t.getToken(o),c={};return l&&(c.Authorization=`Bearer ${l}`),s!==void 0&&(c["Content-Type"]="application/json"),Mo(t.fetch,t.baseUrl+i,{method:r,headers:c,body:s===void 0?void 0:JSON.stringify(s)},e)};return async(r,i,s)=>{let o=await n(r,i,s,!1);return o.status===401&&(o=await n(r,i,s,!0)),Uo(o)}}const Bo=$o({baseUrl:br.apiUrl,fetch:(...t)=>fetch(...t),getToken:async t=>(await Ae()).getIdToken(t)});async function se(t,e,n){return Bo(t,e,n)}const jt={profile:null,roles:[],entitlements:new Set,batch:null,catalog:null,reading:[],error:null,errorReason:null};let $={status:"loading",user:null,...jt};const Vt=new Set;function Ne(t){$={...$,...t},Vt.forEach(e=>e($))}function qr(t){return Vt.add(t),()=>Vt.delete(t)}let te=null;function Ce(){var i;const t=(i=$.user)==null?void 0:i.uid;if(te&&te.uid===t)return te.p;const e={},r=(async()=>{var s,o;try{const l=await se("GET","/api/me");if(((s=$.user)==null?void 0:s.uid)!==t)return;Ne({status:"ready",profile:l.profile,roles:l.roles??[],entitlements:new Set(l.entitlements??[]),batch:l.batch??null,catalog:l.catalog??null,reading:l.reading??[],error:null,errorReason:null})}catch(l){if(((o=$.user)==null?void 0:o.uid)!==t)return;Ne({status:"error",error:L(l),errorReason:l instanceof fe?l.reason:null})}finally{(te==null?void 0:te.token)===e&&(te=null)}})();return te={uid:t,token:e,p:r},r}function Xr(){const t=e=>!!e.user&&(e.status==="ready"||e.status==="error");return t($)?Promise.resolve($):new Promise(e=>{const n=qr(r=>{t(r)&&(n(),e(r))})})}let Gn=!1;function Fo(){Gn||(Gn=!0,Ae().then(t=>t.onChange(e=>{var n;if(!e){Ne({status:"anon",user:null,...jt});return}((n=$.user)==null?void 0:n.uid)===e.uid&&$.status!=="anon"||(Ne({status:"loading",user:e,...jt}),Ce())})).catch(t=>Ne({status:"error",error:L(t),errorReason:null})))}async function Yr(t,e){await(await Ae()).signIn(t.trim().toLowerCase(),e)}async function _t(){await(await Ae()).signOut()}async function Ho(t){await(await Ae()).resetPassword(t.trim().toLowerCase())}async function jo(t,e){await(await Ae()).changePassword(t,e)}function D(){const[t,e]=b($);return ae(()=>(e($),qr(e)),[]),t}function Se(t,e,n=""){var i,s;const r=(s=(i=t.catalog)==null?void 0:i.settings)==null?void 0:s[e];return typeof r=="string"?r:r==null?n:String(r)}let at=null;const ft=new Set;let Vo=0,Jn;function We(t,e="green",n=4e3){at={id:++Vo,text:t,tone:e},ft.forEach(r=>r(at)),clearTimeout(Jn),Jn=setTimeout(()=>{at=null,ft.forEach(r=>r(null))},n)}const Ko={blue:"ph-fill ph-info",green:"ph-fill ph-check-circle",yellow:"ph-fill ph-warning",red:"ph-fill ph-warning-circle"};function zo(){const[t,e]=b(at);return ae(()=>(ft.add(e),()=>{ft.delete(e)}),[]),a("div",{class:"toast-host","aria-live":"polite",children:t?a("div",{class:`callout ${t.tone} toast`,role:t.tone==="red"?"alert":"status",children:[a("i",{class:Ko[t.tone],"aria-hidden":"true"}),a("span",{children:t.text})]},t.id):null})}function je(t){return a("section",{class:"card",style:"text-align:center;padding:28px 18px",children:[a("span",{class:`ic ${t.tone??"slate"}`,style:"margin:0 auto",children:a("i",{class:t.icon,"aria-hidden":"true"})}),a("h2",{style:"font-size:20px;margin-top:12px",children:t.title}),t.text?a("p",{class:"muted small",style:"margin-top:6px",children:t.text}):null,t.children?a("div",{style:"margin-top:16px",children:t.children}):null]})}function I(t){const e=["btn",t.variant&&t.variant!=="primary"?t.variant:"",t.block?"block":"",t.sm?"sm":"",t.pulse&&!t.loading?"pulse":""].filter(Boolean).join(" "),n=a(O,{children:[t.loading?a("i",{class:"ph-bold ph-spinner spin","aria-hidden":"true"}):t.icon?a("i",{class:t.icon,"aria-hidden":"true"}):null,t.loading?"Sila tunggu…":t.children]});return t.href?a("a",{class:e,style:t.style,href:t.href,onClick:t.onClick,...t.external?{target:"_blank",rel:"noopener noreferrer"}:{},children:n}):a("button",{class:e,style:t.style,type:t.type??"button",disabled:t.disabled||t.loading,"aria-busy":t.loading?"true":void 0,onClick:t.onClick,children:n})}function H(t){const[e,n]=b(!1),r=t.type==="password",i=[t.error?`${t.id}-err`:"",t.hint?`${t.id}-hint`:""].filter(Boolean).join(" ")||void 0,s=a("input",{id:t.id,class:"input"+(t.error?" err":""),type:r?e?"text":"password":t.type??"text",value:t.value,onInput:o=>t.onInput(o.currentTarget.value),autocomplete:t.autocomplete,inputMode:t.inputMode,placeholder:t.placeholder,required:t.required,"aria-invalid":t.error?"true":void 0,"aria-describedby":i,style:r?"padding-right:48px":void 0});return a("div",{class:"field",style:t.style,children:[a("label",{for:t.id,children:t.label}),r?a("div",{class:"input-wrap",children:[s,a("button",{type:"button",class:"eye",style:"background:none;border:0;padding:6px;cursor:pointer;font-size:20px","aria-label":e?"Sembunyikan kata laluan":"Tunjuk kata laluan","aria-pressed":e,onClick:()=>n(!e),children:a("i",{class:e?"ph ph-eye-slash":"ph ph-eye","aria-hidden":"true"})})]}):s,t.error?a("p",{class:"error",id:`${t.id}-err`,children:[a("i",{class:"ph-fill ph-warning-circle","aria-hidden":"true"}),a("span",{children:t.error})]}):null,t.hint?a("p",{class:"hint",id:`${t.id}-hint`,children:t.hint}):null]})}function R(t){const e="card"+(t.class?" "+t.class:"");return t.href?a("a",{class:e,href:t.href,style:typeof t.style=="string"?`color:inherit;${t.style}`:{color:"inherit",...t.style},children:t.children}):a("section",{class:e,style:t.style,children:t.children})}function Y(t){return a("div",{class:`callout ${t.tone}`,style:t.style,role:t.tone==="red"?"alert":"status",children:[a("i",{class:t.icon,"aria-hidden":"true"}),a("span",{children:t.children})]})}function V(){return a("p",{class:"health",children:[a("i",{class:"ph ph-first-aid-kit","aria-hidden":"true"}),"Jika anda ada penyakit kronik, mengambil ubat tertentu, hamil atau menyusukan anak, dapatkan nasihat doktor dahulu sebelum mengubah rutin puasa, pemakanan atau senaman."]})}function Qr(t){if(t==null)return null;let e=String(t).replace(/\D/g,"");if(!e)return null;if(!e.startsWith("60"))if(e.startsWith("0"))e="60"+e.slice(1);else if(e.startsWith("1"))e="60"+e;else return null;return/^601\d{8,9}$/.test(e)?e:null}function Ge(t,e){return`https://wa.me/${Qr(t)??String(t).replace(/\D/g,"")}?text=${encodeURIComponent(e)}`}function Zr(t,e){return t.replace(/\{(\w+)\}/g,(n,r)=>Object.prototype.hasOwnProperty.call(e,r)?e[r]:n)}function Wo({next:t}={}){const e=t==="aktif",[n,r]=b(""),[i,s]=b(""),[o,l]=b(!1),[c,d]=b(null);return a("div",{class:"phone no-tabs",children:[a("section",{class:"hero hero-band",style:"border-radius:0 0 24px 24px;padding-bottom:44px",children:[a("span",{class:"wordmark",children:["HDM ",a("b",{children:"BOOSTER"})]}),a("div",{style:"margin-top:18px",children:a("span",{class:"pill-t",children:[a("i",{class:"ph-fill ph-moon-stars","aria-hidden":"true"})," Rejab · Syaaban · Ramadan"]})}),a("h1",{style:"font-size:26px;margin-top:14px",children:"Selamat kembali"})]}),a("main",{style:"padding:0 16px",children:[a("form",{class:"card overlap",style:"margin:-24px 0 0",onSubmit:async p=>{if(p.preventDefault(),!o){if(!n.trim()||!i){d("Sila masukkan emel dan kata laluan.");return}l(!0),d(null);try{await Yr(n,i);const u=await Xr();Me(u.profile&&!u.profile.onboarded_at?"#/onboarding":e?"#/aktif":"#/",!0)}catch(u){d(L(u)),l(!1)}}},noValidate:!0,children:[e?a(Y,{tone:"blue",icon:"ph-fill ph-ticket",style:"margin-bottom:12px",children:"Ada kod? Log masuk dahulu, kemudian masukkan kod anda."}):null,a(H,{id:"e",label:"Emel",type:"email",autocomplete:"email",inputMode:"email",value:n,onInput:r}),a(H,{id:"k",label:"Kata laluan",type:"password",autocomplete:"current-password",value:i,onInput:s}),a("p",{style:"text-align:right;margin-top:10px;font-size:14px",children:a("a",{href:"#/lupa",children:"Lupa kata laluan?"})}),c?a(Y,{tone:"red",icon:"ph-fill ph-warning-circle",style:"margin-top:12px",children:c}):null,a(I,{type:"submit",block:!0,loading:o,style:"margin-top:14px",children:"Log Masuk"}),a("div",{class:"divider",children:"Belum ada akaun?"}),a(I,{href:"#/daftar",variant:"outline",block:!0,children:"Daftar akaun"})]}),a(I,{href:Ge(Ee,"Salam, saya perlukan bantuan log masuk HDM BOOSTER."),external:!0,variant:"green-o",block:!0,icon:"ph-bold ph-whatsapp-logo",style:"margin-top:16px",children:["Perlukan bantuan? WhatsApp ",Ee]}),a("p",{class:"linkrow",style:"margin-top:12px",children:a("a",{href:"#/bantuan",children:"Bantuan & soalan lazim"})}),a(V,{})]})]})}function Go(){const[t,e]=b(""),[n,r]=b(""),[i,s]=b(""),[o,l]=b(""),[c,d]=b(!1),[h,p]=b(!1),[u,f]=b(!1),[y,v]=b({}),g=()=>{const _={};return t.trim()?t.trim().length>100&&(_.name="Nama maksimum 100 aksara."):_.name="Sila masukkan nama penuh.",/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.trim())||(_.email="Emel tidak sah."),Qr(i)||(_.phone="Nombor telefon tidak sah. Contoh: 012-345 6789."),o.length<8&&(_.password="Kata laluan mesti sekurang-kurangnya 8 aksara."),c||(_.ack="Sila tandakan persetujuan Notis Privasi untuk meneruskan."),_};return a("div",{class:"phone no-tabs",children:[a("section",{class:"hero hero-band",style:"border-radius:0",children:[a("span",{class:"wordmark",children:["HDM ",a("b",{children:"BOOSTER"})]}),a("h1",{style:"font-size:26px;margin:18px 0 4px",children:"Daftar akaun"}),a("p",{class:"small",children:"Untuk pembeli HDM BOOSTER"})]}),a("main",{class:"page",children:[a(Y,{tone:"blue",icon:"ph-fill ph-info",children:"Guna emel & no. telefon yang SAMA seperti semasa beli di BCL."}),a("form",{class:"card",style:"margin-top:12px",onSubmit:async _=>{if(_.preventDefault(),u)return;const m=g();if(v(m),!Object.keys(m).length){f(!0);try{await se("POST","/api/register",{name:t.trim(),email:n.trim(),phone:i,password:o,privacyAck:!0})}catch(k){const S=k instanceof fe?k.reason:"",C=L(k);v(S==="tiada_pembelian"?{phone:C}:S==="sudah_didaftar"?{email:C}:{form:C}),f(!1);return}try{await Yr(n,o),await Xr(),Me("#/onboarding",!0)}catch(k){We(`Akaun berjaya didaftar. ${L(k)} Sila log masuk.`,"yellow",6e3),Me("#/masuk",!0)}}},noValidate:!0,children:[a(H,{id:"n",label:"Nama penuh",autocomplete:"name",value:t,onInput:e,error:y.name}),a(H,{id:"e",label:"Emel",type:"email",autocomplete:"email",inputMode:"email",value:n,onInput:r,error:y.email}),a(H,{id:"p",label:"No. telefon",type:"tel",autocomplete:"tel",inputMode:"tel",placeholder:"012-345 6789",value:i,onInput:s,error:y.phone}),a(H,{id:"k",label:"Kata laluan",type:"password",autocomplete:"new-password",value:o,onInput:l,error:y.password,hint:"Sekurang-kurangnya 8 aksara"}),a("label",{class:"check",style:"margin-top:16px;cursor:pointer",children:[a("input",{type:"checkbox",class:"sr-only",checked:c,onChange:_=>d(_.currentTarget.checked),"aria-describedby":y.ack?"ack-err":void 0}),a("span",{class:"box"+(c?"":" off"),"aria-hidden":"true",children:c?a("i",{class:"ph-bold ph-check"}):null}),a("span",{children:["Saya bersetuju dengan"," ",a("a",{href:"#/daftar",onClick:_=>{_.preventDefault(),p(!h)},"aria-expanded":h,"aria-controls":"pdpa",children:"Notis Privasi (PDPA)"})]})]}),h?a("div",{id:"pdpa",class:"callout blue small",style:"margin-top:10px;display:block;font-weight:500;line-height:1.5",children:[a("p",{children:[a("b",{children:"Notis Privasi (PDPA)."})," Kami mengumpul nama, emel, nombor telefon dan data kesihatan yang anda masukkan (contohnya berat, ukuran dan sasaran) untuk menyediakan program HDM BOOSTER, menyemak pembelian anda dan menghubungi anda tentang program."]}),a("p",{style:"margin-top:6px",children:["Akaun log masuk diurus oleh Google Firebase, dan aplikasi ini berjalan melalui Cloudflare. Penyedia ini mungkin memproses dan menyimpan data anda di pelayan ",a("b",{children:"di luar Malaysia"}),"."]}),a("p",{style:"margin-top:6px",children:"Data anda tidak dijual. Anda boleh meminta salinan, pembetulan atau pemadaman data dengan menghubungi kami melalui WhatsApp 60134417042."})]}):null,y.ack?a("p",{class:"error",id:"ack-err",children:[a("i",{class:"ph-fill ph-warning-circle","aria-hidden":"true"}),a("span",{children:y.ack})]}):null,y.form?a(Y,{tone:"red",icon:"ph-fill ph-warning-circle",style:"margin-top:12px",children:y.form}):null,a(I,{type:"submit",block:!0,pulse:!0,loading:u,style:"margin-top:18px",children:"Daftar"})]}),a("p",{class:"linkrow",style:"margin-top:16px",children:["Sudah ada akaun? ",a("a",{href:"#/masuk",children:"Log masuk"})]}),a("p",{class:"linkrow",style:"margin-top:8px",children:["Ada kod akses? ",a("a",{href:"#/aktif",children:"Log masuk dahulu"})]}),a(V,{})]})]})}function Jo(){const[t,e]=b(""),[n,r]=b(!1),[i,s]=b(null),[o,l]=b(null);return a("div",{class:"phone no-tabs",children:[a("header",{class:"titlebar",children:[a("a",{class:"back",href:"#/masuk","aria-label":"Kembali",children:a("i",{class:"ph-bold ph-caret-left","aria-hidden":"true"})}),a("div",{children:a("h1",{children:"Kata laluan"})})]}),a("main",{class:"page",children:[a("form",{class:"card",style:"text-align:center",onSubmit:async d=>{if(d.preventDefault(),n)return;const h=t.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(h)){s("Emel tidak sah.");return}r(!0),s(null),l(null);try{await Ho(h),l(h)}catch(p){s(L(p))}finally{r(!1)}},noValidate:!0,children:[a("span",{class:"ic blue",style:"margin:0 auto",children:a("i",{class:"ph-bold ph-key","aria-hidden":"true"})}),a("h2",{style:"font-size:22px;margin-top:12px",children:"Lupa kata laluan?"}),a("p",{class:"muted",style:"margin-top:6px",children:"Masukkan emel anda. Kami akan hantar pautan untuk tetapkan kata laluan baharu."}),a(H,{id:"e",label:"Emel",type:"email",autocomplete:"email",inputMode:"email",value:t,onInput:e,error:i,style:"text-align:left;margin-top:16px"}),a(I,{type:"submit",block:!0,loading:n,style:"margin-top:16px",children:"Hantar pautan"})]}),o?a(Y,{tone:"green",icon:"ph-fill ph-check-circle",style:"margin-top:12px",children:["Pautan telah dihantar ke ",o,". Semak inbox & folder Spam."]}):null,a("p",{class:"linkrow",style:"margin-top:16px",children:a("a",{href:"#/masuk",children:"Kembali ke Log Masuk"})})]})]})}const qo=8*60*60*1e3,Xo=24*60*60*1e3;function bt(t=new Date){return new Date(t.getTime()+qo).toISOString().slice(0,10)}function Qe(t){return Math.round(Date.parse(t+"T00:00:00Z")/Xo)}function Yo(t,e){const n=Qe(e)-Qe(t.programStart);if(n<0)return null;const r=Math.ceil((Qe(t.programEnd)-Qe(t.programStart))/7);return{week:Math.min(Math.floor(n/7)+1,r),total:r}}function Te(t){const[e,n,r]=t.split("-");return`${r}/${n}/${e}`}const Qo=864e5;function ea(t){return Date.parse(t+"T00:00:00+08:00")}function ta(t,e){const n=Math.max(0,t-e),r=Math.floor(n/1e3);return{days:Math.floor(n/Qo),hours:Math.floor(r%86400/3600),minutes:Math.floor(r%3600/60),seconds:r%60,done:n===0}}function Zo(t,e){return ta(ea(t),e).days}function na(t,e){const n=r=>{const i=e.find(s=>s.id===r);return!!i&&i.items.length>0&&i.items.every(s=>t.has(s))};return n("complete")?{id:"complete",label:"HDM BOOSTER COMPLETE"}:n("basic")?{id:"basic",label:"HDM BOOSTER BASIC"}:t.size>0?{id:"separa",label:"Akses separa"}:{id:"tiada",label:"Tiada pakej aktif"}}function el(t,e){const n=t.filter(r=>e.has(r.item_key)).length;return{open:n,total:t.length,locked:t.length-n}}function ra(t){return String(t??"").trim().split(/\s+/)[0]??""}function aa(t){const e=ra(t);return e?e.slice(0,2).toUpperCase():"?"}function tl(t,e){if(!t.length)return-1;let n=0;return t.forEach((r,i)=>{r.start<=e&&(n=i)}),n}function nl(t,e){if(!t)return{mode:"none"};const n=ta(ea(t.program_start),e);if(!n.done)return{mode:"countdown",c:n};const r=Yo({programStart:t.program_start,programEnd:t.program_end},bt(new Date(e)));return{mode:"week",week:(r==null?void 0:r.week)??1,total:(r==null?void 0:r.total)??1}}const qn=[{href:"#/",label:"Utama",icon:"house",match:["home"]},{href:"#/rekod",label:"Rekod",icon:"note-pencil",match:["rekod"]},{href:"#/ebook",label:"Ebook",icon:"books",match:["ebook","ebook_read"]},{href:"#/cabaran",label:"Cabaran",icon:"trophy",match:["cabaran"]},{href:"#/akaun",label:"Akaun",icon:"user-circle",match:["akaun","akaun_kod","aktif"]}],rl={href:"#/admin",label:"Admin",icon:"shield-check",match:["admin"]};function al(t){return t.some(e=>_r.includes(e))?[...qn,rl]:qn}function il(t){const e=al(D().roles);return a("nav",{class:"tabbar","aria-label":"Navigasi utama",style:`--tabs:${e.length}`,children:e.map(n=>{const r=n.match.includes(t.active);return a("a",{class:r?"on":void 0,href:n.href,"aria-current":r?"page":void 0,children:[a("i",{class:`${r?"ph-fill":"ph"} ph-${n.icon}`,"aria-hidden":"true"}),n.label]},n.href)})})}function K(t){var r;const e=D(),n=t.tabs??!0;return a("div",{class:"phone"+(n?"":" no-tabs"),children:[t.title?a("header",{class:"titlebar",children:[a("a",{class:"back",href:t.back??"#/","aria-label":"Kembali",children:a("i",{class:"ph-bold ph-caret-left","aria-hidden":"true"})}),a("div",{children:[a("h1",{children:t.title}),t.subtitle?a("p",{class:"tiny muted",children:t.subtitle}):null]})]}):a("header",{class:"topbar",children:[a("a",{href:"#/",style:"color:inherit","aria-label":"Utama",children:a("span",{class:"wordmark",children:["HDM ",a("b",{children:"BOOSTER"})]})}),a("a",{href:"#/akaun",class:"avatar","aria-label":"Akaun",children:aa((r=e.profile)==null?void 0:r.full_name)})]}),a("main",{class:"page",children:t.children}),n?a(il,{active:t.route}):null]})}function sn(t){return a("span",{class:"lock-badge",children:[a("i",{class:"ph-fill ph-lock-key","aria-hidden":"true"}),t.text??"Pakej Complete"]})}const sl={rejab:"Rejab",syaaban:"Syaaban",ramadan:"Ramadan"},Pt=t=>String(t).padStart(2,"0");function ol(t=1e3){const[e,n]=b(()=>Date.now());return ae(()=>{const r=setInterval(()=>n(Date.now()),t);return()=>clearInterval(r)},[t]),e}function ll({c:t}){const e=[[String(t.days),"Hari",!1],[Pt(t.hours),"Jam",!1],[Pt(t.minutes),"Minit",!1],[Pt(t.seconds),"Saat",!0]];return a(O,{children:[a("p",{class:"small","aria-hidden":"true",children:"Program bermula dalam"}),a("span",{class:"sr-only",children:`Program bermula dalam ${t.days} hari`}),a("div",{style:"display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px","aria-hidden":"true",children:e.map(([n,r,i])=>a("div",{class:"glass",style:"text-align:center;padding:10px 4px",children:[a("div",{class:"num",style:`font-size:28px${i?";color:var(--yellow)":""}`,children:n}),a("div",{class:"tiny",style:"color:var(--on-navy-m)",children:r})]},r))})]})}function cl({batch:t,name:e}){var o;const n=ol(1e3),r=bt(new Date(n)),i=nl(t,n),s=t?tl(t.phases??[],r):-1;return a("section",{class:"hero",children:[a("i",{class:"ph-fill ph-moon-stars moon","aria-hidden":"true"}),t?a("span",{class:"pill-t",children:[a("i",{class:"ph-fill ph-moon-stars","aria-hidden":"true"})," ",t.name]}):null,a("h1",{style:"font-size:24px;margin:14px 0 4px",children:["Assalamualaikum",e?`, ${e}`:""]}),i.mode==="none"?a("p",{class:"small",children:"Maklumat batch akan dipaparkan di sini apabila tersedia."}):i.mode==="countdown"?a(ll,{c:i.c}):a("div",{class:"glass",style:"padding:12px;text-align:center;margin-top:10px",children:a("span",{class:"num",style:"font-size:28px;color:var(--yellow)",children:["Minggu ",i.week," / ",i.total]})}),(o=t==null?void 0:t.phases)!=null&&o.length?a("div",{style:"display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:16px",children:t.phases.map((l,c)=>a("div",{children:[a("div",{style:`height:6px;border-radius:999px;background:${c<=s?"var(--blue)":"rgba(255,255,255,.14)"}`}),a("div",{class:"months",style:`margin-top:6px${c<=s?"":";color:var(--on-navy-m)"}`,children:sl[l.key]??l.key})]},l.key))}):null,t?a("p",{class:"tiny",style:"margin-top:8px",children:[Te(t.program_start)," – ",Te(t.program_end)]}):null]})}function dl(){var c,d,h,p;const t=D(),e=t.entitlements,n=na(e,((c=t.catalog)==null?void 0:c.packages)??[]),r=el(((d=t.catalog)==null?void 0:d.ebooks)??[],e),i=Se(t,"support_wa",Ee),s=Zr(Se(t,"wa_upgrade_text","Salam, saya ingin naik taraf ke Pakej Complete HDM BOOSTER. Emel pendaftaran: {emel}"),{emel:((h=t.profile)==null?void 0:h.email)??""}),o=t.batch?Te(t.batch.program_start):"10/12/2026",l=e.has("tdee");return a(K,{route:"home",children:[a(cl,{batch:t.batch,name:ra((p=t.profile)==null?void 0:p.full_name)}),a("div",{class:"section-title",children:[a("h2",{children:"Pakej anda"}),a("span",{class:`badge ${n.id==="tiada"?"grey":"blue"}`,children:[a("i",{class:"ph-bold ph-seal-check","aria-hidden":"true"})," ",n.label]})]}),a("div",{class:"grid2",children:[a(R,{href:"#/ebook",children:[a("span",{class:"ic blue",children:a("i",{class:"ph-bold ph-book-open-text","aria-hidden":"true"})}),a("h3",{style:"font-size:16px;margin-top:10px",children:"Baca Ebook"}),a("p",{class:"small muted",children:[r.open," daripada ",r.total," dibuka"]})]}),a(R,{href:"#/tdee",children:[a("span",{class:"ic orange",children:a("i",{class:"ph-bold ph-calculator","aria-hidden":"true"})}),a("h3",{style:"font-size:16px;margin-top:10px",children:"Kalkulator TDEE"}),l?a("p",{class:"small muted",children:"Kira kalori harian"}):a("div",{style:"margin-top:4px",children:a(sn,{text:"Terkunci"})})]}),a(R,{href:"#/group",children:[a("span",{class:"ic green",children:a("i",{class:"ph-bold ph-whatsapp-logo","aria-hidden":"true"})}),a("h3",{style:"font-size:16px;margin-top:10px",children:"Group Support"}),a("p",{class:"small muted",children:"Group WhatsApp bersama coach"})]}),a(R,{href:"#/bantuan",children:[a("span",{class:"ic slate",children:a("i",{class:"ph-bold ph-lifebuoy","aria-hidden":"true"})}),a("h3",{style:"font-size:16px;margin-top:10px",children:"Bantuan"}),a("p",{class:"small muted",children:"Soalan lazim & WhatsApp"})]})]}),r.locked>0?a(R,{style:"margin-top:12px;border-left:5px solid var(--yellow)",children:[a("div",{class:"row",children:[a("span",{class:"ic navy",children:a("i",{class:"ph-fill ph-lock-key","aria-hidden":"true"})}),a("div",{style:"flex:1",children:[a("h3",{style:"font-size:16px",children:[a("span",{class:"stabilo",children:[r.locked," ebook lagi"]})," menanti anda"]}),a("p",{class:"small muted",children:"Tersedia dalam Pakej Complete"})]})]}),a(I,{href:Ge(i,s),external:!0,variant:"green-o",block:!0,sm:!0,icon:"ph-bold ph-whatsapp-logo",style:"margin-top:12px",children:"Naik taraf"})]}):null,a(R,{href:"#/rekod",style:"margin-top:12px;display:block",children:a("div",{class:"row",children:[a("span",{class:"ic slate",children:a("i",{class:"ph-bold ph-calendar-check","aria-hidden":"true"})}),a("div",{children:[a("h3",{style:"font-size:15px",children:"Rekod harian & Cabaran #1"}),a("p",{class:"small muted",children:["Dibuka ",o,". Lengkapkan data permulaan anda dahulu."]})]})]})}),a(V,{})]})}const ul={android:["Buka laman ini dalam Chrome.","Tekan menu tiga titik di penjuru atas.","Pilih Tambah ke Skrin Utama, kemudian Tambah."],iphone:["Buka laman ini dalam Safari.","Tekan butang Kongsi (petak dengan anak panah ke atas) di bawah skrin.","Pilih Tambah ke Skrin Utama, kemudian Tambah."]};function hl(){var c;const t=D(),[e,n]=b(()=>/iPhone|iPad|iPod/i.test(navigator.userAgent)?"iphone":"android"),r=Se(t,"support_wa",Ee),i=t.status==="ready"&&!!((c=t.profile)!=null&&c.onboarded_at),s=i?"#/":t.user?"#/onboarding":"#/masuk",o=t.batch?Te(t.batch.program_start):"10/12/2026",l=[["Saya tak boleh log masuk",`Semak emel dan kata laluan anda. Jika masih gagal, tekan Lupa kata laluan atau WhatsApp kami di ${r}.`],["Lupa kata laluan","Di skrin Log Masuk, tekan Lupa kata laluan. Masukkan emel anda dan kami hantar pautan. Semak juga folder Spam."],["Kenapa emel/telefon mesti sama dengan BCL?","Sistem menyemak rekod pembelian anda di BCL untuk buka akses yang betul. Jika berbeza, akses tidak dapat dipadankan."],["Bagaimana tebus kod akses?","Pergi ke Akaun, masukkan kod format HDMB-XXXX-XXXX pada ruangan Ada kod akses?, kemudian tekan Tebus."],["Bila Rekod harian dibuka?",`Rekod harian dan Cabaran #1 dibuka pada ${o}. Sebelum itu, lengkapkan data permulaan anda.`]];return a(K,{route:"bantuan",title:"Bantuan",back:s,tabs:i,children:[l.map(([d,h],p)=>a("details",{class:"faq",open:p===0,children:[a("summary",{children:d}),a("p",{children:h})]},d)),a(R,{style:"margin-top:16px",children:[a("h3",{style:"font-size:17px",children:[a("i",{class:"ph-bold ph-device-mobile",style:"color:var(--blue)","aria-hidden":"true"})," Tambah ke Skrin Utama"]}),a("div",{class:"seg",role:"tablist","aria-label":"Jenis telefon",style:"margin-top:12px",children:["android","iphone"].map(d=>a("button",{type:"button",role:"tab","aria-selected":e===d,class:e===d?"on":void 0,onClick:()=>n(d),children:d==="android"?"Android":"iPhone"},d))}),a("ol",{class:"small",style:"margin:12px 0 0 20px;line-height:1.7;font-weight:600;list-style:decimal",children:ul[e].map(d=>a("li",{children:d},d))})]}),a(I,{href:Ge(r,"Salam, saya perlukan bantuan HDM BOOSTER."),external:!0,variant:"green",block:!0,icon:"ph-bold ph-whatsapp-logo",style:"margin-top:16px",children:["WhatsApp ",r]}),a(V,{}),a("p",{class:"health",children:[a("i",{class:"ph ph-info","aria-hidden":"true"}),"Hasil individu berbeza mengikut keadaan kesihatan, pemakanan, aktiviti fizikal dan konsistensi. Tiada jaminan penurunan berat tertentu."]})]})}const pl=[["ph-scales","Berat"],["ph-egg","Protein"],["ph-drop","Air"],["ph-timer","Puasa/IF"],["ph-barbell","Senaman"],["ph-moon","Tidur"]];function fl({route:t}){var i,s;const e=D(),n=((i=e.batch)==null?void 0:i.program_start)??"2026-12-10",r=Zo(n,Date.now());return a(K,{route:t,children:[a("section",{class:"hero",children:[a("i",{class:"ph-fill ph-calendar-check moon","aria-hidden":"true"}),a("span",{class:"pill-t",children:[a("i",{class:"ph-fill ph-lock-key","aria-hidden":"true"})," Akan dibuka"]}),a("h1",{style:"font-size:22px;margin:14px 0 6px",children:["Rekod harian & Cabaran #1 dibuka ",Te(n)]}),a("div",{class:"glass",style:"padding:12px;text-align:center",children:[a("span",{class:"num",style:"font-size:28px;color:var(--yellow)",children:r})," ",a("span",{style:"font-weight:700",children:"hari lagi"})]})]}),a(R,{style:"margin-top:12px",children:[a("h3",{style:"font-size:16px",children:"Apa yang akan anda rekod"}),a("div",{style:"display:flex;flex-wrap:wrap;gap:8px;margin-top:12px",children:pl.map(([o,l])=>a("span",{class:"chip",children:[a("i",{class:`ph ${o}`,"aria-hidden":"true"})," ",l]},l))})]}),(s=e.profile)!=null&&s.onboarded_at?null:a(I,{href:"#/onboarding",variant:"outline",block:!0,style:"margin-top:16px",children:"Lengkapkan data permulaan"}),a(V,{})]})}const ml={onboarding:"Data permulaan",ebook:"Ebook",ebook_read:"Ebook",tdee:"Kalkulator TDEE",group:"Group Support",akaun:"Akaun",akaun_kod:"Kod akses",aktif:"Aktifkan pakej",admin:"Admin"};function gl({route:t}){const[e,n]=b(!1),r=ml[t]??"HDM BOOSTER";return a(K,{route:t,title:r,back:"#/",tabs:t!=="onboarding",children:[a(je,{icon:"ph-bold ph-hourglass-medium",tone:"blue",title:"Akan datang",text:"Halaman ini sedang disiapkan.",children:t!=="onboarding"?a(I,{href:"#/",variant:"outline",block:!0,children:"Kembali ke Utama"}):null}),t==="akaun"||t==="onboarding"?a(I,{variant:"danger-t",block:!0,icon:"ph-bold ph-sign-out",loading:e,style:"margin-top:12px",onClick:async()=>{n(!0);try{await _t()}finally{n(!1)}},children:"Log keluar"}):null]})}function _l(){return a(K,{route:"tiada",title:"Tidak dijumpai",children:a(je,{icon:"ph-bold ph-compass",title:"Halaman tidak dijumpai",text:"Pautan ini tidak wujud.",children:a(I,{href:"#/",block:!0,children:"Kembali ke Utama"})})})}const ia=[{lv:1,name:"Tidak aktif",desc:"Kerja duduk"},{lv:2,name:"Ringan",desc:"Senaman 1-3x seminggu"},{lv:3,name:"Sederhana",desc:"Senaman 3-5x seminggu"},{lv:4,name:"Aktif",desc:"Senaman 6-7x seminggu"},{lv:5,name:"Sangat aktif",desc:"Kerja fizikal + latihan"}];function bl(){return{sex:"",age:"",height:"",weight:"",bodyFat:"",waist:"",activity:0,target:"",protein:"",healthAck:!1,privacyAck:!1}}function on(t=new Date){return Number(bt(t).slice(0,4))}function yl(t,e=new Date){return on(e)-t}function sa(t,e=new Date){const n=typeof t=="number"?t:typeof t=="string"&&t.trim()?Number(t):NaN;return Number.isFinite(n)?on(e)-n:null}function j(t){const e=String(t??"").trim().replace(",",".");return e&&/^-?\d+(\.\d+)?$/.test(e)?Number(e):NaN}function Xn(t){const e=j(t);return Number.isFinite(e)&&e>0?String(Math.round(1.8*e)):""}function kl(t,e=new Date){const n={},r=on(e)-1900;t.sex!=="L"&&t.sex!=="P"&&(n.sex="Pilih jantina anda: Lelaki atau Perempuan.");const i=j(t.age);t.age.trim()?(!Number.isInteger(i)||i<1||i>r)&&(n.age="Masukkan umur dalam nombor bulat, contoh: 30."):n.age="Masukkan umur anda dalam tahun (contoh: 30).";const s=j(t.height);t.height.trim()?s>0&&s<=300||(n.height="Tinggi mesti antara 1 hingga 300 cm. Semak semula, contoh: 165."):n.height="Masukkan tinggi anda dalam cm (contoh: 165).";const o=j(t.weight);t.weight.trim()?o>0&&o<=500||(n.weight="Berat mesti antara 1 hingga 500 kg. Semak semula, contoh: 70."):n.weight="Masukkan berat anda dalam kg (contoh: 70).";const l=u=>u.trim()?j(u):null,c=l(t.bodyFat);c!==null&&!(c>0&&c<100)&&(n.bodyFat="Lemak badan mesti antara 1 hingga 99%, atau biarkan kosong.");const d=l(t.waist);d!==null&&!(d>0)&&(n.waist="Masukkan ukuran pinggang dalam cm (contoh: 90), atau biarkan kosong."),t.activity>=1&&t.activity<=5||(n.activity="Pilih tahap aktiviti yang paling hampir dengan rutin anda.");const h=l(t.target);h!==null&&!(h>0)&&(n.target="Masukkan berat sasaran dalam kg (contoh: 65), atau biarkan kosong.");const p=l(t.protein);return p!==null&&!(Number.isInteger(p)&&p>0)&&(n.protein="Masukkan sasaran protein dalam gram, nombor bulat (contoh: 120)."),t.healthAck||(n.healthAck="Tandakan kotak ini untuk sahkan anda faham nota kesihatan."),t.privacyAck||(n.privacyAck="Tandakan kotak ini untuk bersetuju dengan Notis Privasi."),Object.keys(n).length?{errors:n,payload:null}:{errors:{},payload:{sex:t.sex,birth_year:yl(i,e),height_cm:s,start_weight_kg:o,start_body_fat_pct:c,start_waist_cm:d,activity_level:t.activity,target_weight_kg:h,protein_target_g:p,health_ack:!0,privacy_ack:!0}}}const ye=t=>t==null||t===""?"":String(t);function vl(t,e=new Date){if(!t)return bl();const n=Number(t.activity_level),r=sa(t.birth_year,e);return{sex:t.sex==="L"||t.sex==="P"?t.sex:"",age:r==null?"":String(r),height:ye(t.height_cm),weight:ye(t.start_weight_kg),bodyFat:ye(t.start_body_fat_pct),waist:ye(t.start_waist_cm),activity:n>=1&&n<=5?n:0,target:ye(t.target_weight_kg),protein:ye(t.protein_target_g),healthAck:!1,privacyAck:!1}}function Je(t){return t.text?a("p",{class:"error",id:t.id,children:[a("i",{class:"ph-fill ph-warning-circle","aria-hidden":"true"}),a("span",{children:t.text})]}):null}function W(t){const e=Math.max(56,26+t.unit.length*9),n=[t.error?`${t.id}-err`:"",t.hint?`${t.id}-hint`:""].filter(Boolean).join(" ")||void 0;return a("div",{class:"field",children:[a("label",{for:t.id,children:t.label}),a("div",{class:"input-wrap",children:[a("input",{id:t.id,class:"input"+(t.error?" err":""),value:t.value,inputMode:t.decimal?"decimal":"numeric",placeholder:t.placeholder,autocomplete:"off",style:`padding-right:${e}px`,"aria-invalid":t.error?"true":void 0,"aria-describedby":n,onInput:r=>t.onInput(r.currentTarget.value)}),a("span",{class:"unit","aria-hidden":"true",children:t.unit})]}),a(Je,{id:`${t.id}-err`,text:t.error}),t.hint?a("p",{class:"hint",id:`${t.id}-hint`,children:t.hint}):null]})}function Yn(t){return a(O,{children:[a("label",{class:"check",style:`cursor:pointer;${t.style??""}`,children:[a("input",{id:t.id,type:"checkbox",class:"sr-only",checked:t.checked,"aria-invalid":t.error?"true":void 0,"aria-describedby":t.error?`${t.id}-err`:void 0,onChange:e=>t.onChange(e.currentTarget.checked)}),a("span",{class:"box"+(t.checked?"":" off"),"aria-hidden":"true",children:t.checked?a("i",{class:"ph-bold ph-check"}):null}),a("span",{children:t.children})]}),a(Je,{id:`${t.id}-err`,text:t.error})]})}const oa=t=>e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),t())};function la(t){return a("div",{class:"field",children:[a("label",{id:`${t.id}-l`,children:t.label}),a("div",{class:"seg",role:"radiogroup","aria-labelledby":`${t.id}-l`,id:t.id,tabIndex:-1,"aria-describedby":t.error?`${t.id}-err`:void 0,children:t.options.map(([e,n])=>a("span",{role:"radio",tabIndex:0,"aria-checked":t.value===e,class:t.value===e?"on":void 0,style:"cursor:pointer",onClick:()=>t.onChange(e),onKeyDown:oa(()=>t.onChange(e)),children:n},e))}),a(Je,{id:`${t.id}-err`,text:t.error})]})}function ca(t){return a("div",{class:"field",children:[a("label",{id:`${t.id}-l`,children:"Tahap aktiviti"}),a("div",{role:"radiogroup","aria-labelledby":`${t.id}-l`,id:t.id,tabIndex:-1,"aria-describedby":t.error?`${t.id}-err`:void 0,children:ia.map(e=>{const n=t.value===e.lv;return a("div",{class:"opt"+(n?" on":""),role:"radio",tabIndex:0,"aria-checked":n,style:"cursor:pointer",onClick:()=>t.onChange(e.lv),onKeyDown:oa(()=>t.onChange(e.lv)),children:[a("span",{class:"lv",children:e.lv}),a("div",{class:"t",children:[a("b",{children:e.name}),a("span",{children:e.desc})]}),n?a("i",{class:"ph-fill ph-check-circle","aria-hidden":"true"}):null]},e.lv)})}),a(Je,{id:`${t.id}-err`,text:t.error})]})}const wl="Jika anda ada penyakit kronik, mengambil ubat tertentu, hamil atau menyusukan anak, dapatkan nasihat doktor dahulu sebelum mengubah rutin puasa, pemakanan atau senaman.",El=["sex","age","height","weight","bodyFat","waist","activity","target","protein","healthAck","privacyAck"],U={sex:"ob-sex",age:"ob-age",height:"ob-height",weight:"ob-weight",bodyFat:"ob-bf",waist:"ob-waist",activity:"ob-act",target:"ob-target",protein:"ob-prot",healthAck:"ob-health",privacyAck:"ob-privacy"};function Il(){var w,_;const t=D(),e=!!((w=t.profile)!=null&&w.onboarded_at),n=pr(()=>{const m=vl(t.profile);return m.protein||(m.protein=Xn(m.weight)),m},[]),[r,i]=b(n),[s,o]=b(!!((_=t.profile)!=null&&_.protein_target_g)),[l,c]=b({}),[d,h]=b(null),[p,u]=b(!1),[f,y]=b(!1),v=(m,k)=>{i(S=>{const C={...S,[m]:k};return m==="weight"&&!s&&(C.protein=Xn(String(k))),C}),l[m]&&c(S=>({...S,[m]:void 0}))};return a("div",{class:"phone no-tabs",children:[a("section",{class:"hero hero-band",style:"border-radius:0 0 24px 24px",children:[a("span",{class:"wordmark",children:["HDM ",a("b",{children:"BOOSTER"})]}),a("h1",{style:"font-size:24px;margin-top:16px",children:e?"Kemas kini data anda":"Kenal anda dahulu"}),a("p",{class:"small",children:e?"Data ini digunakan untuk kira sasaran anda.":"Sekali sahaja. Data ini untuk kira sasaran anda."}),a("div",{class:"steps","aria-hidden":"true",children:[a("div",{class:"s on",children:[a("i",{}),"1 Profil"]}),a("div",{class:"s on",children:[a("i",{}),"2 Badan"]}),a("div",{class:"s on",children:[a("i",{}),"3 Sasaran"]})]})]}),a("main",{class:"page",children:a("form",{onSubmit:async m=>{var S;if(m.preventDefault(),p)return;const k=kl(r);if(c(k.errors),h(null),!k.payload){const C=El.find(B=>k.errors[B]);C&&((S=document.getElementById(U[C]))==null||S.focus());return}u(!0);try{await se("PUT","/api/me/onboarding",k.payload),await Ce(),We(e?"Data anda telah dikemas kini.":"Data disimpan. Selamat datang ke HDM BOOSTER!","green"),Me(e?"#/tdee":"#/",!0)}catch(C){h(L(C)),u(!1)}},noValidate:!0,children:[a("section",{class:"card",children:[a("div",{class:"step-h",children:[a("span",{class:"n",children:"1"}),a("h2",{children:"Profil"})]}),a(la,{id:U.sex,label:"Jantina",value:r.sex,options:[["L","Lelaki"],["P","Perempuan"]],onChange:m=>v("sex",m),error:l.sex}),a(W,{id:U.age,label:"Umur",unit:"tahun",value:r.age,onInput:m=>v("age",m),error:l.age})]}),a("section",{class:"card",children:[a("div",{class:"step-h",children:[a("span",{class:"n",children:"2"}),a("h2",{children:"Badan"})]}),a(W,{id:U.height,label:"Tinggi",unit:"cm",decimal:!0,value:r.height,onInput:m=>v("height",m),error:l.height}),a(W,{id:U.weight,label:"Berat",unit:"kg",decimal:!0,value:r.weight,onInput:m=>v("weight",m),error:l.weight}),a(W,{id:U.bodyFat,label:a(O,{children:["Lemak badan ",a("span",{class:"subtle",children:"(opsyen)"})]}),unit:"%",decimal:!0,placeholder:"cth. 25",value:r.bodyFat,onInput:m=>v("bodyFat",m),error:l.bodyFat}),a(W,{id:U.waist,label:a(O,{children:["Ukuran pinggang ",a("span",{class:"subtle",children:"(opsyen)"})]}),unit:"cm",decimal:!0,placeholder:"cth. 92",value:r.waist,onInput:m=>v("waist",m),error:l.waist}),a(ca,{id:U.activity,value:r.activity,onChange:m=>v("activity",m),error:l.activity})]}),a("section",{class:"card",children:[a("div",{class:"step-h",children:[a("span",{class:"n",children:"3"}),a("h2",{children:"Sasaran"})]}),a(W,{id:U.target,label:a(O,{children:["Berat sasaran ",a("span",{class:"subtle",children:"(opsyen)"})]}),unit:"kg",decimal:!0,placeholder:"cth. 72",value:r.target,onInput:m=>v("target",m),error:l.target}),a(W,{id:U.protein,label:"Sasaran protein harian",unit:"g",value:r.protein,onInput:m=>{o(!0),v("protein",m)},error:l.protein,hint:"Dicadang 1.8 g/kg berat badan, boleh ubah"}),a("div",{class:"callout yellow",style:"margin-top:16px",children:[a("i",{class:"ph-fill ph-first-aid-kit","aria-hidden":"true"}),a("span",{children:wl})]}),a(Yn,{id:U.healthAck,checked:r.healthAck,onChange:m=>v("healthAck",m),error:l.healthAck,style:"margin-top:14px",children:"Saya faham dan akan dapatkan nasihat doktor jika perlu"}),a(Yn,{id:U.privacyAck,checked:r.privacyAck,onChange:m=>v("privacyAck",m),error:l.privacyAck,style:"margin-top:12px",children:["Saya bersetuju data badan saya disimpan untuk program ini seperti dalam"," ",a("a",{href:"#/onboarding",onClick:m=>{m.preventDefault(),y(!f)},"aria-expanded":f,"aria-controls":"ob-pdpa",children:"Notis Privasi (PDPA)"})]}),f?a("div",{id:"ob-pdpa",class:"callout blue small",style:"margin-top:10px;display:block;font-weight:500;line-height:1.5",children:a("p",{children:["Data badan yang anda masukkan (jantina, umur, tinggi, berat, ukuran dan sasaran) digunakan untuk mengira sasaran anda dan laporan program. Data disimpan melalui penyedia awan (Google Firebase, Cloudflare) yang mungkin memproses data ",a("b",{children:"di luar Malaysia"}),". Data anda tidak dijual. Anda boleh meminta pembetulan atau pemadaman data melalui WhatsApp 60134417042."]})}):null]}),d?a(Y,{tone:"red",icon:"ph-fill ph-warning-circle",style:"margin-top:12px",children:d}):null,a("div",{class:"grid2",style:"margin-top:16px",children:[e?a(I,{href:"#/tdee",variant:"outline",children:"Kembali"}):a(I,{variant:"outline",onClick:()=>void _t(),children:"Log keluar"}),a(I,{type:"submit",loading:p,children:e?"Simpan":"Simpan & mula"})]})]})})]})}const Sl=[1.2,1.375,1.55,1.725,1.9];function da(t){const e=10*t.weightKg+6.25*t.heightCm-5*t.age+(t.sex==="L"?5:-161),n=e*Sl[t.activity-1],r=[{label:"Ringan (-15%)",pct:15},{label:"Sederhana (-20%)",pct:20},{label:"Agresif (-25%)",pct:25}].map(c=>({...c,kcal:Math.round(n*(1-c.pct/100))})),i=r[1].kcal,s=Math.round(1.8*t.weightKg),o=Math.round(.25*i/9),l=Math.round((i-s*4-o*9)/4);return{bmr:e,tdee:n,deficits:r,proteinG:{min:Math.round(1.6*t.weightKg),max:Math.round(2*t.weightKg)},macros:{proteinG:s,fatG:o,carbG:l}}}function Tl(t,e){const n=da(t),r=n.deficits[e]??n.deficits[1];return{tdee_kcal:Math.round(n.tdee),kcal_target:r.kcal,protein_target_g:n.macros.proteinG}}const Al="Salam, saya ingin naik taraf ke Pakej Complete HDM BOOSTER. Emel pendaftaran: {emel}";function Cl(t){var e;return Ge(Se(t,"support_wa",Ee),Zr(Se(t,"wa_upgrade_text",Al),{emel:((e=t.profile)==null?void 0:e.email)??""}))}function ua(t){const e=D();return a(I,{href:Cl(e),external:!0,variant:"green-o",block:!0,sm:t.sm,icon:"ph-bold ph-whatsapp-logo",style:t.style,children:"Naik taraf"})}const Pe=t=>Math.round(t).toLocaleString("en-US");function Qn(t){const e=sa(t==null?void 0:t.birth_year),n=Number(t==null?void 0:t.activity_level);return{sex:(t==null?void 0:t.sex)==="L"||(t==null?void 0:t.sex)==="P"?t.sex:"",age:e==null?"":String(e),height:(t==null?void 0:t.height_cm)==null?"":String(t.height_cm),weight:(t==null?void 0:t.start_weight_kg)==null?"":String(t.start_weight_kg),activity:n>=1&&n<=5?n:0}}function Zn(t){const e=j(t.age),n=j(t.height),r=j(t.weight);return!t.sex||!t.activity||!(e>=1&&e<=120)||!(n>0&&n<=300)||!(r>0&&r<=500)?null:{sex:t.sex,age:e,heightCm:n,weightKg:r,activity:t.activity}}function Pl(){return a(K,{route:"tdee",title:"Kalkulator TDEE",children:[a("section",{class:"card locked",children:[a("div",{class:"dim",children:a("div",{class:"row",children:[a("span",{class:"ic orange",children:a("i",{class:"ph-bold ph-calculator","aria-hidden":"true"})}),a("div",{children:[a("h3",{style:"font-size:17px",children:"Kalkulator TDEE"}),a("p",{class:"small muted",children:"BMR, TDEE, defisit kalori & makro"})]})]})}),a("div",{style:"margin-top:12px",children:a(sn,{text:"Terkunci"})}),a("p",{class:"small muted",style:"margin-top:8px",children:"Kalkulator TDEE tiada dalam akses anda. Naik taraf pakej, atau aktifkan kod akses jika anda ada."}),a(ua,{style:"margin-top:12px"}),a(I,{href:"#/akaun/kod",variant:"outline",block:!0,icon:"ph-bold ph-ticket",style:"margin-top:8px",children:"Ada kod akses?"})]}),a(V,{})]})}function xl(){return D().entitlements.has("tdee")?a(Ol,{}):a(Pl,{})}function Ol(){var _,m;const t=D(),[e,n]=b(()=>Qn(t.profile)),r=pr(()=>Zn(e),[e]),[i,s]=b(()=>!Zn(Qn(t.profile))),[o,l]=b(1),[c,d]=b(!1),[h,p]=b(null),u=r?da(r):null,f=(k,S)=>n(C=>({...C,[k]:S})),y=ia.find(k=>k.lv===e.activity),v=(_=t.profile)==null?void 0:_.kcal_target,g=(m=t.profile)==null?void 0:m.protein_target_g,w=async()=>{if(!(!r||c)){d(!0),p(null);try{const k=Tl(r,o);await se("PUT","/api/me/targets",k),await Ce(),We(`Sasaran disimpan: ${Pe(k.kcal_target)} kcal & ${k.protein_target_g} g protein sehari.`,"green")}catch(k){p(L(k))}finally{d(!1)}}};return a(K,{route:"tdee",title:"Kalkulator TDEE",children:[a("section",{class:"card",children:[a("div",{class:"row between",children:[a("div",{style:"min-width:0",children:[a("p",{class:"tiny subtle",style:"font-weight:700",children:"DATA ANDA"}),a("p",{style:"font-weight:700;color:var(--navy)",children:r?`${e.sex==="L"?"Lelaki":"Perempuan"} · ${j(e.age)} tahun · ${j(e.height)} cm · ${j(e.weight)} kg · Tahap ${e.activity} ${(y==null?void 0:y.name)??""}`:"Lengkapkan data di bawah"})]}),a(I,{variant:"outline",sm:!0,onClick:()=>s(!i),children:i?"Tutup":"Ubah"})]}),i?a("div",{style:"margin-top:6px",children:[a(la,{id:"td-sex",label:"Jantina",value:e.sex,options:[["L","Lelaki"],["P","Perempuan"]],onChange:k=>f("sex",k)}),a(W,{id:"td-age",label:"Umur",unit:"tahun",value:e.age,onInput:k=>f("age",k)}),a(W,{id:"td-h",label:"Tinggi",unit:"cm",decimal:!0,value:e.height,onInput:k=>f("height",k)}),a(W,{id:"td-w",label:"Berat",unit:"kg",decimal:!0,value:e.weight,onInput:k=>f("weight",k)}),a(ca,{id:"td-act",value:e.activity,onChange:k=>f("activity",k)}),r?null:a("p",{class:"hint",children:"Isi jantina, umur, tinggi (cm), berat (kg) dan tahap aktiviti untuk melihat keputusan."}),a("p",{class:"hint",children:["Perubahan di sini untuk kiraan sahaja. Untuk simpan data badan anda, ",a("a",{href:"#/onboarding",children:"kemas kini data permulaan"}),"."]})]}):null]}),u?a(O,{children:[a("div",{class:"grid2",style:"margin-top:12px",children:[a("div",{class:"card",children:[a("p",{class:"small muted",style:"font-weight:700",children:"BMR"}),a("div",{class:"num",style:"font-size:30px;color:var(--navy)",children:Pe(u.bmr)}),a("p",{class:"small muted",children:"kcal"})]}),a("div",{class:"card",children:[a("p",{class:"small muted",style:"font-weight:700",children:"TDEE"}),a("div",{class:"num",style:"font-size:30px;color:var(--blue)",children:Pe(u.tdee)}),a("p",{class:"small muted",children:"kcal"})]})]}),a("div",{class:"section-title",children:a("h2",{children:"Cadangan defisit"})}),a("div",{class:"stack",role:"radiogroup","aria-label":"Pilih defisit kalori",children:u.deficits.map((k,S)=>{const C=o===S;return a("div",{class:"card row between",role:"radio",tabIndex:0,"aria-checked":C,style:`cursor:pointer;${C?"border:2px solid var(--blue)":""}`,onClick:()=>l(S),onKeyDown:B=>{(B.key==="Enter"||B.key===" ")&&(B.preventDefault(),l(S))},children:[a("div",{children:[a("h3",{style:"font-size:16px",children:k.label.replace(/ \(.*\)$/,"")}),a("p",{class:"small muted",children:["−",k.pct,"%"]}),S===1?a("span",{class:"badge yellow",style:"margin-top:6px;background:var(--yellow);color:var(--navy)",children:"Disyorkan"}):null]}),a("div",{class:"num",style:"font-size:20px",children:[Pe(k.kcal)," ",a("span",{class:"small muted",children:"kcal"})]})]},k.pct)})}),a("section",{class:"card",style:"margin-top:12px",children:a("div",{class:"row",children:[a("span",{class:"ic blue",children:a("i",{class:"ph-bold ph-barbell","aria-hidden":"true"})}),a("div",{children:[a("h3",{style:"font-size:16px",children:"Sasaran protein"}),a("p",{class:"num",style:"font-size:20px;color:var(--blue)",children:[u.proteinG.min,"–",u.proteinG.max," ",a("span",{class:"small muted",style:"font-family:Quicksand",children:"g/hari"})]})]})]})}),a("section",{class:"card",style:"margin-top:12px",children:[a("h3",{style:"font-size:16px;margin-bottom:12px",children:"Pecahan makro cadangan"}),a("div",{class:"macro",role:"img","aria-label":`Protein ${u.macros.proteinG} g, Lemak ${u.macros.fatG} g, Karbohidrat ${u.macros.carbG} g`,children:[a("i",{style:`flex:${u.macros.proteinG*4};background:var(--blue)`}),a("i",{style:`flex:${u.macros.fatG*9};background:var(--orange)`}),a("i",{style:`flex:${Math.max(0,u.macros.carbG)*4};background:var(--green)`})]}),a("div",{class:"legend",children:[a("span",{style:"--c:var(--blue)",children:["Protein ",u.macros.proteinG," g"]}),a("span",{style:"--c:var(--orange)",children:["Lemak ",u.macros.fatG," g"]}),a("span",{style:"--c:var(--green)",children:["Karbohidrat ",u.macros.carbG," g"]})]})]}),v?a("p",{class:"small muted",style:"text-align:center;margin-top:14px",children:["Sasaran semasa: ",a("b",{children:[Pe(v)," kcal"]}),g?a(O,{children:[" · ",a("b",{children:[g," g protein"]})]}):null," sehari"]}):null,h?a(Y,{tone:"red",icon:"ph-fill ph-warning-circle",style:"margin-top:12px",children:h}):null,a(I,{block:!0,loading:c,style:"margin-top:16px",onClick:w,children:"Guna sebagai sasaran saya"})]}):null,a("p",{class:"small muted",style:"text-align:center;margin-top:10px",children:"Anggaran sahaja, bukan nasihat perubatan."}),a(V,{})]})}function Rl(t){var n,r;const e=String(t??"").replace(/^coach\s+/i,"").replace(/["“”']/g,"").trim().split(/\s+/).filter(Boolean);return((((n=e[0])==null?void 0:n[0])??"")+(((r=e[1])==null?void 0:r[0])??"")).toUpperCase()||"G"}const Dl=t=>t&&/^https:\/\//i.test(t)?t:null;function Nl({g:t}){const e=a(O,{children:[a("div",{class:"row",children:[a("span",{class:"avatar",style:"width:48px;height:48px;flex:none","aria-hidden":"true",children:Rl(t.coach)}),a("div",{style:"min-width:0",children:[a("h3",{style:"font-size:17px",children:t.name}),t.coach?a("p",{class:"small muted",children:t.coach}):null]})]}),t.description?a("p",{class:"small",style:"margin-top:10px",children:t.description}):null]});if(t.locked)return a("section",{class:"card locked",children:[a("div",{class:"dim",children:e}),a("div",{style:"margin-top:10px",children:a(sn,{})}),a("p",{class:"small muted",style:"margin-top:8px",children:"Tersedia dalam Pakej Complete"}),a(ua,{style:"margin-top:10px"})]});const n=Dl(t.invite_url);return a("section",{class:"card",children:[e,a("div",{style:"margin-top:10px",children:a("span",{class:"badge green",children:[a("i",{class:"ph-bold ph-lock-key-open","aria-hidden":"true"})," Terbuka"]})}),n?a(I,{href:n,external:!0,variant:"green",block:!0,icon:"ph-bold ph-whatsapp-logo",style:"margin-top:12px",children:"Sertai Group"}):a("p",{class:"small muted",style:"margin-top:10px",children:"Pautan group belum tersedia. Sila semak semula kemudian atau hubungi admin."})]})}function Ll(){var c;const t=D(),[e,n]=b(null),[r,i]=b(null),[s,o]=b(0),l=[...t.entitlements].sort().join(",");return ae(()=>{let d=!0;return i(null),se("GET","/api/groups").then(h=>d&&n(Array.isArray(h)?h:[])).catch(h=>d&&i(L(h))),()=>{d=!1}},[l,s]),a(K,{route:"group",title:"Group Support",subtitle:(c=t.batch)==null?void 0:c.name,children:[r?a(je,{icon:"ph-bold ph-warning-circle",tone:"yellow",title:"Tidak dapat memuatkan group",text:r,children:a(I,{block:!0,onClick:()=>o(s+1),children:"Cuba lagi"})}):e?e.length===0?a(je,{icon:"ph-bold ph-users-three",title:"Tiada group lagi",text:"Group untuk batch anda belum dibuka. Sila semak semula kemudian."}):a("div",{class:"stack",children:e.map(d=>a(Nl,{g:d},d.id))}):a("p",{class:"muted small","aria-busy":"true",children:[a("i",{class:"ph-bold ph-spinner spin","aria-hidden":"true"})," Memuatkan…"]}),a(Y,{tone:"yellow",icon:"ph-fill ph-warning",style:"margin-top:12px",children:"Pautan group dikhaskan untuk peserta. Jangan kongsi."}),a(V,{})]})}function Ml(t,e){return`Salam, saya ingin memohon supaya akaun dan data peribadi saya dalam HDM BOOSTER dipadam (PDPA).
Nama: ${t??"-"}
Emel pendaftaran: ${e??"-"}`}function Ul(t,e,n){if(!t)return{current:"Sila masukkan kata laluan semasa."};const r={};return e.length<8?r.next="Kata laluan baharu mesti sekurang-kurangnya 8 aksara.":e===t&&(r.next="Kata laluan baharu mesti berbeza daripada kata laluan semasa."),!r.next&&n!==e&&(r.confirm="Kata laluan tidak sama. Taip semula kata laluan baharu."),r}const $l=new Set(["auth/invalid-credential","auth/invalid-login-credentials","auth/wrong-password"]);function Bl(t){const e=t==null?void 0:t.code;return typeof e!="string"?null:$l.has(e)?{field:"current",message:"Kata laluan semasa salah. Cuba lagi atau tekan Lupa kata laluan."}:e==="auth/weak-password"?{field:"next",message:"Kata laluan baharu terlalu lemah. Guna sekurang-kurangnya 8 aksara."}:e==="auth/requires-recent-login"||e==="auth/user-mismatch"||e==="auth/user-token-expired"?{field:null,message:"Sesi anda telah tamat. Sila log keluar, log masuk semula dan cuba lagi."}:e==="auth/too-many-requests"?{field:null,message:"Terlalu banyak cubaan. Cuba lagi selepas beberapa minit."}:null}const Fl="ABCDEFGHJKMNPQRSTUVWXYZ23456789";function Hl(t){if(t==null)return null;let e=String(t).toUpperCase().replace(/[\s-]+/g,"");if(e.startsWith("HDMB")&&(e=e.slice(4)),e.length!==8)return null;for(const n of e)if(!Fl.includes(n))return null;return`HDMB-${e.slice(0,4)}-${e.slice(4)}`}function jl(t){if(!String(t??"").trim())return{ok:!1,error:"Sila masukkan kod akses anda."};const e=Hl(t);return e?{ok:!0,code:e}:{ok:!1,error:"Format kod tidak sah. Kod berbentuk HDMB-XXXX-XXXX (huruf dan nombor). Semak semula."}}function Vl(t){return t.length?`Berjaya! ${t.length} item baharu dibuka.`:"Kod diterima. Anda sudah memiliki semua akses dalam kod ini."}function Kl(t,e){return t.map(n=>{var r;return((r=e==null?void 0:e.find(i=>i.key===n))==null?void 0:r.name)??n})}function ln(t){var f;const e=D(),n=t.id??"kod",[r,i]=b(""),[s,o]=b(!1),[l,c]=b(null),[d,h]=b(null),p=async y=>{var g,w;if(y.preventDefault(),s)return;h(null);const v=jl(r);if(!v.ok){c(v.error),(g=document.getElementById(n))==null||g.focus();return}c(null),o(!0);try{const _=await se("POST","/api/codes/redeem",{code:v.code}),m=Array.isArray(_==null?void 0:_.items)?_.items:[];await Ce(),i(""),h(m),(w=t.onRedeemed)==null||w.call(t,m)}catch(_){c(L(_))}finally{o(!1)}},u=d?Kl(d,(f=e.catalog)==null?void 0:f.items):[];return a("form",{onSubmit:p,noValidate:!0,children:[a("h3",{style:"font-size:16px",children:a("label",{for:n,children:t.title??"Ada kod akses?"})}),a("div",{class:"row",style:"margin-top:10px;align-items:stretch",children:[a("input",{id:n,class:"input"+(l?" err":""),placeholder:"HDMB-XXXX-XXXX",autocomplete:"off",autocapitalize:"characters",spellcheck:!1,style:"min-width:0;flex:1;text-transform:uppercase",value:r,autoFocus:t.autoFocus,"aria-invalid":l?"true":void 0,"aria-describedby":l?`${n}-err`:void 0,onInput:y=>{i(y.currentTarget.value),l&&c(null)}}),a(I,{type:"submit",loading:s,children:"Tebus"})]}),a(Je,{id:`${n}-err`,text:l}),d?a("div",{class:"callout green",role:"status",style:"margin-top:12px",children:[a("i",{class:"ph-fill ph-check-circle","aria-hidden":"true"}),a("span",{children:[Vl(d),u.length?a("span",{style:"display:block;font-weight:500;margin-top:4px",children:u.join(", ")}):null]})]}):null]})}const Kt=t=>t?Te(bt(new Date(t))):"";function ha(){const[t,e]=b(null),[n,r]=b(null),[i,s]=b(0);return ae(()=>{let o=!0;return r(null),se("GET","/api/me/access").then(l=>o&&e({purchases:(l==null?void 0:l.purchases)??[],codes:(l==null?void 0:l.codes)??[]})).catch(l=>o&&r(L(l))),()=>{o=!1}},[i]),{data:t,err:n,reload:()=>s(o=>o+1)}}function pa(){return a("div",{class:"grid2",style:"margin-top:12px",children:[a(I,{href:"#/ebook",variant:"outline",sm:!0,icon:"ph-bold ph-books",children:"Buka Ebook"}),a(I,{href:"#/group",variant:"outline",sm:!0,icon:"ph-bold ph-users-three",children:"Lihat Group"})]})}function zl(){const{data:t,reload:e}=ha(),[n,r]=b(!1);return a(K,{route:"akaun_kod",title:"Kod akses",back:"#/akaun",children:[a(R,{children:[a(ln,{id:"kod-akses",onRedeemed:()=>{r(!0),e()}}),a("p",{class:"hint",style:"margin-top:10px",children:"Kod diberi oleh admin, contohnya untuk naik taraf. Huruf kecil, ruang dan sengkang tidak mengapa."}),n?a(pa,{}):null]}),t&&t.codes.length?a(O,{children:[a("div",{class:"section-title",children:a("h2",{children:"Kod yang telah ditebus"})}),a(R,{style:"padding-top:4px;padding-bottom:4px",children:t.codes.map(i=>a("div",{class:"listrow",style:"font-weight:600",children:[a("i",{class:"ph-bold ph-ticket","aria-hidden":"true"}),a("span",{style:"min-width:0",children:[a("span",{class:"num",style:"display:block;letter-spacing:.5px",children:i.code}),a("span",{class:"small muted",children:[i.package_name,Kt(i.redeemed_at)].filter(Boolean).join(" · ")})]})]},i.id))})]}):null,a(V,{})]})}const er="background:#f8fafc;color:var(--muted)";function Wl({name:t,onDone:e}){const[n,r]=b(t),[i,s]=b(!1),[o,l]=b(null);return a("form",{onSubmit:async d=>{d.preventDefault();const h=n.trim().replace(/\s+/g," ");if(!h||h.length>100){l("Sila masukkan nama penuh (maksimum 100 aksara).");return}s(!0);try{await se("PUT","/api/me/name",{full_name:h}),await Ce(),We("Nama dikemas kini.","green"),e()}catch(p){l(L(p)),s(!1)}},noValidate:!0,children:[a(H,{id:"nama",label:"Nama penuh",autocomplete:"name",value:n,onInput:d=>{r(d),l(null)},error:o}),a("div",{class:"grid2",style:"margin-top:10px",children:[a(I,{variant:"outline",sm:!0,onClick:e,children:"Batal"}),a(I,{type:"submit",sm:!0,loading:i,children:"Simpan"})]})]})}function Gl({onDone:t}){const[e,n]=b(""),[r,i]=b(""),[s,o]=b(""),[l,c]=b({}),[d,h]=b(null),[p,u]=b(!1);return a("form",{onSubmit:async y=>{if(y.preventDefault(),p)return;const v=Ul(e,r,s);if(c(v),h(null),!Object.keys(v).length){u(!0);try{await jo(e,r),We("Kata laluan telah ditukar.","green"),t()}catch(g){const w=Bl(g);w!=null&&w.field?c({[w.field]:w.message}):h((w==null?void 0:w.message)??L(g)),u(!1)}}},noValidate:!0,style:"padding:8px 0 14px",children:[a(H,{id:"pw-cur",label:"Kata laluan semasa",type:"password",autocomplete:"current-password",value:e,onInput:n,error:l.current}),a(H,{id:"pw-new",label:"Kata laluan baharu",type:"password",autocomplete:"new-password",value:r,onInput:i,error:l.next,hint:"Sekurang-kurangnya 8 aksara"}),a(H,{id:"pw-conf",label:"Taip semula kata laluan baharu",type:"password",autocomplete:"new-password",value:s,onInput:o,error:l.confirm}),d?a(Y,{tone:"red",icon:"ph-fill ph-warning-circle",style:"margin-top:12px",children:d}):null,a("p",{class:"small",style:"margin-top:10px",children:a("a",{href:"#/lupa",children:"Lupa kata laluan semasa?"})}),a("div",{class:"grid2",style:"margin-top:12px",children:[a(I,{variant:"outline",sm:!0,onClick:t,children:"Batal"}),a(I,{type:"submit",sm:!0,loading:p,children:"Tukar"})]})]})}function Jl(){var y,v;const t=D(),{data:e,err:n,reload:r}=ha(),[i,s]=b(!1),[o,l]=b(!1),[c,d]=b(!1),h=t.profile,p=na(t.entitlements,((y=t.catalog)==null?void 0:y.packages)??[]),u=(((v=t.catalog)==null?void 0:v.items)??[]).filter(g=>t.entitlements.has(g.key)).sort((g,w)=>g.sort-w.sort),f=Se(t,"support_wa",Ee);return a(K,{route:"akaun",children:[a(R,{children:[i?a(Wl,{name:(h==null?void 0:h.full_name)??"",onDone:()=>s(!1)}):a("div",{class:"row",children:[a("span",{class:"avatar",style:"width:56px;height:56px;font-size:20px;flex:none","aria-hidden":"true",children:aa(h==null?void 0:h.full_name)}),a("div",{style:"min-width:0",children:a("h2",{style:"font-size:20px;overflow-wrap:anywhere",children:[(h==null?void 0:h.full_name)??"-"," ",a("button",{type:"button",onClick:()=>s(!0),"aria-label":"Ubah nama",style:"background:none;border:0;padding:4px;cursor:pointer;vertical-align:middle",children:a("i",{class:"ph ph-pencil-simple",style:"color:var(--blue);font-size:18px","aria-hidden":"true"})})]})})]}),a("div",{class:"field",children:[a("label",{for:"ak-e",children:"Emel"}),a("input",{id:"ak-e",class:"input",value:(h==null?void 0:h.email)??"",readOnly:!0,style:er})]}),a("div",{class:"field",children:[a("label",{for:"ak-p",children:"No. telefon"}),a("input",{id:"ak-p",class:"input",value:(h==null?void 0:h.phone)??"",readOnly:!0,style:er})]}),a("p",{class:"tiny subtle",style:"margin-top:8px",children:"Hubungi admin untuk tukar emel/telefon"})]}),a("div",{class:"section-title",children:a("h2",{children:"Pakej & akses"})}),a(R,{children:[a("span",{class:`badge ${p.id==="tiada"?"grey":"blue"}`,children:[a("i",{class:"ph-bold ph-seal-check","aria-hidden":"true"})," ",p.label]}),n?a("p",{class:"small muted",style:"margin-top:8px",children:[n," ",a("a",{href:"#/akaun",onClick:g=>{g.preventDefault(),r()},children:"Cuba lagi"})]}):e?a(O,{children:[e.purchases.map(g=>a("p",{class:"small muted",style:"margin-top:8px",children:[g.package_name,g.order_ref,Kt(g.paid_at),g.amount_rm!=null?`RM${Number(g.amount_rm)}`:""].filter(Boolean).join(" · ")},g.id)),e.codes.map(g=>a("p",{class:"small muted",style:"margin-top:8px",children:["Kod ",g.code,g.package_name?` · ${g.package_name}`:"",g.redeemed_at?` · ${Kt(g.redeemed_at)}`:""]},g.id)),!e.purchases.length&&!e.codes.length?a("p",{class:"small muted",style:"margin-top:8px",children:"Tiada rekod pembelian atau kod pada akaun ini."}):null]}):a("p",{class:"small muted",style:"margin-top:8px",children:[a("i",{class:"ph-bold ph-spinner spin","aria-hidden":"true"})," Memuatkan…"]}),u.length?a("div",{style:"display:flex;flex-wrap:wrap;gap:8px;margin-top:12px","aria-label":"Akses anda",children:u.map(g=>a("span",{class:"chip",children:g.name},g.key))}):null]}),a(R,{children:[a(ln,{id:"ak-kod",onRedeemed:r}),a("p",{class:"tiny subtle",style:"margin-top:8px",children:a("a",{href:"#/akaun/kod",children:"Lihat kod yang telah ditebus"})})]}),a(R,{style:"padding-top:4px;padding-bottom:4px;margin-top:12px",children:[a("a",{class:"listrow",href:"#/akaun","aria-expanded":o,onClick:g=>{g.preventDefault(),l(!o)},children:[a("i",{class:"ph-bold ph-lock-key","aria-hidden":"true"})," Tukar kata laluan ",a("i",{class:`ph ${o?"ph-caret-down":"ph-caret-right"}`,"aria-hidden":"true"})]}),o?a(Gl,{onDone:()=>l(!1)}):null,a("a",{class:"listrow",href:"#/bantuan",children:[a("i",{class:"ph-bold ph-lifebuoy","aria-hidden":"true"})," Bantuan ",a("i",{class:"ph ph-caret-right","aria-hidden":"true"})]}),a("a",{class:"listrow",href:Ge(f,Ml(h==null?void 0:h.full_name,h==null?void 0:h.email)),target:"_blank",rel:"noopener noreferrer",children:[a("i",{class:"ph-bold ph-whatsapp-logo","aria-hidden":"true"})," Minta padam data (PDPA) ",a("i",{class:"ph ph-caret-right","aria-hidden":"true"})]})]}),a(I,{variant:"danger-t",block:!0,icon:"ph-bold ph-sign-out",loading:c,style:"margin-top:12px",onClick:async()=>{d(!0);try{await _t()}finally{d(!1)}},children:"Log keluar"}),a(V,{})]})}function ql(){var r;const t=D(),[e,n]=b(!1);return a(K,{route:"aktif",title:"Aktifkan pakej",back:"#/",children:[a(R,{children:[a("p",{class:"small muted",style:"margin-bottom:12px",children:["Log masuk sebagai ",a("b",{children:((r=t.profile)==null?void 0:r.email)??"-"}),". Masukkan kod akses yang anda terima untuk membuka pakej anda."]}),a(ln,{id:"kod-aktif",title:"Kod akses",autoFocus:!0,onRedeemed:()=>n(!0)}),e?a(pa,{}):null]}),a(V,{})]})}function Xl(){return a("div",{class:"phone no-tabs",style:"display:grid;place-items:center","aria-busy":"true",children:a("div",{style:"text-align:center",children:[a("span",{class:"wordmark",children:["HDM ",a("b",{children:"BOOSTER"})]}),a("p",{class:"muted small",style:"margin-top:10px",children:[a("i",{class:"ph-bold ph-spinner spin","aria-hidden":"true"})," Memuatkan…"]})]})})}function Yl({s:t}){const e=t.errorReason==="tiada_profil";return a("div",{class:"phone no-tabs",children:a("main",{class:"page",style:"padding-top:48px",children:a(je,{icon:"ph-bold ph-warning-circle",tone:"yellow",title:e?"Akaun belum lengkap":"Tidak dapat memuatkan data",text:t.error,children:[e?null:a(I,{block:!0,onClick:()=>void Ce(),children:"Cuba lagi"}),a(I,{variant:e?"primary":"ghost",block:!0,style:"margin-top:8px",onClick:()=>void _t(),children:"Log keluar"})]})})})}function Ql({route:t}){var e;switch(t.name){case"masuk":return a(Wo,{next:(e=t.query)==null?void 0:e.next});case"daftar":return a(Go,{});case"lupa":return a(Jo,{});case"home":return a(dl,{});case"bantuan":return a(hl,{});case"rekod":case"cabaran":return a(fl,{route:t.name});case"onboarding":return a(Il,{});case"tdee":return a(xl,{});case"group":return a(Ll,{});case"akaun":return a(Jl,{});case"akaun_kod":return a(zl,{});case"aktif":return a(ql,{});case"tiada":return a(_l,{});default:return a(gl,{route:t.name})}}function Zl(){var s;const t=xa(),e=D();ae(()=>Fo(),[]);const n=Pa(t,{status:e.status,onboarded:!!((s=e.profile)!=null&&s.onboarded_at),roles:e.roles});ae(()=>{n&&Me(n,!0)},[n]);const r=gr.has(t.name);let i;return e.status==="error"&&!r?i=a(Yl,{s:e}):n||e.status==="loading"&&!r?i=a(Xl,{}):i=a(Ql,{route:t}),a(O,{children:[i,a(zo,{})]})}va(a(Zl,{}),document.getElementById("app"));
