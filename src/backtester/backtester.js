const strategy = require("../strategy/strategy");
const historicalService = require("../historicalService/historicalService");
const colors = require("colors");
const backtester = async (interval, product, start, end) => {
  const message = colors.magenta(
    `Analyzing Chart from ${new Date(start)} - ${new Date(end)}`
  );
  console.log(message);
  const candlesticks = await historicalService(start, end, interval, product);

  try {
    Promise.all(
      candlesticks.map(async (stick, index) => {
        const sticks = candlesticks.slice(0, index + 1);
        await strategy(sticks);
      })
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports = backtester;
