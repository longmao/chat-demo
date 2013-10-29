(function(){

  if(typeof PEM === "undefined") PEM = {}

  PEM.util = {
    init:function(){
      $.extend($.fn, {
        findOrAppend: function(selector, template, locals, callback) {
          var $el = $.fn.find.call(this, selector)
          if ('function' === typeof locals) {
            callback = locals
            locals = {}
          }
          if (!$el.length) {
            locals = locals || {}
            $el = $('function' === typeof template ? template(locals) : template).appendTo(this)
            callback && callback.call($el, $el, true)
          } else {
            callback && callback.call($el, $el, false)
          }
          return this
        }
      });
    },
    scrollTop:function($container,scroll_height){
      $container.scrollTop(scroll_height)
    }
  }

}())