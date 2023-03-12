const tulind = require("tulind");
const average = require("../utils/average");
const sma = async (candlesticks) => {
  const avgPrices = candlesticks.map((stick) =>
    average(stick.close, stick.high, stick.low)
  );
  const indicator = tulind.indicators.sma.indicator;
  const period = 7;
  const results = await indicator([avgPrices], [period]);
  const sma = results[0];

  if (candlesticks.length < 2) return;

  const penultimate = candlesticks[candlesticks.length - 2].close;
  const last = candlesticks[candlesticks.length - 1].close;

  const lastSMA = sma[sma.length - 1];
  const isAbove = penultimate < lastSMA && lastSMA < last;
  const isBelow = penultimate > lastSMA && lastSMA > last;
  // if (isAbove) console.log(`${penultimate} ${lastSMA} ${last} BUY`);
  // else if (isBelow) console.log(`${penultimate} ${lastSMA} ${last} SELL`);
  return { smaBuy: isAbove, smaSell: isBelow };
};

module.exports = sma;
