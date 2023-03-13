const strategy = require("../strategy/strategy");
const historicalService = require("../historicalService/historicalService");
const colors = require("colors");
const backtester = async (interval, product, start, end) => {
  const message = colors.magenta(
    `Analyzing Chart from ${new Date(start).toLocaleDateString()} ${new Date(
      start
    ).toLocaleTimeString()} - ${new Date(end).toLocaleDateString()} ${new Date(
      end
    ).toLocaleTimeString()}\nPair: ${product}\ngranuality: ${interval / 60}min`
  );
  console.log(message);
  const candlesticks = await historicalService(start, end, interval, product);

  try {
    Promise.all(
      candlesticks.map(async (stick, index) => {
        const sticks = candlesticks.slice(0, index + 1);
        strategy(sticks);
      })
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports = backtester;
