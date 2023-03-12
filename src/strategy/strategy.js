// requirements
const tradeModel = require("../models/trade");
const positionModel = require("../models/position");
const { calculateProfit } = require("../utils/calculateProfit");
const randomstring = require("randomstring");
const colors = require("colors");

// indicators
const stochasticRSI = require("./rsi");
const sma = require("./sma");

let positions = {};

const strategy = (candlesticks) => {
  // simple strategy
  run(candlesticks);
};

const positionOpened = async (price, time, size, id) => {
  const trade = tradeModel(price, time, size, id);
  const position = positionModel(trade, trade.id);
  positions[id] = position;
};

const positionClosed = async (price, time, amount, id) => {
  const position = positions[id];
  const { profit, totalProfit, /*percentage, totalPercentage,*/ enter, exit } =
    calculateProfit(position.trade.enter, price);
  const message = colors.cyan(
    `Enter: ${enter.toFixed(2)} | ${position.trade.time} | Exit: ${exit.toFixed(
      2
    )} | Trade Profit: ${Number(profit).toFixed(
      2
    )}$ | Total Profit:${(+totalProfit).toFixed(2)}$`
    // $ | Total Percentages: ${totalPercentage.toFixed(2)}%`

    // $ | Percentage: ${percentage.toFixed(
    //   2
    // )}%
  );
  console.log(message);
  if (position) {
    positions[id].state = "closed";
  }
};

const onBuySignal = async (price, time) => {
  const message = colors.green(`Buying at ${price}`);
  console.log(message);
  const id = randomstring.generate(20);
  positionOpened(price, time, 1.0, id);
};

const onSellSignal = async (price, size, time, position) => {
  positionClosed(price, size, time, (id = position.trade.id));
};

const run = async (sticks) => {
  const len = sticks.length;

  // need atleast 20 candlesticks to begin to run
  if (len < 5) return;

  const penu = sticks[len - 2].close;
  const last = sticks[len - 1].close;
  const price = last;

  // stochasticRSI(sticks);
  // sma(sticks);

  /*
  // filtereing open positions
  let openKeys = Object.keys(positions);
  let AllPositionsArr = openKeys.map((k) => {
    return positions[k];
  });
  let openPositions = AllPositionsArr.filter((p) => p.state === "open");

  if (openPositions.length == 0) {
    if (last < penu) {
      onBuySignal(price, new Date().getTime());
    }
  } else {
    if (last > penu) {
      openPositions.forEach((p) => {
        onSellSignal(price, (size = p.trade.size), new Date().getTime(), p);
      });
    }
  }
  */
};

module.exports = strategy;
