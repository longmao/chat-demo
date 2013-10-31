/*
 * 
 */
var helper = require('../app/scripts/PEM.helper.js')();
var _ = require("underscore")

module.exports = function(app,chatModel) {
  app.get('/history/:id', function(req, res){
    var to = req.params.id
    var from = req.cookies && req.cookies.user
    var query = chatModel.find({
                  from : {$in: [ from, to]},
                  to : {$in: [ from, to]}
                })
    query.limit(8)
    query.exec(function(err,items){
        var data = []
        _.forEach(items,function(item){
          data.push({
            from:item.from,
            to:item.to,
            date:helper.now(item.date),
            msg:item.msg
          })
        })
        res.send(data)
    })

  })
}
