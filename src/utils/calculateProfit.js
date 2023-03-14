const { leverage, exchangeFee } = require("../../config.json");
const calculatePercentage = require("./calculatePercent");
let totalProfit = 0;
let totalPercentages = 0;
const calculateProfit = (enter, sell, size, type) => {
  if (type === "long") {
    const entrance = enter * (1 + exchangeFee); // 1 stand for amount
    const exit = sell * (1 - exchangeFee); // 1 stand for amount
    const profit = ((exit - entrance) * size * leverage).toFixed(2);
    totalProfit += +profit * leverage;
    const percentage = calculatePercentage(entrance, exit, "long");
    totalPercentages += +percentage;
    return {
      enter: entrance,
      exit: exit,
      profit: profit,
      totalProfit: totalProfit.toFixed(2),
      percentage: percentage,
      totalPercentage: totalPercentages,
    };
  } else if (type === "short") {
    const entrance = enter * (1 + exchangeFee); // 1 stand for amount
    const exit = sell * (1 - exchangeFee); // 1 stand for amount
    const profit = ((entrance - exit) * size * leverage).toFixed(2);
    totalProfit += +profit * leverage;
    const percentage = calculatePercentage(entrance, exit, "short");
    totalPercentages += +percentage;
    return {
      enter: entrance,
      exit: exit,
      profit: profit,
      totalProfit: totalProfit.toFixed(2),
      percentage: percentage,
      totalPercentage: totalPercentages,
    };
  }
};

// module.exports = { calculateProfit, totalProfit };
exports.calculateProfit = calculateProfit;
