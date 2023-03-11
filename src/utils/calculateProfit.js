const colors = require("colors");
let totalProfit = 0;
let totalPercentages = 0;
const calculateProfit = (enter, sell) => {
  const fee = 0.0025;
  const entrance = enter * (1 + fee); // 1 stand for amount
  const exit = sell * (1 - fee); // 1 stand for amount
  const profit = (exit - entrance).toFixed(2);
  totalProfit += +profit;
  const percentage = calculatePercentage(entrance, exit);
  if (enter < sell) totalPercentages += percentage;
  else totalPercentages -= percentage;
  return {
    profit: profit,
    totalProfit: totalProfit.toFixed(2),
    percentage: +percentage,
    totalPercentage: totalPercentages,
  };
};

const calculatePercentage = (enter, sell) => {
  return enter / sell;
};

// module.exports = { calculateProfit, totalProfit };
exports.calculateProfit = calculateProfit;
