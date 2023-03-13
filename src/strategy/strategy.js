// requirements
const tradeModel = require("../models/trade");
const positionModel = require("../models/position");
const { calculateProfit } = require("../utils/calculateProfit");
const randomstring = require("randomstring");
const colors = require("colors");
const {
  stoploss,
  maxLossPercentage,
  balance,
  maxInvextPercentage,
} = require("../../config.json");

// indicators
const stochasticRSI = require("./indicators/rsi");
const sma = require("./indicators/sma");
const macd = require("./indicators/macd");
const bbands = require("./indicators/bbands");

let positions = {};
let currentBalance = balance;
let tradeAmount = currentBalance * (maxInvextPercentage / 100);

const strategy = (candlesticks) => {
  run(candlesticks);
};

const positionOpened = async (price, time, size, id) => {
  const trade = tradeModel(price, time, size, id);
  const position = positionModel(trade, trade.id);
  console.log(position);
  positions[id] = position;
};

const positionClosed = async (price, size, time, id) => {
  const position = positions[id];
  if (position.state === "closed") return;
  if (position.type === "long") {
    const open = position.trade.enter;
    const close = price;
    const { profit, totalProfit, percentage, totalPercentage, enter, exit } =
      calculateProfit(open, close, size, "long");
    alertClosePostion(
      enter,
      exit,
      time,
      profit,
      totalProfit,
      percentage,
      totalPercentage,
      size,
      "LONG"
    );
  } else if (position.type === "short") {
    const open = position.trade.enter;
    const close = price;
    const { profit, totalProfit, percentage, totalPercentage, enter, exit } =
      calculateProfit(open, close, size, "short");
    alertClosePostion(
      enter,
      exit,
      time,
      profit,
      totalProfit,
      percentage,
      totalPercentage,
      size,
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
  size,
  type
) => {
  const message = colors.cyan(
    `Type: ${type} | Enter: ${enter.toFixed(2)} | ${new Date(
      time * 1e3
    ).toLocaleDateString()} ${new Date(
      time * 1e3
    ).toLocaleTimeString()} | Exit: ${exit.toFixed(
      2
    )} | Size: ${size} | Trade Profit: ${Number(profit).toFixed(
      2
    )}$ | Percentage: ${percentage}%`
  );

  console.log(profit);
  currentBalance = +balance + +totalProfit;

  const totalProfitMessage =
    currentBalance > balance
      ? colors.green(
          `Balance ${Number(currentBalance).toFixed(
            2
          )}$ | Total Profit: ${(+totalProfit).toFixed(
            2
          )}$ | Total percentage: ${totalPercentage.toFixed(2)}%`
        )
      : colors.red(
          `Balance ${Number(currentBalance).toFixed(
            2
          )} |Total Loss:${(+totalProfit).toFixed(
            2
          )}$  | Total percentage: ${totalPercentage.toFixed(2)}%`
        );

  console.log(message);
  console.log(totalProfitMessage);
};

const onBuySignal = async (price, time) => {
  const size = tradeAmount / price;
  const message = colors.yellow(
    `Longing at ${price}$ | Size ${size} |  ${new Date(
      time * 1e3
    ).toLocaleDateString()} ${new Date(time * 1e3).toLocaleTimeString()} `
  );
  console.log(message);
  const id = randomstring.generate(20);
  openLongPosition(price, time, size, id);
};

const onSellSignal = async (price, time) => {
  const size = tradeAmount / price;
  const message = colors.yellow(
    `Shorting at ${price}$ | Size ${size} | ${new Date(
      time * 1e3
    ).toLocaleDateString()} ${new Date(time * 1e3).toLocaleTimeString()}`
  );
  console.log(message);
  const id = randomstring.generate(20);
  openShortPosition(price, time, size, id);
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

const scanPositions = async (price, time) => {
  const longPositions = filterPositions("long");
  const shortPositions = filterPositions("short");
  console.log("Scanning", longPositions.length + shortPositions.length);
  longPositions.forEach(async (p) => {
    console.log((price - p.trade.enter / p.trade.enter) * 100);
    if ((price - p.trade.enter / p.trade.enter) * 100 <= 2) {
      positionClosed(price, p.trade.size, time, p.trade.id);
    }
  });
  shortPositions.forEach(async (p) => {
    console.log(((p.trade.enter - price) / p.trade.enter) * 100);
    if (((p.trade.enter - price) / p.trade.enter) * 100 <= -2) {
      positionClosed(price, p.trade.size, time, p.trade.id);
    }
  });
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

  if (stoploss) {
    scanPositions(price, timestamp);
  }

  // price / maxBalanceInvestment

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
  if (macdBuy && smaBuy && rsiBuy) {
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
