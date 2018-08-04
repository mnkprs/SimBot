var express = require('express');
var router = express.Router();
var files = require('../public/javascripts/fileRead');
var path = require('path')
var fs = require('fs')
var boot = require('../boot')
var sim = require('../commands/sim')
var products = require('../extensions/exchanges/binance/products')
// var test = require('../public/javascripts/test')

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express', products : products })

});

router.post('/', function (req, res, next) {
    var values = []
    Object.keys(req.body).forEach(function (k) {
            values = req.body[k]
    })
    console.log("VALUES", req.body)
    boot(function (err, zenbot) {
        return new Promise(resolve => {
            sim(values,zenbot.conf).then((a) => {
                resolve(a)
            }).catch((err) => {
                console.error(err)
            })
        })
    }).then((a)=> {
        console.log(a)
        res.redirect('/'+ a)
    }).catch((err) => {
        console.error(err)
    })
});

router.get('/test', function (req, res, next) {
    res.render('test', {files: files});
});

router.get('/:uniqueHtmlFileName', function (req, res) {
    res.sendFile('/home/osboxes/code/thesis/ThesisApp/app/simulations/' + req.params.uniqueHtmlFileName + '.html');
});

module.exports = router;
