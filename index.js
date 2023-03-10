// Requirements
require("dotenv/config");
const CoinbasePro = require("coinbase-pro");
const config = require("./config.json");
// Configurations
const key = process.env.API_KEY;
const secret = process.env.API_SECRET;
const passphrase = process.env.API_PASSPHRASE;
const apiURL = process.env.API_URL;

const publicClient = new CoinbasePro.PublicClient();

/*
const authedClient = new CoinbasePro.AuthenticatedClient(
  key,
  secret,
  passphrase,
  apiURL
);
*/

const historicalRates = async () => {
  //   await publicClient.getProductHistoricRates("BTC-USD", callback);

  // To include extra parameters:
  const results = await publicClient.getProductHistoricRates("BTC-USDT", {
    granularity: Number(config.timestamp),
  });
  console.log(results[0]);
  console.log(new Date().getTime());
  // Time => 1678078800
  // Low => 19910.76
  // High => 19965.98
  // Open => 19951.74
  // Close => 19923.94
  // Volume => 434.61050953
};

historicalRates();
