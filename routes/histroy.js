/*
 * 
 */
var helper = require('../app/scripts/PEM.helper.js')();

module.exports = function(app,chatModel) {
  app.get('/histroy/:id', function(req, res){
    var to = req.params.id
    var from = req.cookies && req.cookies.user

    chatModel.find({
      from : {$in: [ from, to]},
      to : {$in: [ from, to]}
    },function(err,items){
        items.forEach(function(item){
          var format_date = item.date
          console.log(helper.now(format_date))
        });
        res.send(items)
    })

  })
}
