const calculateProfit = (enter, sell) => {
  const fee = 0.0025;
  const entrance = enter * (1 + fee); // 1 stand for amount
  const exit = sell * (1 - fee); // 1 stand for amount
  return (entrance - exit).toFixed(2);
};

module.exports = calculateProfit;
