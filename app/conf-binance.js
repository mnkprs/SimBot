var c = module.exports = {}

// mongo configuration
c.mongo = {}
c.mongo.db = 'zenbot4'

// Must provide EITHER c.mongo.connectionString OR c.mongo.host,port,username,password
// c.mongo.connectionString = 'mongodb://u:p@host/db?params'
// The following is not needed when c.mongo.connectionString is provided:
c.mongo.host = process.env.MONGODB_PORT_27017_TCP_ADDR || 'localhost'
c.mongo.port = 27017
c.mongo.username = null
c.mongo.password = null
// when using mongodb replication, i.e. when running a mongodb cluster, you can define your replication set here; when you are not using replication (most of the users), just set it to `null` (default).
c.mongo.replicaSet = null
c.mongo.authMechanism = null

// default selector. only used if omitting [selector] argument from a command.
c.selector = 'binance.XVG-BTC'
// name of default trade strategy
c.strategy = 'bollinger'

// Exchange API keys:

// to enable GDAX trading, enter your API credentials:
c.gdax = {}
c.gdax.key = 'YOUR-API-KEY'
c.gdax.b64secret = 'YOUR-BASE64-SECRET'
c.gdax.passphrase = 'YOUR-PASSPHRASE'

// to enable Binance trading, enter your API credentials:
c.binance = {}
c.binance.key = 'E3wiele6YtIGoVBsx36ylIJVx8h53OzEo8Hb3HciXtPgwYofagcpGMBFZ2taSVpB'
c.binance.secret = 'SOvKGGFZO3PS1aecSqx1Q1aQzC2cGtV55CJaybqoak7yAnPOYWh2Yswgiq9SvmD4'
// Optional stop-order triggers:

// sell if price drops below this % of bought price (0 to disable)
c.sell_stop_pct = 0
// buy if price surges above this % of sold price (0 to disable)
c.buy_stop_pct = 0
// enable trailing sell stop when reaching this % profit (0 to disable)
c.profit_stop_enable_pct = 0
// maintain a trailing stop this % below the high-water mark of profit
c.profit_stop_pct = 1

// Order execution rules:

// avoid trading at a slippage above this pct
c.max_slippage_pct = 5
// buy with this % of currency balance (WARNING : sim won't work properly if you set this value to 100)
c.buy_pct = 99
// sell with this % of asset balance (WARNING : sim won't work properly if you set this value to 100)
c.sell_pct = 99
// ms to adjust non-filled order after
c.order_adjust_time = 5000
// avoid selling at a loss below this pct set to 0 to ensure selling at a higher price...
c.max_sell_loss_pct = 99
// avoid buying at a loss above this pct set to 0 to ensure buying at a lower price...
c.max_buy_loss_pct = 99
// ms to poll order status
c.order_poll_time = 5000
// ms to wait for settlement (after an order cancel)
c.wait_for_settlement = 5000
// % to mark down buy price for orders
c.markdown_buy_pct = 0
// % to mark up sell price for orders
c.markup_sell_pct = 0
// become a market taker (high fees) or a market maker (low fees)
c.order_type = 'maker'
// when supported by the exchange, use post only type orders.
c.post_only = true
// use separated fee currency such as binance's BNB.
c.use_fee_asset = false

// Misc options:

// default # days for backfill and sim commands
c.days = 14
// defaults to a high number of lookback periods
c.keep_lookback_periods = 50000
// ms to poll new trades at
c.poll_trades = 30000
// amount of currency to start simulations with
c.currency_capital = 0.00107000
// amount of asset to start simulations with
c.asset_capital = 0
// for sim, reverse time at the end of the graph, normalizing buy/hold to 0
c.symmetrical = false
// number of periods to calculate RSI at
c.rsi_periods = 14
// period to record balances for stats
c.balance_snapshot_period = '15m'
// avg. amount of slippage to apply to sim trades
c.avg_slippage_pct = 0.045
// time to leave an order open, default to 1 day (this feature is not supported on all exchanges, currently: GDAX)
c.cancel_after = 'day'
// load and use previous trades for stop-order triggers and loss protection (live/paper mode only)
c.use_prev_trades = false
// minimum number of previous trades to load if use_prev_trades is enabled, set to 0 to disable and use trade time instead
c.min_prev_trades = 0

// output
c.output  = {}

// REST API
c.output.api = {}
c.output.api.on = true
c.output.api.ip = '0.0.0.0' // IPv4 or IPv6 address to listen on, uses all available interfaces if omitted
c.output.api.port = 0 // 0 = random port
