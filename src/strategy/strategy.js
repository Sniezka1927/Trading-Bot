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
  if (position.type === "long") {
    const open = position.trade.enter;
    const close = price;
    const { profit, totalProfit, percentage, totalPercentage, enter, exit } =
      calculateProfit(open, close, "long");
    alertClosePostion(
      enter,
      exit,
      time,
      profit,
      totalProfit,
      percentage,
      totalPercentage,
      "LONG"
    );
  } else if (position.type === "short") {
    const open = position.trade.enter;
    const close = price;
    const { profit, totalProfit, percentage, totalPercentage, enter, exit } =
      calculateProfit(open, close, "short");
    alertClosePostion(
      enter,
      exit,
      time,
      profit,
      totalProfit,
      percentage,
      totalPercentage,
      "SHORT"
    );
  }

  if (position) {
    positions[id].state = "closed";
  }
};

const alertClosePostion = (
  enter,
  exit,
  time,
  profit,
  totalProfit,
  percentage,
  totalPercentage,
  type
) => {
  const message = colors.cyan(
    `Type: ${type} | Enter: ${enter.toFixed(2)} | ${new Date(
      time * 1e3
    ).toLocaleDateString()} ${new Date(
      time * 1e3
    ).toLocaleTimeString()} | Exit: ${exit.toFixed(2)} | Trade Profit: ${Number(
      profit
    ).toFixed(2)}$ | Percentage: ${percentage}%`
  );

  const totalProfitMessage =
    totalProfit > 0
      ? colors.green(
          `Total Profit: ${(+totalProfit).toFixed(
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
};

const onBuySignal = async (price, time) => {
  const message = colors.yellow(
    `Longing at ${price}$ | ${new Date(
      time * 1e3
    ).toLocaleDateString()} ${new Date(time * 1e3).toLocaleTimeString()}`
  );
  console.log(message);
  const id = randomstring.generate(20);
  positionOpened(price, time, 1.0, id);
  openLongPosition(price, time, 1.0, id);
};

const onSellSignal = async (price, time) => {
  const message = colors.yellow(
    `Shorting at ${price}$ | ${new Date(
      time * 1e3
    ).toLocaleDateString()} ${new Date(time * 1e3).toLocaleTimeString()}`
  );
  console.log(message);
  const id = randomstring.generate(20);
  closePositions("long", price, time);
  openShortPosition(price, time, 1.0, id);
};

const openLongPosition = (price, time, size, id) => {
  const trade = tradeModel(price, time, size, id);
  const position = positionModel(trade, "long");
  positions[id] = position;
  closePositions("short", price, time);
};

const openShortPosition = (price, time, size, id) => {
  const trade = tradeModel(price, time, size, id);
  const position = positionModel(trade, "short");
  positions[id] = position;
  closePositions("long", price, time);
};

const closePositions = async (type, price, time) => {
  const openPositions = await filterPositions(type);
  openPositions.forEach(async (p) => {
    await positionClosed(price, (size = p.trade.size), time, p.trade.id);
  });
};

const filterPositions = (type) => {
  let openKeys = Object.keys(positions);
  let AllPositionsArr = openKeys.map((k) => {
    return positions[k];
  });
  let openPositions = AllPositionsArr.filter(
    (p) => p.state === "open" && p.type === type
  );
  return openPositions;
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

  const positionType = detectFutures(
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

  if (positionType === "long") {
    onBuySignal(price, timestamp);
  } else if (positionType === "short") {
    onSellSignal(price, timestamp);
  }
};

if (stoploss) {
  // close positions
}

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
  if (macdBuy && smaBuy) {
    // rsiBuy &&
    console.log(
      "Looks like we found a nice place to long!",
      price,
      `${new Date(time * 1e3).toLocaleDateString()} ${new Date(
        time * 1e3
      ).toLocaleTimeString()}`
    );
    return "long";
  } else if (macdSell && smaSell) {
    // && rsiSell
    console.log(
      `That's a chance to short!`,
      price,
      `${new Date(time * 1e3).toLocaleDateString()} ${new Date(
        time * 1e3
      ).toLocaleTimeString()}`
    );
    return "short";
  }
};

module.exports = strategy;
