const tulind = require("tulind");
const average = require("../utils/average");

const stochasticRSI = async (candlesticks) => {
  const avgPrices = candlesticks.map((stick) =>
    average(stick.close, stick.high, stick.low)
  );
  const period = 12;
  const indicator = tulind.indicators.stochrsi.indicator;
  const results = await indicator([avgPrices], [period]);
  const stochrsi = results[0];
  const length = stochrsi.length;
  if (length < 2) return;
  const last = stochrsi[length - 1];
  const sellBreakpoint = 50;
  const buyBreakpoint = 40;
  const sellSignal = last > sellBreakpoint;
  const buySignal = last < buyBreakpoint;
  return { rsiBuy: buySignal, rsiSell: sellSignal };
};

module.exports = stochasticRSI;
