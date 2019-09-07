var tb = require('timebucket')
    , minimist = require('minimist')
    , n = require('numbro')
    , fs = require('fs')
    , path = require('path')
    , moment = require('moment')
    , colors = require('colors')
    , objectifySelector = require('../lib/objectify-selector')
    , engineFactory = require('../lib/engine')
    , output = require('../lib/output')
    , jsonexport = require('jsonexport')
    , collectionService = require('../lib/services/collection-service')
    , _ = require('lodash')


module.exports = function (opts, conf) {
    return new Promise(resolve => {
        conf.strategy = opts.strategy
        conf.selector = opts.selector
        conf.output.api.on = true
        var cmd = { strategy: opts.strategy,
            sell_stop_pct: 0,
            buy_stop_pct: 0,
            profit_stop_enable_pct: 0,
            profit_stop_pct: 1,
            max_slippage_pct: 5,
            buy_pct: 99,
            sell_pct: 99,
            order_adjust_time: 5000,
            max_sell_loss_pct: 25,
            max_buy_loss_pct: 25,
            order_poll_time: 5000,
            markdown_buy_pct: 0,
            markup_sell_pct: 0,
            order_type: 'taker',
            days: 7,
            post_only: true,
            currency_capital: 1,
            asset_capital: 0,
            rsi_periods: 14 }
            // console.log(opts)
        var selector = opts.selector
        var handler
        var s = {options: opts}
        var so = s.options
        delete so._

        if (cmd.conf) {
            var overrides = require(path.resolve(process.cwd(), cmd.conf))
            Object.keys(overrides).forEach(function (k) {
                so[k] = overrides[k]
            })
        }
        Object.keys(conf).forEach(function (k) {
            if (!_.isUndefined(cmd[k])) {
                so[k] = cmd[k]
            }
        })
        var tradesCollection = collectionService(conf).getTrades()
        var simResults = collectionService(conf).getSimResults()
        var eventBus = conf.eventBus

        if (so.start) {
            so.start = moment(so.start, 'YYYYMMDDhhmm').valueOf()
            if (so.days && !so.end) {
                so.end = tb(so.start).resize('1d').add(so.days).toMilliseconds()
            }
        }
        if (so.end) {
            so.end = moment(so.end, 'YYYYMMDDhhmm').valueOf()
            if (so.days && !so.start) {
                so.start = tb(so.end).resize('1d').subtract(so.days).toMilliseconds()
            }
        }
        if (!so.start && so.days) {
            var d = tb('1d')
            so.start = d.subtract(so.days).toMilliseconds()
        }

        so.days = moment(so.end).diff(moment(so.start), 'days')
        // so.stats = !!cmd.enable_stats
        // so.show_options = !cmd.disable_options
        // so.verbose = !!cmd.verbose
        so.selector = objectifySelector(selector || conf.selector)
        so.mode = 'sim'
        // console.log(conf)
        var engine = engineFactory(s, conf)
        if (!so.min_periods) so.min_periods = 1
        var cursor, reversing, reverse_point
        var query_start = so.start ? tb(so.start).resize(so.period_length).subtract(so.min_periods + 2).toMilliseconds() : null

        var getNext;
        (getNext = function (){
            var opts = {
                query: {
                    selector: so.selector.normalized
                },
                sort: {time: 1},
                limit: 1000
            }
            if (so.end) {
                opts.query.time = {$lte: so.end}
            }
            if (cursor) {
                if (reversing) {
                    opts.query.time = {}
                    opts.query.time['$lt'] = cursor
                    if (query_start) {
                        opts.query.time['$gte'] = query_start
                    }
                    opts.sort = {time: -1}
                }
                else {
                    if (!opts.query.time) opts.query.time = {}
                    opts.query.time['$gt'] = cursor
                }
            }
            else if (query_start) {
                if (!opts.query.time) opts.query.time = {}
                opts.query.time['$gte'] = query_start
            }
            var collectionCursor = tradesCollection.find(opts.query).sort(opts.sort).stream()
            var numTrades = 0
            var lastTrade

            collectionCursor.on('data', function (trade) {
                lastTrade = trade
                numTrades++
                if (so.symmetrical && reversing) {
                    trade.orig_time = trade.time
                    trade.time = reverse_point + (reverse_point - trade.time)
                }
                eventBus.emit('trade', trade)
            })

            collectionCursor.on('end', function () {
                if (numTrades === 0) {
                    if (so.symmetrical && !reversing) {
                        reversing = true
                        reverse_point = cursor
                        return getNext()
                    }
                    engine.exit(exitSim)
                    return
                } else {
                    if (reversing) {
                        cursor = lastTrade.orig_time
                    }
                    else {
                        cursor = lastTrade.time
                    }
                }
                setImmediate(getNext)
            })
        })();
        function exitSim() {
            console.log()
            if (!s.period) {
                console.error('no trades found! try running `zenbot backfill ' + so.selector.normalized + '` first')
                resolve('no-selector')
                // process.exit(1)
                return;
            }
            var option_keys = Object.keys(so)
            var output_lines = []
            option_keys.sort(function (a, b) {
                if (a < b) return -1
                return 1
            })
            var options = {}
            option_keys.forEach(function (k) {
                options[k] = so[k]
            })

            let options_output = options
            options_output.simresults = {}

            if (s.my_trades.length) {
                s.my_trades.push({
                    price: s.period.close,
                    size: s.balance.asset,
                    type: 'sell',
                    time: s.period.time
                })
            }
            s.balance.currency = n(s.net_currency).add(n(s.period.close).multiply(s.balance.asset)).format('0.00000000')
            console.log("s.balance.currency", s.balance.currency)
            console.log("s.net.currency", s.net_currency)
            s.balance.asset = 0
            s.lookback.unshift(s.period)
            var profit = s.start_capital ? n(s.balance.currency).subtract(s.start_capital).divide(s.start_capital) : n(0)
            output_lines.push('end balance: ' + n(s.balance.currency).format('0.00000000') + ' (' + profit.format('0.00%') + ')')
            //console.log('start_capital', s.start_capital)
            //console.log('start_price', n(s.start_price).format('0.00000000'))
            //console.log('close', n(s.period.close).format('0.00000000'))
            var buy_hold = s.start_price ? n(s.period.close).multiply(n(s.start_capital).divide(s.start_price)) : n(s.balance.currency)
            //console.log('buy hold', buy_hold.format('0.00000000'))
            var buy_hold_profit = s.start_capital ? n(buy_hold).subtract(s.start_capital).divide(s.start_capital) : n(0)
            output_lines.push('buy hold: ' + buy_hold.format('0.00000000') + ' (' + n(buy_hold_profit).format('0.00%') + ')')
            output_lines.push('vs. buy hold: ' + n(s.balance.currency).subtract(buy_hold).divide(buy_hold).format('0.00%'))
            output_lines.push(s.my_trades.length + ' trades over ' + s.day_count + ' days (avg ' + n(s.my_trades.length / s.day_count).format('0.00') + ' trades/day)')
            var last_buy
            var losses = 0, sells = 0
            s.my_trades.forEach(function (trade) {
                if (trade.type === 'buy') {
                    last_buy = trade.price
                }
                else {
                    if (last_buy && trade.price < last_buy) {
                        losses++
                    }
                    sells++
                }
            })
            if (s.my_trades.length) {
                output_lines.push('win/loss: ' + (sells - losses) + '/' + losses)
                output_lines.push('error rate: ' + (sells ? n(losses).divide(sells).format('0.00%') : '0.00%'))
            }
            options_output.simresults.start_capital = s.start_capital
            options_output.simresults.last_buy_price = s.last_buy_price
            options_output.simresults.last_assest_value = s.period.close
            options_output.net_currency = s.net_currency
            options_output.simresults.asset_capital = s.asset_capital
            options_output.simresults.currency = n(s.balance.currency).value()
            options_output.simresults.profit = profit.value()
            options_output.simresults.buy_hold = buy_hold.value()
            options_output.simresults.buy_hold_profit = buy_hold_profit.value()
            options_output.simresults.total_trades = s.my_trades.length
            options_output.simresults.length_days = s.day_count
            options_output.simresults.total_sells = sells
            options_output.simresults.total_losses = losses
            options_output.simresults.vs_buy_hold = n(s.balance.currency).subtract(buy_hold).divide(buy_hold).value() * 100.00

            let options_json = JSON.stringify(options_output, null, 2)
            if (so.show_options) {
                output_lines.push(options_json)
            }

            // output_lines.forEach(function (line) {
            //   console.log(line)
            // })

            if (so.backtester_generation >= 0) {
                var file_name = so.strategy.replace('_','')+'_'+ so.selector.normalized.replace('_','').toLowerCase()+'_'+so.backtester_generation
                fs.writeFileSync(path.resolve(__dirname, '..', 'simulations','sim_'+file_name+'.json'),options_json, {encoding: 'utf8'})
                var trades_json = JSON.stringify(s.my_trades, null, 2)
                fs.writeFileSync(path.resolve(__dirname, '..', 'simulations','sim_trades_'+file_name+'.json'),trades_json, {encoding: 'utf8'})
                jsonexport(s.my_trades,function(err, csv){
                    if(err) return console.log(err)
                    fs.writeFileSync(path.resolve(__dirname, '..', 'simulations','sim_trades_'+file_name+'.csv'),csv, {encoding: 'utf8'})
                })            }

            if (so.filename !== 'none') {
                var html_output = output_lines.map(function (line) {
                    return colors.stripColors(line)
                }).join('\n')
                var data = s.lookback.slice(0, s.lookback.length - so.min_periods).map(function (period) {
                    var data = {}
                    var keys = Object.keys(period)
                    for (var i = 0; i < keys.length; i++) {
                        data[keys[i]] = period[keys[i]]
                    }
                    return data
                })
                var code = 'var data = ' + JSON.stringify(data) + ';\n'
                code += 'var trades = ' + JSON.stringify(s.my_trades) + ';\n'
                var tpl = fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'sim_result.html.tpl'), {encoding: 'utf8'})
                var testdata = 'var testdata = ' + output_lines + ';\n'

                // console.log(output_lines);
                // console.log(testdata);

                var test = '<ul class="list-group">\n' +
                    '    <li class="list-group-item">' + output_lines[0] +'</li>\n' +
                    '    <li class="list-group-item">' + output_lines[1] +'</li>\n' +
                    '    <li class="list-group-item">' + output_lines[2] +'</li>\n' +
                    '    <li class="list-group-item">' + output_lines[3] +'</li>\n' +
                    '    <li class="list-group-item">' + output_lines[4] +'</li>\n' +
                    '    <li class="list-group-item">' + output_lines[5] +'</li>\n' +
                    '  </ul>'

                test += '<ul class="list-group">'
                s.my_trades.forEach(function (line,index) {
                    test += '<li class="list-group-item">' + 'Trade: ' + parseInt(index+1) +
                        '  Type: ' + line.type +
                        '  Fee: ' +  line.fee +
                        '  Size: ' + line.size +'</li>\n'
                })
                test += '</ul>'

                var out = tpl
                    .replace('{{test}}', test)
                    .replace('{{code}}', code)
                    .replace('{{trend_ema_period}}', so.trend_ema || 36)
                    .replace('{{output}}', html_output)
                    .replace(/\{\{symbol\}\}/g, so.selector.normalized)
                var out_target = so.filename || 'simulations/sim_result_' + so.selector.normalized + '_' + new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/-/g, '').replace(/:/g, '').replace(/20/, '') + '_UTC.html'
                fs.writeFileSync(out_target, out)
                console.log('wrote', out_target)
                handler = out_target.replace('simulations/', '').replace('.html', '').toString()
            }

            simResults.save(options_output)
                .then(() => {
                    resolve(handler)
                })
                .catch((err) => {
                    console.error(err)
                })

        }
    })
}