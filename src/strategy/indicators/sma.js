const tulind = require("tulind");
const average = require("../../utils/average");
const sma = async (candlesticks) => {
  const avgPrices = candlesticks.map((stick) =>
    average(stick.close, stick.high, stick.low)
  );
  const closes = candlesticks.map((stick) => stick.close);
  const indicator = tulind.indicators.sma.indicator;
  const period = 12;
  const results = await indicator([closes], [period]);
  const sma = results[0];

  if (candlesticks.length < 2) return;

  const penultimate = candlesticks[candlesticks.length - 2].close;
  const last = candlesticks[candlesticks.length - 1].close;

  const lastSMA = sma[sma.length - 1];
  const isAbove = penultimate < lastSMA && lastSMA < last;
  const isBelow = penultimate > lastSMA && lastSMA > last;
  return { smaBuy: isAbove, smaSell: isBelow };
};

module.exports = sma;
