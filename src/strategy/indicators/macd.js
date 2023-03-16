const tulind = require("tulind");
const average = require("../../utils/average");

const macd = async (candlesticks) => {
  const avgPrices = candlesticks.map((stick) =>
    average(stick.close, stick.high, stick.low)
  );
  const closes = candlesticks.map((stick) => stick.close);

  const shortPeriod = 12;
  const longPeriod = 26;
  const signalPeriod = 9;

  const indicator = tulind.indicators.macd.indicator;

  const results = await indicator(
    [closes],
    [shortPeriod, longPeriod, signalPeriod]
  );
  const histogram = results[2];

  const length = histogram.length;
  if (length < 2) return;

  const penultimate = histogram[length - 2];
  const last = histogram[length - 1];

  const boundary = -0.5;

  // Long Singal

  const wasAbove = penultimate > boundary;
  const wasBelow = penultimate < -boundary;
  // Short Signal
  const isAbove = last > boundary;
  const isBelow = last < -boundary;

  const buySignal = wasAbove && isBelow;
  const sellSignal = isAbove && wasBelow;

  return { macdBuy: buySignal, macdSell: sellSignal };
};

module.exports = macd;
