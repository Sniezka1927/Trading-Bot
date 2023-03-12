const average = (close, high, low) => {
  return (close + high + low) / 3;
};

module.exports = average;
