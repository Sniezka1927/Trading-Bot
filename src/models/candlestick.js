const createCandlesticks = (data, interval) => {
  return {
    time: data[0],
    low: data[1],
    high: data[2],
    open: data[3],
    close: data[4],
    volume: data[5],
    interval: interval,
  };
};

module.exports = { createCandlesticks };
