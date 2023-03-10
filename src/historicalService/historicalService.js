const CoinbasePro = require("coinbase-pro");
const { createCandlesticks } = require("../models/candlestick");
const publicClient = new CoinbasePro.PublicClient();

const historicalService = async (start, end, interval, product) => {
  const results = await publicClient.getProductHistoricRates(product, {
    start: start,
    end: end,
    granularity: interval,
  });
  const candlesticks = results.map((r) => createCandlesticks(r, interval));
  return candlesticks;
};

module.exports = historicalService;
