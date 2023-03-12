// requirements
const tradeModel = require("../models/trade");
const positionModel = require("../models/position");
const { calculateProfit } = require("../utils/calculateProfit");
const randomstring = require("randomstring");
const colors = require("colors");

// indicators
const stochasticRSI = require("./rsi");
const sma = require("./sma");
const macd = require("./macd");
const bb = require("./bb");

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

  const message =
    Number(profit) > 0
      ? colors.cyan(
          `Enter: ${enter.toFixed(2)} | ${new Date(
            position.trade.time * 1e3
          )} | Exit: ${exit.toFixed(2)} | Trade Profit: ${Number(
            profit
          ).toFixed(2)}$`
        )
      : colors.cyan(
          `Enter: ${enter.toFixed(2)} | ${new Date(
            position.trade.time * 1e3
          )} | Exit: ${exit.toFixed(2)} | Trade Loss: ${Number(profit).toFixed(
            2
          )}$`
        );

  const totalProfitMessage =
    totalProfit > 0
      ? colors.green(`Total Profit:${(+totalProfit).toFixed(2)}$`)
      : colors.red(`Total Loss:${(+totalProfit).toFixed(2)}$`);

  console.log(message);
  console.log(totalProfitMessage);
  if (position) {
    positions[id].state = "closed";
  }
};

const onBuySignal = async (price, time) => {
  const message = colors.yellow(`Buying at ${price}`);
  console.log(message);
  const id = randomstring.generate(20);
  positionOpened(price, time, 1.0, id);
};

const onSellSignal = async (price, size, time, position) => {
  positionClosed(price, size, time, (id = position.trade.id));
};

const run = async (sticks) => {
  const len = sticks.length;

  // Amount of Candlesticks needed to begin run
  if (len < 12) return;

  const penu = sticks[len - 2].close;
  const last = sticks[len - 1].close;
  const timestamp = sticks[len - 1].time;
  const price = last;

  const macdSignals = await macd(sticks);
  if (macdSignals === undefined) return;
  const macdBuy = macdSignals.macdBuy;
  const macdSell = macdSignals.macdSell;

  const rsiSignals = await stochasticRSI(sticks);
  if (rsiSignals === undefined) return;
  const rsiBuy = rsiSignals.rsiBuy;
  const rsiSell = rsiSignals.rsiSell;

  // filtereing open positions
  let openKeys = Object.keys(positions);
  let AllPositionsArr = openKeys.map((k) => {
    return positions[k];
  });
  let openPositions = AllPositionsArr.filter((p) => p.state === "open");

  if (openPositions.length == 0) {
    if (macdBuy && rsiBuy) {
      onBuySignal(price, timestamp);
    }
  } else {
    if (macdSell || rsiSell) {
      openPositions.forEach((p) => {
        onSellSignal(price, (size = p.trade.size), timestamp, p);
      });
    }
  }
  // Simple Strategy
  // if (openPositions.length == 0) {
  //   if (last < penu) {
  //     onBuySignal(price, new Date().getTime());
  //   }
  // } else {
  //   if (last > penu) {
  //     openPositions.forEach((p) => {
  //       onSellSignal(price, (size = p.trade.size), new Date().getTime(), p);
  //     });
  //   }
  // }
};

module.exports = strategy;
