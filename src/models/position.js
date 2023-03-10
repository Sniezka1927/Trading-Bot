const positionModel = (trade, id) => {
  return {
    trade: trade,
    state: "open",
  };
};

const closePosition = (trade, id) => {
  return {
    trade: trade,
    state: "closed",
  };
};

module.exports = positionModel;
