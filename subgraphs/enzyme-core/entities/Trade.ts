import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ethereum } from '@graphprotocol/graph-ts';
import { Asset, AssetAmount, Trade, Vault } from '../generated/schema';
import { convertSelectorToType } from '../utils/integrationSelectors';

export function trackTrade(
  vault: Vault,
  adapter: string,
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
  trade.adapter = adapter;
  trade.type = tradeType;
  trade.incomingAssets = incomingAssets.map<string>((asset) => asset.id);
  trade.outgoingAssets = outgoingAssets.map<string>((asset) => asset.id);
  trade.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
  trade.outgoingAssetAmounts = outgoingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
  trade.timestamp = event.block.timestamp;
  trade.save();
}
