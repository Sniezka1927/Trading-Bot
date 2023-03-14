const { leverage, exchangeFee } = require("../../config.json");
const calculatePercentage = (enter, sell, type) => {
  if (type === "long") {
    return (((sell - enter) / enter) * 100 * leverage).toFixed(2);
  } else if (type === "short") {
    return (((enter - sell) / enter) * 100 * leverage).toFixed(2);
  }
};

module.exports = calculatePercentage;
