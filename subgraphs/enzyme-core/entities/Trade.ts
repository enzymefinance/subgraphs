import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Asset, AssetAmount, Trade, Vault } from '../generated/schema';
import { convertSelectorToType } from '../utils/integrationSelectors';
import { getActivityCounter } from './Counter';

export function trackTrade(
  vault: Vault,
  adapterAddress: Address,
  selector: string,
  incomingAssets: Asset[],
  outgoingAssets: Asset[],
  incomingAssetAmounts: AssetAmount[],
  outgoingAssetAmounts: AssetAmount[],
  event: ethereum.Event,
): void {
  let tradeType = convertSelectorToType(selector);

  let trade = new Trade(uniqueEventId(event));
  trade.vault = vault.id;
  trade.adapter = adapterAddress;
  trade.tradeType = tradeType;
  trade.incomingAssets = incomingAssets.map<string>((asset) => asset.id);
  trade.outgoingAssets = outgoingAssets.map<string>((asset) => asset.id);
  trade.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
  trade.outgoingAssetAmounts = outgoingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
  trade.timestamp = event.block.timestamp.toI32();
  trade.activityCounter = getActivityCounter();
  trade.activityCategories = ['Vault'];
  trade.activityType = 'Trade';
  trade.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();
}
