const colors = require("colors");
let totalProfit = 0;
let totalPercentages = 0;
const calculateProfit = (enter, sell) => {
  const fee = 0.004; // Coinbase Maker fee 0.004
  const entrance = enter * (1 + fee); // 1 stand for amount
  const exit = sell * (1 - fee); // 1 stand for amount
  const profit = (exit - entrance).toFixed(2);
  totalProfit += +profit;
  const percentage = calculatePercentage(entrance, exit);
  totalPercentages += +percentage;
  return {
    enter: entrance,
    exit: exit,
    profit: profit,
    totalProfit: totalProfit.toFixed(2),
    percentage: percentage,
    totalPercentage: totalPercentages,
  };
};

const calculatePercentage = (enter, sell) => {
  return (((sell - enter) / enter) * 100).toFixed(2);
};

// module.exports = { calculateProfit, totalProfit };
exports.calculateProfit = calculateProfit;
