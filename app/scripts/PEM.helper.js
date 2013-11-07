(function(){
  var helper = function(options){
    var that = this;
    that.now = function(date){
      var date = date || new Date();
      var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
      return time;
    }
    that.getEmotions = function(){
      return [
        ['01smile', '微笑','[微笑]'], 
        ['02smile-big', '呵呵','[呵呵]'], 
        ['03laugh', '哈哈','[哈哈]'], 
        ['04clap', '鼓掌','[鼓掌]'], 
        ['05confused', '困惑','[困惑]'], 
        ['06sad', '难过','[难过]'], 
        ['07angry', '生气','[生气]'], 
        ['08cute', '可爱', '[可爱]'], 
        ['09act-up', '调皮', '[调皮]'], 
        ['10sweat', '汗', '[汗]'], 
        ['11good', '赞', '[赞]'], 
        ['12bad', '贬', '[贬]'], 
        ['13love', '爱', '[爱]'], 
        ['14love-over', '心碎', '[心碎]'], 
        ['15rose', '献花', '[献花]'], 
        ['16rose-dead', '凋谢', '[凋谢]'], 
        ['17in-love', '色', '[色]'], 
        ['18kiss', '亲亲', '[亲亲]'], 
        ['19poop', '屎' , '[屎]'], 
        ['20victory', '胜利', '[胜利]'], 
        ['21desire', '仰慕', '[仰慕]'], 
        ['22moneymouth', '贪财', '[贪财]'], 
        ['23quiet', '无语', '[无语]'], 
        ['24secret', '秘密', '[秘密]'], 
        ['25shut-mouth', '闭嘴', '[闭嘴]'], 
        ['26shame', '害羞', '[害羞]'], 
        ['27sick', '讨厌', '[讨厌]'], 
        ['28dazed', '晕', '[晕]'], 
        ['29question', '疑问', '[疑问]'], 
        ['30sleepy', '困', '[困]'], 
        ['31arrogant', '傲慢', '[傲慢]'], 
        ['32curse', '诅咒', '[诅咒]'], 
        ['33crying', '哭', '[哭]'], 
        ['34disapointed', '失望', '[失望]'], 
        ['35embarrassed', '尴尬', '[尴尬]'], 
        ['36dont-know', '不知道', '[不知道]'], 
        ['37handshake', '握手', '[握手]'], 
        ['38struggle', '挣扎', '[挣扎]'], 
        ['39thinking', '思考', '[思考]'], 
        ['40tongue', '吐舌', '[吐舌]']
      ]
    }
    this.emotionMapText = function(){
      var array = []
      options.underscore.map(that.getEmotions(),function(emotion){
        array.push([emotion[2],emotion[0],emotion[1]])
      })
      return array
    }
    this.replaceEmotions = function(str){
      return str.replace(/\[.+?\]/g,function(all){
        options.underscore.each(that.emotionMapText(),function(emotion){
          if(emotion[0] == all){
            all = "<img src='../images/emotions/" + 
                   emotion[1] + ".png' width=22 height=20 title='" + 
                   emotion[2] + "'/>";
          }
        })
        return all
      })

    }

  }
  if(typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    var underscore = require("underscore")
    module.exports = function(){
      return new helper({underscore:underscore})
    }
  }else{
    if(typeof PEM === "undefined") PEM = {}
    PEM.helper = new helper({underscore:_})
  }

}())