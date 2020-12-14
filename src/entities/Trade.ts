import { BigDecimal } from '@graphprotocol/graph-ts';
import { CallOnIntegrationExecutedForFund } from '../generated/IntegrationManagerContract';
import {
  AddTrackedAssetsTrade,
  Asset,
  Fund,
  IntegrationAdapter,
  LendTrade,
  MultiLendTrade,
  MultiRedeemTrade,
  MultiTokenSwapTrade,
  RedeemTrade,
  TokenSwapTrade,
} from '../generated/schema';
import { genericId } from '../utils/genericId';
import {
  addTrackedAssetsType,
  convertSelectorToType,
  lendType,
  redeemType,
  takeOrderType,
} from '../utils/integrationSelectors';

export function trackTrade(
  fund: Fund,
  adapter: IntegrationAdapter,
  selector: string,
  incomingAssets: Asset[],
  incomingAssetAmounts: BigDecimal[],
  outgoingAssets: Asset[],
  outgoingAssetAmounts: BigDecimal[],
  event: CallOnIntegrationExecutedForFund,
): void {
  let tradeType = convertSelectorToType(selector);

  // TokenSwap (one to one)
  if (tradeType == takeOrderType && outgoingAssets.length == 1 && incomingAssets.length == 1) {
    let trade = new TokenSwapTrade(genericId(event));
    trade.fund = fund.id;
    trade.adapter = adapter.id;
    trade.method = convertSelectorToType(selector);
    trade.incomingAsset = incomingAssets[0].id;
    trade.incomingAssetAmount = incomingAssetAmounts[0];
    trade.outgoingAsset = outgoingAssets[0].id;
    trade.outgoingAssetAmount = outgoingAssetAmounts[0];
    trade.price = outgoingAssetAmounts[0].div(incomingAssetAmounts[0]);
    trade.timestamp = event.block.timestamp;
    trade.fundState = fund.state;
    trade.save();

    return;
  }

  // MultiTokenSwap (one to many, many to one, many to many)
  if (tradeType == takeOrderType) {
    let trade = new MultiTokenSwapTrade(genericId(event));
    trade.fund = fund.id;
    trade.adapter = adapter.id;
    trade.method = convertSelectorToType(selector);
    trade.incomingAssets = incomingAssets.map<string>((asset) => asset.id);
    trade.incomingAssetAmounts = incomingAssetAmounts;
    trade.outgoingAssets = outgoingAssets.map<string>((asset) => asset.id);
    trade.outgoingAssetAmounts = outgoingAssetAmounts;
    trade.timestamp = event.block.timestamp;
    trade.fundState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == lendType && outgoingAssets.length == 1 && incomingAssets.length == 1) {
    let trade = new LendTrade(genericId(event));
    trade.fund = fund.id;
    trade.adapter = adapter.id;
    trade.method = convertSelectorToType(selector);
    trade.incomingAsset = incomingAssets[0].id;
    trade.incomingAssetAmount = incomingAssetAmounts[0];
    trade.outgoingAsset = outgoingAssets[0].id;
    trade.outgoingAssetAmount = outgoingAssetAmounts[0];
    trade.price = outgoingAssetAmounts[0].div(incomingAssetAmounts[0]);
    trade.timestamp = event.block.timestamp;
    trade.fundState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == lendType) {
    let trade = new MultiLendTrade(genericId(event));
    trade.fund = fund.id;
    trade.adapter = adapter.id;
    trade.method = convertSelectorToType(selector);
    trade.incomingAssets = incomingAssets.map<string>((asset) => asset.id);
    trade.incomingAssetAmounts = incomingAssetAmounts;
    trade.outgoingAssets = outgoingAssets.map<string>((asset) => asset.id);
    trade.outgoingAssetAmounts = outgoingAssetAmounts;
    trade.timestamp = event.block.timestamp;
    trade.fundState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == redeemType && outgoingAssets.length == 1 && incomingAssets.length == 1) {
    let trade = new RedeemTrade(genericId(event));
    trade.fund = fund.id;
    trade.adapter = adapter.id;
    trade.method = convertSelectorToType(selector);
    trade.incomingAsset = incomingAssets[0].id;
    trade.incomingAssetAmount = incomingAssetAmounts[0];
    trade.outgoingAsset = outgoingAssets[0].id;
    trade.outgoingAssetAmount = outgoingAssetAmounts[0];
    trade.price = outgoingAssetAmounts[0].div(incomingAssetAmounts[0]);
    trade.timestamp = event.block.timestamp;
    trade.fundState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == redeemType) {
    let trade = new MultiRedeemTrade(genericId(event));
    trade.fund = fund.id;
    trade.adapter = adapter.id;
    trade.method = convertSelectorToType(selector);
    trade.incomingAssets = incomingAssets.map<string>((asset) => asset.id);
    trade.incomingAssetAmounts = incomingAssetAmounts;
    trade.outgoingAssets = outgoingAssets.map<string>((asset) => asset.id);
    trade.outgoingAssetAmounts = outgoingAssetAmounts;
    trade.timestamp = event.block.timestamp;
    trade.fundState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == addTrackedAssetsType) {
    let trade = new AddTrackedAssetsTrade(genericId(event));
    trade.fund = fund.id;
    trade.adapter = adapter.id;
    trade.method = convertSelectorToType(selector);
    trade.incomingAssets = incomingAssets.map<string>((asset) => asset.id);
    trade.incomingAssetAmounts = incomingAssetAmounts;
    trade.timestamp = event.block.timestamp;
    trade.fundState = fund.state;
    trade.save();

    return;
  }
}
