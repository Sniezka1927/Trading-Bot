const tradeModel = (price, time, size, id) => {
  return {
    state: "open",
    id: id,
    enter: price,
    time: time,
    size: size,
  };
};

module.exports = tradeModel;
