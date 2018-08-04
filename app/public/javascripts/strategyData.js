var fs = require('fs')
var strategies = fs.readdirSync('extensions/strategies')
var strategyData = []
strategies.forEach((strategy) => {
    let strat = require(`../../extensions/strategies/${strategy}/strategy`)
    strategyData.push(strat)
})

module.exports = strategyData