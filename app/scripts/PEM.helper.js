
(function(){
  var helpers = function(){
    var that = this;
    that.now = function(date){
      var date = date || new Date();
      var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
      return time;
    }
  }
  if(typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = function(){
      return new helpers()
    }
  }else{
    if(typeof PEM === "undefined") PEM = {}
    PEM.helpers = new helpers()
  }

}())