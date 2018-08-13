var express = require('express');
var router = express.Router();
var files = require('../public/javascripts/fileRead');
var path = require('path')
var fs = require('fs')
var boot = require('../boot')
var sim = require('../commands/sim')
var backfill = require('../commands/backfill')
var products = require('../extensions/exchanges/binance/products')
var strategyData = require('../public/javascripts/strategyData')

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express', products : products, strategyData : strategyData })
});

router.post('/', function (req, res) {
    console.log('index post')
    boot(function (err, zenbot) {
        return new Promise(resolve => {
            sim(req.body,zenbot.conf).then((a) => {
                resolve(a)
            }).catch((err) => {
                console.error(err)
            })
        })
    }).then((a)=> {
        console.log(a)
        res.redirect(a)
    }).catch((err) => {
        console.error(err)
    })
});

router.get('/no-selector', function (req, res, next) {
    res.render('no-selector' );
});

router.get('/backfill-completed', function (req, res, next) {
    res.render('backfill-completed' );
});

router.get('/sim_*', function (req, res) {
    res.sendFile('/home/osboxes/code/thesis/ThesisApp/app/simulations/' + 'sim_' + req.params[0] + '.html');
});

module.exports = router;

