!function(){"use strict";function t(t,n){(null==n||n>t.length)&&(n=t.length);for(var r=0,e=new Array(n);r<n;r++)e[r]=t[r];return e}function n(n){return function(n){if(Array.isArray(n))return t(n)}(n)||function(t){if("undefined"!==typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(n)||function(n,r){if(n){if("string"===typeof n)return t(n,r);var e=Object.prototype.toString.call(n).slice(8,-1);return"Object"===e&&n.constructor&&(e=n.constructor.name),"Map"===e||"Set"===e?Array.from(n):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?t(n,r):void 0}}(n)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}var r=Array.isArray||function(t){return null!=t&&t.length>=0&&"[object Array]"===Object.prototype.toString.call(t)};function e(t,n,e){return function(){if(0===arguments.length)return e();var u=arguments[arguments.length-1];if(!r(u)){for(var o=0;o<t.length;){if("function"===typeof u[t[o]])return u[t[o]].apply(u,Array.prototype.slice.call(arguments,0,-1));o+=1}if(function(t){return null!=t&&"function"===typeof t["@@transducer/step"]}(u))return n.apply(null,Array.prototype.slice.call(arguments,0,-1))(u)}return e.apply(this,arguments)}}var u=function(){return this.xf["@@transducer/init"]()},o=function(t){return this.xf["@@transducer/result"](t)};function i(t){return null!=t&&"object"===typeof t&&!0===t["@@functional/placeholder"]}function c(t){return function n(r){return 0===arguments.length||i(r)?n:t.apply(this,arguments)}}function a(t){return function n(r,e){switch(arguments.length){case 0:return n;case 1:return i(r)?n:c((function(n){return t(r,n)}));default:return i(r)&&i(e)?n:i(r)?c((function(n){return t(n,e)})):i(e)?c((function(n){return t(r,n)})):t(r,e)}}}function f(t){for(var n,r=[];!(n=t.next()).done;)r.push(n.value);return r}function s(t,n,r){for(var e=0,u=r.length;e<u;){if(t(n,r[e]))return!0;e+=1}return!1}function l(t,n){return Object.prototype.hasOwnProperty.call(n,t)}var p="function"===typeof Object.is?Object.is:function(t,n){return t===n?0!==t||1/t===1/n:t!==t&&n!==n},y=Object.prototype.toString,d=function(){return"[object Arguments]"===y.call(arguments)?function(t){return"[object Arguments]"===y.call(t)}:function(t){return l("callee",t)}}(),h=d,v=!{toString:null}.propertyIsEnumerable("toString"),g=["constructor","valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"],b=function(){return arguments.propertyIsEnumerable("length")}(),m=function(t,n){for(var r=0;r<t.length;){if(t[r]===n)return!0;r+=1}return!1},w="function"!==typeof Object.keys||b?c((function(t){if(Object(t)!==t)return[];var n,r,e=[],u=b&&h(t);for(n in t)!l(n,t)||u&&"length"===n||(e[e.length]=n);if(v)for(r=g.length-1;r>=0;)l(n=g[r],t)&&!m(e,n)&&(e[e.length]=n),r-=1;return e})):c((function(t){return Object(t)!==t?[]:Object.keys(t)})),O=c((function(t){return null===t?"Null":void 0===t?"Undefined":Object.prototype.toString.call(t).slice(8,-1)}));function j(t,n,r,e){var u=f(t);function o(t,n){return S(t,n,r.slice(),e.slice())}return!s((function(t,n){return!s(o,n,t)}),f(n),u)}function S(t,n,r,e){if(p(t,n))return!0;var u=O(t);if(u!==O(n))return!1;if("function"===typeof t["fantasy-land/equals"]||"function"===typeof n["fantasy-land/equals"])return"function"===typeof t["fantasy-land/equals"]&&t["fantasy-land/equals"](n)&&"function"===typeof n["fantasy-land/equals"]&&n["fantasy-land/equals"](t);if("function"===typeof t.equals||"function"===typeof n.equals)return"function"===typeof t.equals&&t.equals(n)&&"function"===typeof n.equals&&n.equals(t);switch(u){case"Arguments":case"Array":case"Object":if("function"===typeof t.constructor&&"Promise"===function(t){var n=String(t).match(/^function (\w*)/);return null==n?"":n[1]}(t.constructor))return t===n;break;case"Boolean":case"Number":case"String":if(typeof t!==typeof n||!p(t.valueOf(),n.valueOf()))return!1;break;case"Date":if(!p(t.valueOf(),n.valueOf()))return!1;break;case"Error":return t.name===n.name&&t.message===n.message;case"RegExp":if(t.source!==n.source||t.global!==n.global||t.ignoreCase!==n.ignoreCase||t.multiline!==n.multiline||t.sticky!==n.sticky||t.unicode!==n.unicode)return!1}for(var o=r.length-1;o>=0;){if(r[o]===t)return e[o]===n;o-=1}switch(u){case"Map":return t.size===n.size&&j(t.entries(),n.entries(),r.concat([t]),e.concat([n]));case"Set":return t.size===n.size&&j(t.values(),n.values(),r.concat([t]),e.concat([n]));case"Arguments":case"Array":case"Object":case"Boolean":case"Number":case"String":case"Date":case"Error":case"RegExp":case"Int8Array":case"Uint8Array":case"Uint8ClampedArray":case"Int16Array":case"Uint16Array":case"Int32Array":case"Uint32Array":case"Float32Array":case"Float64Array":case"ArrayBuffer":break;default:return!1}var i=w(t);if(i.length!==w(n).length)return!1;var c=r.concat([t]),a=e.concat([n]);for(o=i.length-1;o>=0;){var f=i[o];if(!l(f,n)||!S(n[f],t[f],c,a))return!1;o-=1}return!0}var _=a((function(t,n){return S(t,n,[],[])}));function A(t,n){return function(t,n,r){var e,u;if("function"===typeof t.indexOf)switch(typeof n){case"number":if(0===n){for(e=1/n;r<t.length;){if(0===(u=t[r])&&1/u===e)return r;r+=1}return-1}if(n!==n){for(;r<t.length;){if("number"===typeof(u=t[r])&&u!==u)return r;r+=1}return-1}return t.indexOf(n,r);case"string":case"boolean":case"function":case"undefined":return t.indexOf(n,r);case"object":if(null===n)return t.indexOf(n,r)}for(;r<t.length;){if(_(t[r],n))return r;r+=1}return-1}(n,t,0)>=0}function x(t,n){for(var r=0,e=n.length,u=Array(e);r<e;)u[r]=t(n[r]),r+=1;return u}var P=function(t){return(t<10?"0":"")+t};Date.prototype.toISOString;function k(t,n,r){for(var e=0,u=r.length;e<u;)n=t(n,r[e]),e+=1;return n}var q=function(){function t(t,n){this.xf=n,this.f=t}return t.prototype["@@transducer/init"]=u,t.prototype["@@transducer/result"]=o,t.prototype["@@transducer/step"]=function(t,n){return this.f(n)?this.xf["@@transducer/step"](t,n):t},t}();function E(t){return function(n){return new q(t,n)}}var I=a(e(["fantasy-land/filter","filter"],E,(function(t,n){return r=n,"[object Object]"===Object.prototype.toString.call(r)?k((function(r,e){return t(n[e])&&(r[e]=n[e]),r}),{},w(n)):function(t,n){for(var r=0,e=n.length,u=[];r<e;)t(n[r])&&(u[u.length]=n[r]),r+=1;return u}(t,n);var r}))),W=a((function(t,n){return I((r=t,function(){return!r.apply(this,arguments)}),n);var r})),U=W;var z=function(){function t(t,n){this.xf=n,this.f=t}return t.prototype["@@transducer/init"]=u,t.prototype["@@transducer/result"]=o,t.prototype["@@transducer/step"]=function(t,n){return this.xf["@@transducer/step"](t,this.f(n))},t}(),N=function(t){return function(n){return new z(t,n)}};function D(t,n){switch(t){case 0:return function(){return n.apply(this,arguments)};case 1:return function(t){return n.apply(this,arguments)};case 2:return function(t,r){return n.apply(this,arguments)};case 3:return function(t,r,e){return n.apply(this,arguments)};case 4:return function(t,r,e,u){return n.apply(this,arguments)};case 5:return function(t,r,e,u,o){return n.apply(this,arguments)};case 6:return function(t,r,e,u,o,i){return n.apply(this,arguments)};case 7:return function(t,r,e,u,o,i,c){return n.apply(this,arguments)};case 8:return function(t,r,e,u,o,i,c,a){return n.apply(this,arguments)};case 9:return function(t,r,e,u,o,i,c,a,f){return n.apply(this,arguments)};case 10:return function(t,r,e,u,o,i,c,a,f,s){return n.apply(this,arguments)};default:throw new Error("First argument to _arity must be a non-negative integer no greater than ten")}}function C(t,n,r){return function(){for(var e=[],u=0,o=t,c=0;c<n.length||u<arguments.length;){var a;c<n.length&&(!i(n[c])||u>=arguments.length)?a=n[c]:(a=arguments[u],u+=1),e[c]=a,i(a)||(o-=1),c+=1}return o<=0?r.apply(this,e):D(o,C(t,e,r))}}var F=a((function(t,n){return 1===t?c(n):D(t,C(t,[],n))})),M=a(e(["fantasy-land/map","map"],N,(function(t,n){switch(Object.prototype.toString.call(n)){case"[object Function]":return F(n.length,(function(){return t.call(this,n.apply(this,arguments))}));case"[object Object]":return k((function(r,e){return r[e]=t(n[e]),r}),{},w(n));default:return x(t,n)}}))),T=M;Number.isInteger;function B(t){return"[object String]"===Object.prototype.toString.call(t)}function L(t){return function n(r,e,u){switch(arguments.length){case 0:return n;case 1:return i(r)?n:a((function(n,e){return t(r,n,e)}));case 2:return i(r)&&i(e)?n:i(r)?a((function(n,r){return t(n,e,r)})):i(e)?a((function(n,e){return t(r,n,e)})):c((function(n){return t(r,e,n)}));default:return i(r)&&i(e)&&i(u)?n:i(r)&&i(e)?a((function(n,r){return t(n,r,u)})):i(r)&&i(u)?a((function(n,r){return t(n,e,r)})):i(e)&&i(u)?a((function(n,e){return t(r,n,e)})):i(r)?c((function(n){return t(n,e,u)})):i(e)?c((function(n){return t(r,n,u)})):i(u)?c((function(n){return t(r,e,n)})):t(r,e,u)}}}var R=c((function(t){return!!r(t)||!!t&&("object"===typeof t&&(!B(t)&&(0===t.length||t.length>0&&(t.hasOwnProperty(0)&&t.hasOwnProperty(t.length-1)))))})),X="undefined"!==typeof Symbol?Symbol.iterator:"@@iterator";function $(t,n,r){return function(e,u,o){if(R(o))return t(e,u,o);if(null==o)return u;if("function"===typeof o["fantasy-land/reduce"])return n(e,u,o,"fantasy-land/reduce");if(null!=o[X])return r(e,u,o[X]());if("function"===typeof o.next)return r(e,u,o);if("function"===typeof o.reduce)return n(e,u,o,"reduce");throw new TypeError("reduce: list must be array or iterable")}}function G(t,n,r){for(var e=0,u=r.length;e<u;){if((n=t["@@transducer/step"](n,r[e]))&&n["@@transducer/reduced"]){n=n["@@transducer/value"];break}e+=1}return t["@@transducer/result"](n)}var H=a((function(t,n){return D(t.length,(function(){return t.apply(n,arguments)}))})),J=H;function K(t,n,r){for(var e=r.next();!e.done;){if((n=t["@@transducer/step"](n,e.value))&&n["@@transducer/reduced"]){n=n["@@transducer/value"];break}e=r.next()}return t["@@transducer/result"](n)}function Q(t,n,r,e){return t["@@transducer/result"](r[e](J(t["@@transducer/step"],t),n))}var V=$(G,Q,K),Y=function(){function t(t){this.f=t}return t.prototype["@@transducer/init"]=function(){throw new Error("init not implemented on XWrap")},t.prototype["@@transducer/result"]=function(t){return t},t.prototype["@@transducer/step"]=function(t,n){return this.f(t,n)},t}();var Z=L((function(t,n,r){return V("function"===typeof t?new Y(t):t,n,r)}));function tt(t){return function n(r){for(var e,u,o,i=[],c=0,a=r.length;c<a;){if(R(r[c]))for(o=0,u=(e=t?n(r[c]):r[c]).length;o<u;)i[i.length]=e[o],o+=1;else i[i.length]=r[c];c+=1}return i}}function nt(t,n,r){var e,u=typeof t;switch(u){case"string":case"number":return 0===t&&1/t===-1/0?!!r._items["-0"]||(n&&(r._items["-0"]=!0),!1):null!==r._nativeSet?n?(e=r._nativeSet.size,r._nativeSet.add(t),r._nativeSet.size===e):r._nativeSet.has(t):u in r._items?t in r._items[u]||(n&&(r._items[u][t]=!0),!1):(n&&(r._items[u]={},r._items[u][t]=!0),!1);case"boolean":if(u in r._items){var o=t?1:0;return!!r._items[u][o]||(n&&(r._items[u][o]=!0),!1)}return n&&(r._items[u]=t?[!1,!0]:[!0,!1]),!1;case"function":return null!==r._nativeSet?n?(e=r._nativeSet.size,r._nativeSet.add(t),r._nativeSet.size===e):r._nativeSet.has(t):u in r._items?!!A(t,r._items[u])||(n&&r._items[u].push(t),!1):(n&&(r._items[u]=[t]),!1);case"undefined":return!!r._items[u]||(n&&(r._items[u]=!0),!1);case"object":if(null===t)return!!r._items.null||(n&&(r._items.null=!0),!1);default:return(u=Object.prototype.toString.call(t))in r._items?!!A(t,r._items[u])||(n&&r._items[u].push(t),!1):(n&&(r._items[u]=[t]),!1)}}var rt=function(){function t(){this._nativeSet="function"===typeof Set?new Set:null,this._items={}}return t.prototype.add=function(t){return!nt(t,!0,this)},t.prototype.has=function(t){return nt(t,!1,this)},t}();var et=c(tt(!0));function ut(t){return t}var ot=c(ut),it=function(){function t(t,n){this.xf=n,this.f=t,this.set=new rt}return t.prototype["@@transducer/init"]=u,t.prototype["@@transducer/result"]=o,t.prototype["@@transducer/step"]=function(t,n){return this.set.add(this.f(n))?this.xf["@@transducer/step"](t,n):t},t}();function ct(t){return function(n){return new it(t,n)}}var at=a(e([],ct,(function(t,n){for(var r,e,u=new rt,o=[],i=0;i<n.length;)r=t(e=n[i]),u.add(r)&&o.push(e),i+=1;return o})))(ot);"function"===typeof Object.assign&&Object.assign;var ft="\t\n\v\f\r \xa0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\ufeff";String.prototype.trim;function st(t){return st="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},st(t)}function lt(t){var n=function(t,n){if("object"!==st(t)||null===t)return t;var r=t[Symbol.toPrimitive];if(void 0!==r){var e=r.call(t,n||"default");if("object"!==st(e))return e;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===n?String:Number)(t)}(t,"string");return"symbol"===st(n)?n:String(n)}function pt(t,n){for(var r=0;r<n.length;r++){var e=n[r];e.enumerable=e.enumerable||!1,e.configurable=!0,"value"in e&&(e.writable=!0),Object.defineProperty(t,lt(e.key),e)}}function yt(t,n,r){return n&&pt(t.prototype,n),r&&pt(t,r),Object.defineProperty(t,"prototype",{writable:!1}),t}function dt(t,n,r){return(n=lt(n))in t?Object.defineProperty(t,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[n]=r,t}function ht(t,n){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var e=Object.getOwnPropertySymbols(t);n&&(e=e.filter((function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable}))),r.push.apply(r,e)}return r}function vt(t){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?ht(Object(r),!0).forEach((function(n){dt(t,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):ht(Object(r)).forEach((function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(r,n))}))}return t}var gt=function(t,n,r){var e=t.callback,u=t.onlyUnvisitedNeighbors,o=wt(vt(vt({},r),{},{width:n.width})),i=yt((function t(){!function(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}(this,t)}));return T((function(t){var r=t.row,o=t.column,c=function(){return e(n[r][o],{row:r,column:o})};return u&&n[r][o].visited?new i:c()}),o).filter((function(t){return!(t instanceof i)}))};function bt(t,n,r){var e=F(3,gt)(t);return n?r?e(n,r):e(n):e}var mt=function(t){for(var n=t.width,r={width:n},e=0;e<n;e++){r[e]={index:e};for(var u=0;u<n;u++)r[e][u]=vt({},t[e][u])}return r},wt=function(t){var r=t.row,e=t.column,u=t.width,o=function(t){var r=t.rows,e=t.columns;return Z((function(t,r){return[].concat(n(t),n(T((function(t){return{row:r,column:t}}),e)))}),[],r)}({rows:I((function(t){return t>=0&&t<u}),[r-1,r,r+1]),columns:I((function(t){return t>=0&&t<u}),[e-1,e,e+1])});return I((function(t){var n=t.row,u=t.column;return!(r===n&&e===u)}),o)},Ot=function t(r,e,u){return function(o,i){var c="".concat(e).concat(o.letter),a=r.includes(c),f=a?r.filter((function(t){return t!==c})):r,s=a?[c]:[],l=f.filter((function(t){return 0===t.indexOf(c)}));if(l.length){var p=i.row,y=i.column,d=mt(u);d[p][y].visited=!0;var h=t(l,c,d),v=et(bt({callback:h,onlyUnvisitedNeighbors:!0},d,i));return[].concat(s,n(v))}return s}},jt=function(t,r,e){var u=r.filter((function(t){return t.length>=e})),o=function(t,n,r){for(var e=t.width,u=r,o=0;o<e;o++)for(var i=0;i<e;i++)u=n(u,t[o][i],{row:o,column:i});return u}(t,(function(r,e,u){var o=r.remainingWords,i=r.foundWords;if(!o.length)return{remainingWords:o,foundWords:i};var c=u.row,a=u.column;o.includes(e.letter)&&(i.push(e.letter),o.splice(o.indexOf(e.letter),1));var f=mt(t);f[c][a].visited=!0;var s=Ot(o,e.letter,f),l=et(bt({callback:s,onlyUnvisitedNeighbors:!0},f,u));return{remainingWords:U((function(t){return l.includes(t)}),o),foundWords:[].concat(n(i),n(l))}}),{remainingWords:u,foundWords:[]}),i=o.foundWords;return at(i)};onmessage=function(t){var n=t.data,r=n.board,e=n.dictionary,u=n.minWordLength,o=n.requestId;try{var i=jt(r,e,u);postMessage({result:i,requestId:o})}catch(c){postMessage({error:c,requestId:o})}}}();
//# sourceMappingURL=dictionary.worker.836c6fc9.worker.js.map