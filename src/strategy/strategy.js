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
  takeProfitPercentageBreakpoint,
} = require("../../config.json");

// indicators
const stochasticRSI = require("./indicators/rsi");
const sma = require("./indicators/sma");
const macd = require("./indicators/macd");
const bbands = require("./indicators/bbands");
const calculatePercentage = require("../utils/calculatePercent");

let positions = {};
let currentBalance = balance;
let wins = 0;
let loses = 0;
let longWins = 0;
let shortWins = 0;
let totalLongs = 0;
let totalShorts = 0;
let winRatio = 0;
let stoplosses = 0;
const maxPositions = ~~(100 / maxInvextPercentage);

const strategy = (candlesticks) => {
  run(candlesticks);
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
      position.trade.amount,
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
      position.trade.amount,
      "SHORT"
    );
  }

  if (position) {
    positions[id].state = "closed";
    const { opened } = await canOpen();
    console.log("Currently we are having", opened, "positions opened");
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
  amount,
  type
) => {
  if (profit >= 0) wins++;
  else loses++;

  if (type === "LONG" && profit >= 0) longWins++;
  else if (type === "SHORT" && profit >= 0) shortWins++;

  winRatio = (wins / (wins + loses)) * 100;
  const message = colors.cyan(
    `Type: ${type} | Enter: ${enter.toFixed(2)} | ${new Date(
      time * 1e3
    ).toLocaleDateString()} ${new Date(
      time * 1e3
    ).toLocaleTimeString()} | Exit: ${exit.toFixed(
      2
    )}| Amount: ${amount}$ | Size: ${size} | Trade Profit: ${Number(
      profit
    ).toFixed(2)}$ `
    // | Percentage: ${percentage}%
  );

  currentBalance = +balance + +totalProfit;

  const totalProfitMessage =
    currentBalance > balance
      ? colors.green(
          `Balance ${Number(currentBalance).toFixed(
            2
          )}$ | Total Profit: ${(+totalProfit).toFixed(
            2
          )}$  Wins: ${wins} | Loses: ${loses} | Stoplosses: ${stoplosses} | Ratio: ${winRatio.toFixed(
            2
          )}%`
        )
      : colors.red(
          `Balance ${Number(currentBalance).toFixed(
            2
          )} |Total Loss:${(+totalProfit).toFixed(2)}$ `
        );
  // | Total percentage: ${totalPercentage.toFixed(
  //   2
  // // )}% |
  // | Total percentage: ${totalPercentage.toFixed(2)}%
  const ratio = colors.blue(
    `Wins: ${wins} | Loses: ${loses} | Stoplosses: ${stoplosses} | Ratio: ${winRatio.toFixed(
      2
    )}% | Total Longs: ${totalLongs} | Total Longs Won: ${longWins} | Total Shorts ${totalShorts} | Total Shorts Won: ${shortWins}`
  );
  console.log(message);
  console.log(totalProfitMessage);
  console.log(ratio);
};

const onBuySignal = async (price, time) => {
  const tradeAmount = currentBalance * (maxInvextPercentage / 100);
  const size = tradeAmount / price;

  const { canBeOpen } = await canOpen();
  if (!canBeOpen) return;

  const message = colors.yellow(
    `Longing at ${price}$ | Size ${size} |  ${new Date(
      time * 1e3
    ).toLocaleDateString()} ${new Date(time * 1e3).toLocaleTimeString()} `
  );
  console.log(message);
  totalLongs++;
  const id = randomstring.generate(20);

  openLongPosition(price, time, size, tradeAmount, id);
};

const onSellSignal = async (price, time) => {
  const tradeAmount = currentBalance * (maxInvextPercentage / 100);
  const size = tradeAmount / price;
  const message = colors.yellow(
    `Shorting at ${price}$ | Size ${size} | ${new Date(
      time * 1e3
    ).toLocaleDateString()} ${new Date(time * 1e3).toLocaleTimeString()}`
  );
  totalShorts++;
  console.log(message);
  const id = randomstring.generate(20);
  openShortPosition(price, time, size, tradeAmount, id);
};

const openLongPosition = (price, time, size, amount, id) => {
  const trade = tradeModel(price, time, size, amount, id);
  const position = positionModel(trade, "long");
  positions[id] = position;
  closePositions("short", price, time);
};

const openShortPosition = (price, time, size, amount, id) => {
  const trade = tradeModel(price, time, size, amount, id);
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
  longPositions.forEach(async (p) => {
    const percentage = calculatePercentage(p.trade.enter, price, "long");
    if (percentage <= -maxLossPercentage) {
      const message = colors.red("Stop loss!");
      console.log(message);
      stoplosses++;
      positionClosed(price, p.trade.size, time, p.trade.id);
    } else if (percentage >= takeProfitPercentageBreakpoint) {
      console.log(p.trade.enter, price, percentage);
      const message = colors.blue("Trade closed!");
      console.log(message);
      positionClosed(price, p.trade.size, time, p.trade.id);
    }
  });
  shortPositions.forEach(async (p) => {
    const percentage = calculatePercentage(p.trade.enter, price, "short");
    if (percentage <= -maxLossPercentage) {
      const message = colors.red("Stop loss!");
      console.log(message);
      stoplosses++;
      positionClosed(price, p.trade.size, time, p.trade.id);
    } else if (percentage >= takeProfitPercentageBreakpoint) {
      console.log(p.trade.enter, price, percentage);
      const message = colors.blue("Trade closed!");
      console.log(message);
      positionClosed(price, p.trade.size, time, p.trade.id);
    }
  });
};

const canOpen = async () => {
  const longPositions = filterPositions("long");
  const shortPositions = filterPositions("short");
  const openedPositions = longPositions.length + shortPositions.length;
  if (openedPositions < maxPositions)
    return { canBeOpen: true, opened: openedPositions };
  else return { canBeOpen: false, opened: openedPositions };
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
  } else if (macdSell && smaSell & rsiSell) {
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
