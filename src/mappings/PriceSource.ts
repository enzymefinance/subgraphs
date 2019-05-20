import { PriceUpdate } from "../types/PriceSourceDataSource/PriceSourceContract";
import { AssetPrice, AssetPriceUpdate, Asset } from "../types/schema";

export function handlePriceUpdate(event: PriceUpdate): void {
  let assetPriceUpdate = new AssetPriceUpdate(event.transaction.hash.toHex());
  assetPriceUpdate.timestamp = event.block.timestamp;
  assetPriceUpdate.save();

  let prices = event.params.price;
  let tokens = event.params.token;

  for (let i: i32 = 0; i < prices.length; i++) {
    let price = new AssetPrice(
      event.transaction.hash.toHex() + "/" + tokens[i].toHex()
    );
    price.price = prices[i];
    let asset = new Asset(tokens[i].toHex());
    price.asset = asset.id;
    price.timestamp = event.block.timestamp;
    price.assetPriceUpdate = event.transaction.hash.toHex();
    price.save();
  }

  // perform calculations (for a fund)

  // network aggregate
}
