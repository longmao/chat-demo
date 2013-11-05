(function() {
    window.$win = $(window)
    window.$body = $("body")
    var from, socket, to,templ_chat_timeline,templ_chat_profile,
        $chatForm = $("#chatForm"),
        $users_list = $("#users_list"),
        $chat_msg_container = $("#chat-msg-container")
    socket = io.connect();
    from = $.cookie("user");
    to = "";
    templ_chat_profile = doT.template('' +
      '<img width="50" height="50" class="img-rounded" src="images/default-50.gif" alt="placeholder+image" style="">' +
      '<div class="cont" >' +
        '<div class="ops">' +
          '<a href="#" class="skanHistory" data-user-to="{{=it.screen_name}}"><i class="fa fa-clock-o" style="margin-right: 2px;"></i>聊天记录</a>' +
        '</div>' +
        '<p class="screen_name" ng-model="screen_name_to">{{=it.screen_name}}</p>' + 
        '<p class="desc">{{=it.description}}</p>' +
      '</div>'
    );
    templ_chat_timeline = doT.template('' +
      '{{? !it.sysInfo }}' +
        '<li class="{{=it.self ? "self" : ""}}">' +
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
            '<li data-user="' + user.name + '" class="online"><a href="javascript:;"><i class="fa fa-circle-o"></i><img width="30" height="30" class="img-rounded" src="images/default-30.gif" alt="placeholder+image"> ' + user.name + ' <span class="badge pull-right" style="display:none"></span></a></li>');
        })
        $ul.find("li:first").addClass("first")
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
      renderProfile:function(data){
        var $profile_to = $("#profile_to")
        $profile_to.html(templ_chat_profile({
          screen_name:data.to,
          description:"description here"
        }))
      },
      appendChatMsg:function(data){
        var id = data.from === from ? to : data.from
        var $chat_msg_panel = $(".chat-msg-panel");
        var $contents = $chat_msg_panel.find("#contents_" + id);

        $contents.append(templ_chat_timeline({
          sysInfo:data.sysInfo || false,
          self:data.from === from,
          screen_name: data.from,
          date:PEM.helper.now(),
          msg:data.msg
        }));
        PEM.util.scrollTop($chat_msg_panel,$contents.height())
      },
      skanHistory: function(params){
        var $chat_msg_history = $(".chat-msg-history");
        var $ul = $("<ul></ul>")
        var $div
        $.getJSON("/history/"+params.to,function(datas){
          _.forEach(datas,function(data){
            $ul.append(
                templ_chat_timeline({
                  sysInfo:data.sysInfo || false,
                  self:data.from === from,
                  screen_name: data.from,
                  date:data.date,
                  msg:data.msg
                })
              )
          })

          $("ul.users_list").find(".active").removeClass("active")

          $div = $ul
            .before(
              $('<p class="header">以下是你与<span class="to"></span>的聊天记录，<a href="javascript:;" class="">返回聊天</a></p>')
                .find(".to").text(params.to).end()
                .find("a").click(function(e){
                  e.preventDefault()
                  $("ul.users_list").find("li[data-user='" + params.to + "']").click()
              }).end()
            )

          $chat_msg_history
            .html($div)
            .show()
            .siblings(".chat-msg-content")
            .hide()

        })
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
          var $chat_msg_content = $(".chat-msg-content")
          var $chat_msg_panel = $(".chat-msg-panel");
          //设置被双击的用户为说话对象
          to = $this.attr('data-user');
          $contents = $("#contents_"+to);
          $this.addClass("active").siblings("li").removeClass("active")
          $this.find(".badge").text("").hide();
          PEM.chat.showSayTo();
          PEM.chat.renderProfile({to:to});
          $chat_msg_container.show()
            .find(".chat-msg-content").show()
            .siblings().hide()
            .end();
          $contents.show().siblings("ul.contents").hide()
          $("form#chatForm").find("input[type='text']").val("").focus()
          PEM.util.scrollTop($chat_msg_panel,$contents.height())
        })

        $chat_msg_container.on("click",".skanHistory",function(e){
          e.preventDefault();
          var $that = $(this),
              data_user_from = from,
              data_user_to = $that.attr("data-user-to")
          PEM.chat.skanHistory({
            to:data_user_to,
            from:data_user_from
          })
        })

        //发话
        $chatForm.submit(function(e) {
          e.preventDefault();
          var $chatForm = $(this),
              $chatForm_text = $chatForm.find("input[type='text']");
          //获取要发送的信息
          var msg = $chatForm_text.val();
          if ($.trim(msg) === "") return $chatForm_text.focus();
          //把发送的信息先添加到自己的浏览器 DOM 中
          PEM.chat.appendChatMsg({
            from: from,
            msg: PEM.helper.replaceEmotions(msg),
            to: to
          })

          //发送发话信息
          socket.emit('say', {from: from, to: to, msg: msg});
          //清空输入框并获得焦点
          $chatForm_text.val("").focus();
        });

        var $emotions = $("<ul class='row emotions_list'></ul>"),$div = $("<div></div>")
        _.forEach(PEM.helper.getEmotions(),function(emotion){
          $emotions.append(""
            + "<li>"
              + "<a href='javascript:;' data-emotion='" + emotion[2] + "'>"
                + "<img width=22 height=20 src='/images/emotions/" + emotion[0] + ".png' title='" + emotion[1] + "'/>"
              + "</a>"
            + "</li>")
        })

        var $input_text = $chatForm.find("input[type='text']"),timeout;
        $input_text.on("keyup mousedown mousemove mouseup",function(e){
          var textrange = $(this).textrange();
          $(this).attr("data_textrange",textrange.start)
        })


        $input_text.on("keydown",function(e){
          clearTimeout(timeout)
          socket.emit("writing", {from: from,to: to})
        })

        $input_text.on("keyup",function(e){
          timeout = setTimeout(function(){
                      socket.emit("writed", {from: from,to: to})
                    },1000)
        })

        $chatForm.on("click",".emotions_list li",function(){
          var $a = $(this).find("a")
          var $input_text = $chatForm.find("input[type='text']");
          $input_text.textrange('setcursor', $input_text.attr("data_textrange"));
          //return
          PEM.util.insertAtCursor($input_text[0],$a.attr("data-emotion"))
          //console.log($("input#chatInputInfo").attr("data_textrange"))
          $input_text.attr("data_textrange",parseInt($("input#chatInputInfo").attr("data_textrange")) + 4)
          $chatForm
            .find(".emotions_popover").trigger("click")
        })
        $div.append($emotions)
        $chatForm
          .find(".emotions_popover")
          .popover({
            html: true,
            placement: "top",
            content: $div.html()
          })
          .on('show.bs.popover',function(e){
            $(this).addClass("hovered")
          })
          .on('hide.bs.popover',function(e){
            $(this).removeClass("hovered")
          })

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
              msg: '<i class="fa fa-bullhorn" style="margin-right: 4px;"></i>系统消息：用户' + data.user + '上线了',
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
          if(data.user === to) {
            PEM.chat.appendChatMsg({
              sysInfo: true,
              from: from,
              msg: '<i class="fa fa-bullhorn" style="margin-right: 4px;"></i>系统消息：用户' + data.user + '下线了',
              to: to
            })
          }
          PEM.chat.flushUsers(data.users);
        });

        socket.on("writing",function(data){
          if(data.from === to ){
            $("#writing").show()
          }
        })

        socket.on("writed",function(data){
          if(data.from === to){
            $("#writing").hide()
          }
        })
      },
      init:function(){
        PEM.util.init();
        PEM.chat.bindEvent();
        PEM.chat.bindSocket();
      }
    }

    PEM.chat.init();
}).call(this);


