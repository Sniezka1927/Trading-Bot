const tulind = require("tulind");
const average = require("../../utils/average");
const { overBought, overSold } = require("../../../config.json");

const stochasticRSI = async (candlesticks) => {
  const avgPrices = candlesticks.map((stick) =>
    average(stick.close, stick.high, stick.low)
  );
  const closes = candlesticks.map((stick) => stick.close);

  const period = 12;
  const indicator = tulind.indicators.stochrsi.indicator;
  const results = await indicator([closes], [period]);
  const stochrsi = results[0];
  const length = stochrsi.length;
  if (length < 2) return;
  const last = stochrsi[length - 1];
  const sellBreakpoint = overSold;
  const buyBreakpoint = overBought;
  const sellSignal = last > sellBreakpoint;
  const buySignal = last < buyBreakpoint;
  return { rsiBuy: buySignal, rsiSell: sellSignal };
};

module.exports = stochasticRSI;
