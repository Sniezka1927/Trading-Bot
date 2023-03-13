const colors = require("colors");
let totalProfit = 0;
let totalPercentages = 0;
const calculateProfit = (enter, sell, type) => {
  const fee = 0.004; // Coinbase Maker fee 0.004
  if (type === "long") {
    const entrance = enter * (1 + fee); // 1 stand for amount
    const exit = sell * (1 - fee); // 1 stand for amount
    const profit = (exit - entrance).toFixed(2);
    totalProfit += +profit;
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
  }
  if (type === "short") {
    const entrance = enter * (1 + fee); // 1 stand for amount
    const exit = sell * (1 - fee); // 1 stand for amount
    const profit = (entrance - exit).toFixed(2);
    totalProfit += +profit;
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

const calculatePercentage = (enter, sell, type) => {
  if (type === "long") {
    return (((sell - enter) / enter) * 100).toFixed(2);
  } else if (type === "short") {
    return (((enter - sell) / enter) * 100).toFixed(2);
  }
};

// module.exports = { calculateProfit, totalProfit };
exports.calculateProfit = calculateProfit;
