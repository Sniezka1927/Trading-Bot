const positionModel = (trade, type) => {
  return {
    trade: trade,
    state: "open",
    type: type,
  };
};
module.exports = positionModel;
