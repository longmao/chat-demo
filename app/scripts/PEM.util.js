(function(){
  if(typeof window.console === "undefined") console = {}
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
    },
    insertAtCursor:function(myField, myValue) {
      //IE support
      if (document.selection) {
          myField.focus();
          sel = document.selection.createRange();
          sel.text = myValue;
      }
      //MOZILLA and others
      else if (myField.selectionStart || myField.selectionStart == '0') {
          var startPos = myField.selectionStart;
          var endPos = myField.selectionEnd;
          myField.value = myField.value.substring(0, startPos)
              + myValue
              + myField.value.substring(endPos, myField.value.length);
          myField.selectionStart = startPos + myValue.length;
          myField.selectionEnd = startPos + myValue.length;
      } else {
          myField.value += myValue;
      }
    }
  }

}())