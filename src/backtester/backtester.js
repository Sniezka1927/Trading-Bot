const strategy = require("../strategy/strategy");
const backtester = async (candlesticks) => {
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
