
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
var app = express();
var helper = require('./app/scripts/PEM.helper.js')();


var chatModel = require("./model/chat")


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'app')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//load route
require('./routes/histroy')(app,chatModel);



var users = {};//存储在线用户列表的对象

app.get('/', function (req, res) {
  if (req.cookies.user == null) {
    res.redirect('/signin');
  } else {
    res.render('newindex.html', { 
      title: "聊天系统",
      user: req.cookies.user 
    });
    //res.sendfile('app/views/newindex.html');
  }
});
app.get('/signin', function (req, res) {
  res.sendfile('app/views/signin.html');
});
app.post('/signin', function (req, res) {
  if (!req.body.name) return res.redirect("/signin")
  if (users[req.body.name]) {
    //存在，则不允许登陆
    res.redirect('/signin');
  } else {
    //不存在，把用户名存入 cookie 并跳转到主页
    res.cookie("user", req.body.name, {maxAge: 1000*60*60*24*30});
    res.redirect('/');
  }
});

var server = http.createServer(app);
var i = 1;
var io = require('socket.io').listen(server);
//io.set('transports', ['xhr-polling']);
io.sockets.on('connection', function (socket) {

  //有人上线
  socket.on('online', function (data) {
    //将上线的用户名存储为 socket 对象的属性，以区分每个 socket 对象，方便后面使用
    socket.name = data.user;
    //users 对象中不存在该用户名则插入该用户名
    if (!users[data.user]) {
      //users[data.user] = data.user
      users[data.user] = {name:data.user,online:true,id:i++};
    }
    //向所有用户广播该用户上线信息
    io.sockets.emit('online', {users: users, user: data.user});
  });

  //有人发话
  socket.on('say', function (data) {
    if (data.to == 'all') {
      //向其他所有用户广播该用户发话信息
      //socket.broadcast.emit('say', data);
    } else {
      //向特定用户发送该用户发话信息
      //clients 为存储所有连接对象的数组
      var clients = io.sockets.clients();
      //console.log(33)
      //console.log(clients)
      //遍历找到该用户
      clients.forEach(function (client) {
        if (client.name == data.to) {
          //触发该用户客户端的 say 事件
          data.msg = helper.replaceEmotions(data.msg)
          client.emit('say', data);
        }
      });
      //触发该用户客户端的 say 事件
      //console.log("send to user: " + data.to)
      //console.log(io.sockets.socket(data.to))
      //io.sockets.socket(data.to).emit('say', data);

      //save  chat model to MongoDB
      var chat = new chatModel({
        from : data.from,
        to : data.to,
        msg : helper.replaceEmotions(data.msg)
      })

      chat.save(function(err,data){
        if (err) {
          return err;
        }
        else {
          console.log("chat saved!");
        }
      })



    }
  });

  //有人下线
  socket.on('disconnect', function() {
    //若 users 对象中保存了该用户名
    if (users[socket.name]) {
      //从 users 对象中删除该用户名

      delete users[socket.name];
      //向其他所有用户广播该用户下线信息
      socket.broadcast.emit('offline', {users: users, user: socket.name});
    }
  });

  //提示输入状态
  socket.on("writing",function(data){
    var clients = io.sockets.clients();
    //遍历找到该用户
    clients.forEach(function (client) {
      if (client.name == data.to) {
        client.emit('writing', data);
      }
    });
  })

  //提示输入状态
  socket.on("writed",function(data){
    var clients = io.sockets.clients();
    //遍历找到该用户
    clients.forEach(function (client) {
      if (client.name == data.to) {
        client.emit('writed', data);
      }
    });
  })

});

module.exports = app;

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port') 
  	+ " and run on " + app.get('env') + " environments");
});
