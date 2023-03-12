// Requirements
require("dotenv/config");
const program = require("commander");
const historicalService = require("./src/historicalService/historicalService");
const colors = require("colors");
const backtester = require("./src/backtester/backtester");
const { live, timestamp } = require("./config.json");

const startTime = new Date().getTime() - 24 * 60 * 60 * 1e3 * 2;
const endTime = new Date().getTime() - 24 * 60 * 60 * 1e3 * 3;

program
  .version("1.0.0")
  .option(
    "-i, --interval <interval>",
    "Interval in seconds for candlesticks",
    timestamp
  )
  .option("-p, --product <product>", "Product identifier", "BTC-USDT")
  .option("-s, --start <start>", "Start time in unix seconds", endTime)
  .option("-e, --end <end>", "End time in unix seconds", startTime)
  .parse(process.argv);

// Configurations
const key = process.env.API_KEY;
const secret = process.env.API_SECRET;
const passphrase = process.env.API_PASSPHRASE;
const apiURL = process.env.API_URL;

const main = async () => {
  const options = program.opts();
  const { interval, product, start, end } = options;
  if (!live) {
    await backtester(interval, product, start, end);
  }
};

main();

/*
const authedClient = new CoinbasePro.AuthenticatedClient(
  key,
  secret,
  passphrase,
  apiURL
);
*/
