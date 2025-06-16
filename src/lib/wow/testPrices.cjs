const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../../.env.local"),
});

console.log("CLIENT_ID:", process.env.BLIZZARD_CLIENT_ID);
console.log("CLIENT_SECRET:", process.env.BLIZZARD_CLIENT_SECRET);

const fetchItemPrices = require("./fetchItemPrices.js").default;

(async () => {
  const itemId = 190452; // Dense Hide
  const userServerSlug = "stormscale";
  const region = "eu";

  const regionalServerSlugs = [
    "draenor",
    "silvermoon",
    "tarren-mill",
    "kazzak",
    "ravencrest",
    "ragnaros",
    "outland",
    "twisting-nether",
    "argent-dawn",
    "stormscale",
  ];

  const result = await fetchItemPrices(
    itemId,
    userServerSlug,
    region,
    regionalServerSlugs
  );
  console.log("✅ Item prices result:", result);
})();
