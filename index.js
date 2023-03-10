// Requirements
require("dotenv/config");
const program = require("commander");
const historicalService = require("./src/historicalService/historicalService");
const colors = require("colors");
const backtester = require("./src/backtester/backtester");
const now = new Date().getTime();
const yesterday = new Date().getTime() - 24 * 60 * 60 * 1e3;

program
  .version("1.0.0")
  .option(
    "-i, --interval <interval>",
    "Interval in seconds for candlesticks",
    300
  )
  .option("-p, --product <product>", "Product identifier", "BTC-USDT")
  .option("-s, --start <start>", "Start time in unix seconds", yesterday)
  .option("-e, --end <end>", "End time in unix seconds", now)
  .parse(process.argv);

// Configurations
const key = process.env.API_KEY;
const secret = process.env.API_SECRET;
const passphrase = process.env.API_PASSPHRASE;
const apiURL = process.env.API_URL;

const main = async () => {
  const options = program.opts();
  const { interval, product, start, end } = options;
  const candlesticks = await historicalService(start, end, interval, product);
  await backtester(candlesticks);
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
