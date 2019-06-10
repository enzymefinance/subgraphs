import { Address, BigInt } from "@graphprotocol/graph-ts";
import { MelonNetworkAssetHistory } from "../../types/schema";
import { investorEntity } from "./investorEntity";

export function networkAssetHistoryEntity(
  asset: Address,
  timestamp: BigInt
): MelonNetworkAssetHistory {
  let id = asset.toHex() + "/" + timestamp.toString();
  let networkAssetHistory = MelonNetworkAssetHistory.load(id);

  if (!networkAssetHistory) {
    networkAssetHistory = new MelonNetworkAssetHistory(id);
    networkAssetHistory.melonNetworkHistory = timestamp.toString();
    networkAssetHistory.asset = asset.toHex();
    networkAssetHistory.assetGav = BigInt.fromI32(0);
    networkAssetHistory.amount = BigInt.fromI32(0);
    networkAssetHistory.numberOfFunds = 0;
    networkAssetHistory.invalidPrices = 0;
    networkAssetHistory.timestamp = timestamp;
    networkAssetHistory.save();
  }

  return networkAssetHistory as MelonNetworkAssetHistory;
}
