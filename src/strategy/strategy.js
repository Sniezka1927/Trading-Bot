// requirements
const tradeModel = require("../models/trade");
const positionModel = require("../models/position");
const { calculateProfit } = require("../utils/calculateProfit");
const randomstring = require("randomstring");
const colors = require("colors");
const { stoploss, maxLossPercentage } = require("../../config.json");

// indicators
const stochasticRSI = require("./rsi");
const sma = require("./sma");
const macd = require("./macd");
const bbands = require("./bbands");

let positions = {};

const strategy = (candlesticks) => {
  run(candlesticks);
};

const positionOpened = async (price, time, size, id) => {
  const trade = tradeModel(price, time, size, id);
  const position = positionModel(trade, trade.id);
  positions[id] = position;
};

const positionClosed = async (price, size, time, id) => {
  const position = positions[id];
  const { profit, totalProfit, percentage, totalPercentage, enter, exit } =
    calculateProfit(position.trade.enter, price);

  const message =
    Number(profit) > 0
      ? colors.cyan(
          `Enter: ${enter.toFixed(2)} | ${new Date(
            time * 1e3
          ).toLocaleDateString()} ${new Date(
            time * 1e3
          ).toLocaleTimeString()} | Exit: ${exit.toFixed(
            2
          )} | Trade Profit: ${Number(profit).toFixed(2)}$`
        )
      : colors.cyan(
          `Enter: ${enter.toFixed(2)} | ${new Date(
            time * 1e3
          ).toLocaleDateString()} ${new Date(
            time * 1e3
          ).toLocaleTimeString()} | Exit: ${exit.toFixed(
            2
          )} | Trade Loss: ${Number(profit).toFixed(2)}$`
        );

  const totalProfitMessage =
    totalProfit > 0
      ? colors.green(
          `Total Profit:${(+totalProfit).toFixed(
            2
          )}$ | Total percentage: ${totalPercentage}%`
        )
      : colors.red(
          `Total Loss:${(+totalProfit).toFixed(
            2
          )}$  | Total percentage: ${totalPercentage}%`
        );

  console.log(message);
  console.log(totalProfitMessage);
  if (position) {
    positions[id].state = "closed";
  }
};

const onBuySignal = async (price, time) => {
  const message = colors.yellow(
    `Buying at ${price}$ | ${new Date(
      time * 1e3
    ).toLocaleDateString()} ${new Date(time * 1e3).toLocaleTimeString()}`
  );
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
  if (len < 5) return;

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

  const smaSignals = await sma(sticks);
  if (smaSignals === undefined) return;
  const smaBuy = smaSignals.smaBuy;
  const smaSell = smaSignals.smaSell;

  const bbandsSignals = await bbands(sticks);
  if (bbandsSignals === undefined) return;
  const bbBuy = bbandsSignals.bbBuy;
  const bbSell = bbandsSignals.bbSell;

  // filtereing open positions
  let openKeys = Object.keys(positions);
  let AllPositionsArr = openKeys.map((k) => {
    return positions[k];
  });
  let openPositions = AllPositionsArr.filter((p) => p.state === "open");

  detectFutures(
    macdBuy,
    rsiBuy,
    smaBuy,
    macdSell,
    rsiSell,
    smaSell,
    bbBuy,
    bbSell,
    price,
    timestamp
  );

  if (openPositions.length == 0) {
    if (rsiBuy && macdBuy && smaBuy) {
      onBuySignal(price, timestamp);
    }
  } else {
    openPositions.forEach((p) => {
      // If signals are predicting trend reversal
      if (macdSell && rsiSell && smaSell) {
        onSellSignal(price, (size = p.trade.size), timestamp, p);
      }
      // Take profit when it goes to setted win
      if (p.trade.enter * 1.02 <= price) {
        onSellSignal(price, (size = p.trade.size), timestamp, p);
      }
      // Stoploss
      if (stoploss)
        if (p.trade.enter * 0.9 > price) {
          onSellSignal(price, (size = p.trade.size), timestamp, p);
        }
    });
  }
};

const detectFutures = (
  macdBuy,
  rsiBuy,
  smaBuy,
  macdSell,
  rsiSell,
  smaSell,
  bbBuy,
  bbSell,
  price,
  time
) => {
  if (rsiBuy && macdBuy && smaBuy)
    console.log(
      "Looks like we found a nice place to long!",
      price,
      `${new Date(time * 1e3).toLocaleDateString()} ${new Date(
        time * 1e3
      ).toLocaleTimeString()}`
    );
  else if (macdSell && smaSell)
    // && rsiSell
    console.log(
      `That's a chance to short!`,
      price,
      `${new Date(time * 1e3).toLocaleDateString()} ${new Date(
        time * 1e3
      ).toLocaleTimeString()}`
    );
};

module.exports = strategy;
