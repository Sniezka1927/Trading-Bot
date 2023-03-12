const tulind = require("tulind");
const sma = (candlesticks) => {
  const { closes, time } = candlesticks.map((stick) => {
    return stick.close;
  });
  console.log(closes.length);

  var open = [4, 5, 5, 5, 4, 4, 4, 6, 6, 6];
  var high = [9, 7, 8, 7, 8, 8, 7, 7, 8, 7];
  var low = [1, 2, 3, 3, 2, 1, 2, 2, 2, 3];
  var close = [4, 5, 6, 6, 6, 5, 5, 5, 6, 4];
  var volume = [123, 232, 212, 232, 111, 232, 212, 321, 232, 321];

  // Period stand for minimum amount of stickers to start with
  const resultsSMA = tulind.indicators.sma.indicator(
    [closes],
    [1],
    function (err, results) {
      console.log("Result of sma is:");
      console.log(results[0]);
      console.log(results[0].length);
    }
  );
  console.log(resultsSMA);
};

module.exports = sma;
