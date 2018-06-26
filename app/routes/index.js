var express = require('express');
var router = express.Router();
var files = require('../public/javascripts/fileRead');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', function(req, res, next) {
    res.render('test', { files : files });
});

router.get('/:uniqueHtmlFileName', function(req , res){
    res.sendfile('/home/osboxes/code/thesis/ThesisApp/app/simulations/' + req.params.uniqueHtmlFileName);
});

module.exports = router;
