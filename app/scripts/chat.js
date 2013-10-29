(function() {
    var from, socket, to,
        $win = $(window),
        $body = $("body"),
        $users_list = $("#users_list"),
        $chat_msg_container = $("#chat-msg-container")
    socket = io.connect();
    from = $.cookie("user");
    to = "";
    templ = doT.template('' +
      '{{? !it.sysInfo }}' +
        '<li class="{{=it.self ? "self" : ""}}">' +
          '<div class="avatar">' +
            '<img width="50" height="50" class="img-rounded" src="images/default-50.gif" alt="placeholder+image">' +
          '</div>' +
          '<div class="cont">' +
            '<h3>' +
              '<span class="screen_name">{{=it.screen_name}}</span>' +
              '<span class="time">{{=it.date}}</span>' +
            '</h3>' +
            '<p>{{=it.msg}}</p>' +
          '</div>' +
        '</li>' +
      '{{??}}' +
        '<li class="sysInfo">' +
          '<p class="cont">{{=it.msg}} <span class="time">{{=it.date}}</span></p>' +
        '</li>' +
      '{{?}}'
        );

    PEM.chat = {
      flushUsers:function(users){
        //遍历生成用户在线列表
        users = _.filter(users,function(user){ return user.name !== from })
        var $ul = $("<ul></ul>")
        _.forEach(users,function(user){
          $ul.append(
            '<li data-user="' + user.name + '" class="online"><a href="javascript:;"><img width="30" height="30" class="img-rounded" src="images/default-30.gif" alt="placeholder+image"> ' + user.name + ' <span class="badge pull-right" style="display:none"></span></a></li>');
        })
        $ul.find("li:last").addClass("last")
        //如果当前用户重新上线，设置用户为选中状态
        if(to) $ul.find("li[data-user='" + to + "']").addClass("active")
        $users_list.html($ul.html())
      },
      initChatPanel:function(users){
        var $div = $("<div></div>")
        for (var i in users) {
          $div.append("<ul class='contents' style='display:none' id='contents_" + users[i].name + "'></ul>")
        }
        //$div.append("<ul class='contents' style='' id='contents_all'> </ul>");
        $(".chat-msg-panel").html($div.html())
      },
      showSayTo:function(){
        $("#from").html(from);
        $("#to").html(to);
        $("#from").parent().css("visibility","visible")
      },
      appendChatMsg:function(data){
        var id = data.from === from ? to : data.from
        var $chat_msg_panel = $(".chat-msg-panel");
        var $contents = $chat_msg_panel.find("#contents_" + id);

        $contents.append(templ({
          sysInfo:data.sysInfo || false,
          self:data.from === from,
          screen_name: data.from,
          date:PEM.helper.now(),
          msg:data.msg
        }));
        PEM.util.scrollTop($chat_msg_panel,$contents.height())
      },
      updateUnread:function(data){
        var $list = $users_list.find("li[data-user='" + data.from + "']");
        if($list.hasClass("active")) return
        var $badge = $list.find(".badge");
        var unread_num = $badge.text() || 0;
        $badge.text(++unread_num).show()
      },
      bindEvent:function(){
        $users_list.on("click","li",function(e) {
          e.preventDefault();
          var $this = $(this);
          var $contents;
          var $chat_msg_panel = $(".chat-msg-panel");
          //设置被双击的用户为说话对象
          to = $this.attr('data-user');
          $contents = $("#contents_"+to);
          $this.addClass("active").siblings("li").removeClass("active")
          $this.find(".badge").text("").hide();
          PEM.chat.showSayTo();
          $chat_msg_container.show()
          $contents.show().siblings("ul.contents").hide()
          $("form#chatForm").find("input[type='text']").focus()
          PEM.util.scrollTop($chat_msg_panel,$contents.height())
        })


        //发话
        $("form#chatForm").submit(function(e) {
          e.preventDefault();
          var $chatForm = $(this),
              $chatForm_text = $chatForm.find("input[type='text']");
          //获取要发送的信息
          var msg = $chatForm_text.val();
          if ($.trim(msg) === "") return $chatForm_text.focus();
          //把发送的信息先添加到自己的浏览器 DOM 中
          PEM.chat.appendChatMsg({
            from: from,
            msg: msg,
            to: to
          })

          //发送发话信息
          socket.emit('say', {from: from, to: to, msg: msg});
          //清空输入框并获得焦点
          $chatForm_text.val("").focus();
        });

        $(window).bind('beforeunload',function(){
          //return '刷新页面将会改变你的在线状态，是否要继续？';
        });
      },
      bindSocket:function(){
        socket.emit("online", {
          user: from
        });
        
        var once = true;
        socket.on("online",function(data){
          PEM.chat.flushUsers(data.users);

          if(data.user === to) {
            PEM.chat.appendChatMsg({
              sysInfo: true,
              from: from,
              msg: '系统消息：用户' + data.user + '上线了',
              to: to
            })
          }


          if(once) {
            //
            PEM.chat.initChatPanel(data.users)
            once = false
          }else{
            //增加新在线用户chat-msg-panel
            var $chat_msg_panel = $(".chat-msg-panel");
            $chat_msg_panel
              .findOrAppend(
                "#contents_" + data.user,
                "<ul class='contents' style='display:none' id='contents_" + data.user + "'></ul>",
                function(){
                }
              )
          }


        });

        socket.on('say', function (data) {
          PEM.chat.appendChatMsg({
            from: data.from,
            msg: data.msg,
            to:data.to
          })
          PEM.chat.updateUnread(data)
        });

        socket.on('offline', function (data) {
          //
          console.log("offline")
          if(data.user === to) {
            PEM.chat.appendChatMsg({
              sysInfo: true,
              from: from,
              msg: '系统消息：用户' + data.user + '下线了',
              to: to
            })
          }
          PEM.chat.flushUsers(data.users);
        });
      },
      init:function(){
        PEM.util.init();
        PEM.chat.bindEvent();
        PEM.chat.bindSocket();
      }
    }

    PEM.chat.init();
}).call(this);


