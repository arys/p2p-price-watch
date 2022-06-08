const https = require("https");

const median = (arr) => {
  const mid = Math.floor(arr.length / 2),
    nums = arr.map(parseFloat).sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const fetchP2PData = (
  tradeType = "BUY",
  payTypes = []
) => {
  return new Promise((resolve, reject) => {
    const baseObj = {
      page: 1,
      rows: 10,
      publisherType: null,
      asset: "USDT",
      tradeType,
      fiat: "KZT",
      payTypes,
    };

    const stringData = JSON.stringify(baseObj);
    const options = {
      hostname: "p2p.binance.com",
      port: 443,
      path: "/bapi/c2c/v2/friendly/c2c/adv/search",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": stringData.length,
      },
    };

    const req = https.request(options, (res) => {
      let output = "";
      res.on("data", (d) => {
        output += d;
      });

      res.on("end", () => {
        try {
          const jsonOuput = JSON.parse(output);
          resolve(jsonOuput);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(stringData);
    req.end();
  });
}

const buildSnapshot = (buys, sells) => {
  const firstBuy = parseFloat(buys[0].adv.price)
  const firstSell = parseFloat(sells[0].adv.price)
  const diff = Math.floor((firstBuy - firstSell) * 100) / 100
  const medianBuy = Math.floor(median(buys.map(r => r.adv.price)) * 100) / 100
  const medianSell = Math.floor(median(sells.map(r => r.adv.price)) * 100) / 100
  const medianDiff = Math.floor((medianBuy - medianSell) * 100) / 100

  return {
    buy: firstBuy,
    sell: firstSell,
    diff,
    medianBuy,
    medianSell,
    medianDiff
  }
}

module.exports = { median, fetchP2PData, buildSnapshot }
