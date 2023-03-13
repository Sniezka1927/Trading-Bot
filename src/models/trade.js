const tradeModel = (price, time, size, amount, id) => {
  return {
    state: "open",
    id: id,
    enter: price,
    time: time,
    size: size,
    amount: amount,
  };
};

module.exports = tradeModel;
