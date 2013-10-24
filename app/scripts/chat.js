  $(document).ready(function() {
    var from, socket, to, $users_list = $("#users_list"),PEM = {};
    socket = io.connect();
    from = $.cookie("user");
    to = "all";
    templ = doT.template('' +
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
      '</li>');

    PEM = {
      flushUsers:function(users){
        //遍历生成用户在线列表
        var $ul = $("<ul></ul>")
        for (var i in users) {
          $ul.append(
            '<li data-user="' + users[i].name + '" ><a href="javascript:;"><img width="30" height="30" class="img-rounded" src="images/default-30.gif" alt="placeholder+image"> ' + users[i].name + ' <span class="badge" style="display:none"></span></a></li>');
        }
        $users_list.html($ul.html())
      },
      initChatPanel:function(users){
        var $div = $("<div></div>")
        for (var i in users) {
          $div.append("<ul class='contents' style='display:none' id='contents_" + users[i].name + "'></ul>")
        }
        $div.append("<ul class='contents' style='' id='contents_all'> </ul>");
        $(".chat-msg-panel").html($div.html())
      },
      showSayTo:function(){
        $("#from").html(from);
        $("#to").html(to);
        $("#from").parent().css("visibility","visible")
      },
      appendChatMsg:function(data){
        var id = data.from === from ? to : data.from
        var $contents = $("#contents_" + id);
        var $chat_msg_panel = $(".chat-msg-panel")
        $contents.append(templ({
          self:data.from === from,
          screen_name: data.from,
          date:PEM.helper.now(),
          msg:data.msg
        }));
        $chat_msg_panel.scrollTop($contents.height())
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
          //设置被双击的用户为说话对象
          to = $this.attr('data-user');
          $this.addClass("active").siblings("li").removeClass("active")
          $this.find(".badge").text("").hide();
          PEM.showSayTo();
          $("#contents_"+to).show().siblings("ul.contents").hide()
          $("form#chatForm").find("input[type='text']").focus()
        })


        //发话
        $("form#chatForm").submit(function(e) {
          e.preventDefault();
          var $chatForm = $(this),
              $chatForm_text = $chatForm.find("input[type='text']");
          //获取要发送的信息
          var msg = $chatForm_text.val();
          if (msg == "") return $chatForm_text.focus();
          //把发送的信息先添加到自己的浏览器 DOM 中
          PEM.appendChatMsg({
            from: from,
            msg: msg,
            to: to
          })

          //发送发话信息
          socket.emit('say', {from: from, to: to, msg: msg});
          //清空输入框并获得焦点
          $chatForm_text.val("").focus();
        });
      },
      bindSocket:function(){
        socket.emit("online", {
          user: from
        });
        
        socket.on("online",function(data){
          PEM.flushUsers(data.users);
          PEM.showSayTo();
          PEM.initChatPanel(data.users)
        });

        socket.on('say', function (data) {
          PEM.appendChatMsg({
            from: data.from,
            msg: data.msg,
            to:data.to
          })
          PEM.updateUnread(data)
        });

        socket.on('offline', function (data) {
          PEM.flushUsers(data.users);
        });
      },
      init:function(){
        PEM.bindEvent();
        PEM.bindSocket();
      },
      helper:{
        now:function(){
          var date = new Date();
          var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
          return time;
        }
      }
    }

    PEM.init();
  });

