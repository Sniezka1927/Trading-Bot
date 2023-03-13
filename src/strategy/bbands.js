const tulind = require("tulind");
const average = require("../utils/average");
const bbands = async (candlesticks) => {
  const avgPrices = candlesticks.map((stick) =>
    average(stick.close, stick.high, stick.low)
  );
  const indicator = tulind.indicators.bbands.indicator;
  const period = 7;
  const stddev = 2.5;
  const results = await indicator([avgPrices], [period, stddev]);

  const lowerBands = results[0];
  const upperBands = results[2];

  const length = lowerBands.length;
  if (length < 2) return;

  const last = candlesticks[candlesticks.length - 1].close;

  const lower = lowerBands[length - 1];
  const upper = upperBands[length - 1];

  return { bbBuy: last < lower, bbSell: last > upper };
};
module.exports = bbands;
