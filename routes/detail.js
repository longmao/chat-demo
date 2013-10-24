
/*
 * GET item detail page.
 */

module.exports = function(app) {
  app.get('/item', function(req, res){
    var query = req.query,
        item_id = query && query.id;
    //mock json data
    var detailData = {
      title:"婚姻中如何维持家庭的和谐",
      favorite:true,
      description:"案例",
      analysis:"专家分析",
      solution:"解决方法"
    }

    //
    res.render('detail.html', { 
      title: detailData.title + '-PEM心理自助平台',
      favorite.detailData.favorite,
      helpCount:detailData.helpCount,
      description:detailData.description,
      analysis:detailData.analysis,
      solution:detailData.solution

    });
  })
}
