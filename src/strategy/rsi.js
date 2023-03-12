const tulind = require("tulind");
const colors = require("colors");
const stochasticRSI = (candlesticks) => {
  //   const lows = candlesticks.map((stick) => {
  //     return stick.low;
  //   });
  //   tulind.indicators.stochrsi.indicator([lows], [3], (err, res) => {
  //     if (err) return err;
  //     console.log(res[0][res[0].length - 1]);
  //   });

  var open = [4, 5, 5, 5, 4, 4, 4, 6, 6, 6];
  var high = [9, 7, 8, 7, 8, 8, 7, 7, 8, 7];
  var low = [1, 2, 3, 3, 2, 1, 2, 2, 2, 3];
  var close = [4, 5, 6, 6, 6, 5, 5, 5, 6, 4];
  var volume = [123, 232, 212, 232, 111, 232, 212, 321, 232, 321];

  tulind.indicators.sma.indicator([close], [3], function (err, results) {
    console.log("Result of sma is:");
    console.log(results[0]);
  });

  tulind.indicators.stoch.indicator(
    [high, low, close],
    [5, 3, 3],
    function (err, results) {
      console.log("Result of stochastic oscillator is:");
      console.log(results[0]);
      console.log(results[1]);
    }
  );
};

module.exports = stochasticRSI;
