!function(n){"use strict";"function"==typeof define&&define.amd?define(["jquery"],n):n(window.jQuery)}(function($){"use strict";var n=function(n,o,r){var e=function(e){var s=n.scrollTop();return e+o.height()>=s-r&&e<=s+n.height()+r},s=function(r){var e=n.scrollLeft();return r<=e+n.width()&&r+o.width()>=e},t=o.offset();return e(t.top)&&s(t.left)},o=function(n){if(!n.isTrigger){var o=$("."+c);o.length?o.holdup("render"):d&&p.ignore()}},r=function(n,o){var r=function(){n.removeClass(c+" "+o.successClass).addClass(o.errorClass),o.onError&&o.onError.apply(n,arguments)},e=function(){n.is("img")?n.prop("src",s).removeClass(c+" "+o.errorClass).addClass(o.successClass):n.css("background-image",'url("'+s+'")'),o.onSuccess&&o.onSuccess.apply(n,arguments)},s=n.data(o.srcAttr)||n.data(a),t;s?(t=new Image,t.onerror=r,t.onload=e,t.src=s):r()},e=function(n,o,r){var e,s,t,i=null,u=0,l=function(){t=n.apply(e,s),i=e=s=null},c=function(){u=r?0:$.now(),l()};return function a(){var n=$.now(),a;return!u&&r&&(u=n),a=o-(n-u),e=this,s=arguments,0>=a?(clearTimeout(i),u=n,l()):i||r||(i=setTimeout(c,a)),t}},s=function(n){return e(o,n)},t=function(n){return e(o,n,!0)},i=$(window),u="resize.holdup",l="scroll.holdup",c="holdup-pending",a="src",d=!1,f=$.fn.holdup,h=function(n,o){var r=this,e=r.options=$.extend({},h.DEFAULTS,o);r.$el=$(n).addClass(e.baseClass+" "+c).prop("src",e.placeholder),r.isloaded=!1,r.observe(),r.render()},p=h.prototype;return p.show=function(){r(this.$el,this.options)},p.render=function(){!this.isloaded&&n(i,this.$el,this.options.threshold)&&this.show()},p.observe=function(){d||(i.on(l,s(this.options.timerScroll)).on(u,t(this.options.timerResize)),d=!0)},p.ignore=function(){i.off(l).off(u),d=!1},h.DEFAULTS={baseClass:"heldup",errorClass:"heldup-error",successClass:"heldup-success",timerScroll:300,timerResize:250,onSuccess:null,onError:null,placeholder:"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",threshold:0,srcAttr:window.devicePixelRatio>1?"src-retina":a},$.fn.holdup=function(n){return this.each(function o(){var o=$(this),r=o.data("holdup"),e=typeof n;r||o.data("holdup",r=new h(this,"object"===e&&n)),"string"===e&&r[n]&&r[n]()})},$.fn.holdup.Constructor=h,$.fn.holdup.noConflict=function(){return $.fn.holdup=f,this},$.fn.holdup});
//# sourceMappingURL=./jquery-holdup-min.js.map