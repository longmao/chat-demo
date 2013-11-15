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
    },
    setTimeCounter:function($el,data){
      if(typeof PEM.data.timerCounterInterval[data.to] !== "undefined") return
      var $hour = $el.find("#hour"),
          $minute = $el.find("#minute"),
          $second = $el.find("#second"),
          counterSecond = function(){
            var second = parseInt($second.text(),10)
            ++second;
            if(second > 59){
              counterMinute()
              $second.text("00")
            }
            else{
              $second.text(second < 10 ? "0" + second : second)
            }
          },
          counterMinute = function(){
            var minute = parseInt($minute.text(),10)
            ++minute;
            if(minute > 59){
              counterHour();
              $minute.text("00")
            }else{
              $minute.text(minute < 10 ? "0" + minute : minute)
            }
          },
          counterHour = function(){
            var hour = parseInt($hour.text(),10)
            ++hour;
            $hour.text(hour < 10 ? "0" + hour : hour)
          }
      PEM.data.timerCounterInterval[data.to] = setInterval(function(){
        counterSecond()
      },1000)
    },
    clearTimeCounter:function(data){
      clearInterval(PEM.data.timerCounterInterval[data.to])
      delete PEM.data.timerCounterInterval[data.to]
    },
    initTimeCounter:function($el){
      var $hour = $el.find("#hour"),
          $minute = $el.find("#minute"),
          $second = $el.find("#second");
      $hour.text("00");
      $minute.text("00");
      $second.text("00")
    },
    timeToChinese:function(str){
      var array = str.split(":")
      if(array.length !== 3) return;

      var time_str = "",
          hour = parseInt(array[0]),
          minute = parseInt(array[1]),
          second = parseInt(array[2]);
      time_str += hour > 0 && hour + "小时" || ""
      time_str += minute > 0 && minute + "分钟" || ""
      time_str += second > 0 && second + "秒" || "0秒"
      return time_str
    },
    getEmotionsHtml:function(){
      var $emotions = $("<ul class='row emotions_list'></ul>"),$div = $("<div></div>")
      _.forEach(PEM.helper.getEmotions(),function(emotion){
        $emotions.append(""
          + "<li>"
            + "<a href='javascript:;' data-emotion='" + emotion[2] + "'>"
              + "<img width=22 height=20 src='/images/emotions/" + emotion[0] + ".png' title='" + emotion[1] + "'/>"
            + "</a>"
          + "</li>")
      })
      $div.append($emotions)
      return $div
    }

  }

}())