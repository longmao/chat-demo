(function(){
  if(typeof window.console === "undefined") window.console = {log:$.noop()}
  if(typeof PEM === "undefined") PEM = {}
  PEM.data = {timerCounterInterval:{}};
  window.$win = $(window)
  window.$body = $("body")
  window.$doc = $(document)
}())