// Requirements
require("dotenv/config");
const program = require("commander");
const backtester = require("./src/backtester/backtester");
const { live, timestamp } = require("./config.json");

const unixDay = 24 * 60 * 60 * 1e3;
const startTime = new Date().getTime() - unixDay;
const endTime = new Date().getTime() - unixDay * 1;
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

/*
const authedClient = new CoinbasePro.AuthenticatedClient(
  key,
  secret,
  passphrase,
  apiURL
);
*/

const main = async () => {
  const options = program.opts();
  const { interval, product, start, end } = options;
  if (!live) {
    for (let i = 90; i >= 60; i--) {
      const startTime = new Date().getTime() - 24 * 60 * 60 * 1e3 * (i + 1);
      const endTime = new Date().getTime() - 24 * 60 * 60 * 1e3 * i;
      await backtester(interval, product, startTime, endTime);
    }
  }
};

main();
