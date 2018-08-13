var express = require('express');
var router = express.Router();
var products = require('../extensions/exchanges/binance/products')
var backfill = require('../commands/backfill')
var boot = require('../boot')

router.get('/', function (req, res, next) {
    res.render('backfill', {products : products});
});

router.post('/', function (req, res,next) {
    console.log("backfill post")
    boot(function (err, zenbot) {
        return new Promise(resolve => {
            backfill(req.body.selector, zenbot.conf).then((a) => {
                console.log(a)
                res.redirect('/')
            }).catch((err) => {
                console.error(err)
            })
        })
    });
});

module.exports = router;
