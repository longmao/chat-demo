/*! chat-demo 2013-10-31 */
!function(){"undefined"==typeof PEM&&(PEM={}),PEM.util={init:function(){$.extend($.fn,{findOrAppend:function(a,b,c,d){var e=$.fn.find.call(this,a);return"function"==typeof c&&(d=c,c={}),e.length?d&&d.call(e,e,!1):(c=c||{},e=$("function"==typeof b?b(c):b).appendTo(this),d&&d.call(e,e,!0)),this}})},scrollTop:function(a,b){a.scrollTop(b)}}}();