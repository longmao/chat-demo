
/*
 * GET home page.
 */

module.exports = function(app) {
  app.get('/', function(req, res){
    res.render('index.html', { title: 'PEM心理自助平台' });
  })
}
