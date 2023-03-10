// Time => 1678078800
// Low => 19910.76
// High => 19965.98
// Open => 19951.74
// Close => 19923.94
// Volume => 434.61050953

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
