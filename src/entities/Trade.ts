import { CallOnIntegrationExecutedForFund } from '../generated/IntegrationManagerContract';
import {
  AddTrackedAssetsTrade,
  AssetAmount,
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
  incomingAssetAmounts: AssetAmount[],
  outgoingAssetAmounts: AssetAmount[],
  event: CallOnIntegrationExecutedForFund,
): void {
  let tradeType = convertSelectorToType(selector);

  // TokenSwap (one to one)
  if (tradeType == takeOrderType && outgoingAssetAmounts.length == 1 && incomingAssetAmounts.length == 1) {
    let trade = new TokenSwapTrade(genericId(event));
    trade.fund = fund.id;
    trade.adapter = adapter.id;
    trade.method = convertSelectorToType(selector);
    trade.incomingAssetAmount = incomingAssetAmounts[0].id;
    trade.outgoingAssetAmount = outgoingAssetAmounts[0].id;
    trade.price = outgoingAssetAmounts[0].amount.div(incomingAssetAmounts[0].amount);
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
    trade.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.outgoingAssetAmounts = outgoingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.timestamp = event.block.timestamp;
    trade.fundState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == lendType && outgoingAssetAmounts.length == 1 && incomingAssetAmounts.length == 1) {
    let trade = new LendTrade(genericId(event));
    trade.fund = fund.id;
    trade.adapter = adapter.id;
    trade.method = convertSelectorToType(selector);
    trade.incomingAssetAmount = incomingAssetAmounts[0].id;
    trade.outgoingAssetAmount = outgoingAssetAmounts[0].id;
    trade.price = outgoingAssetAmounts[0].amount.div(incomingAssetAmounts[0].amount);
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
    trade.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.outgoingAssetAmounts = outgoingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.timestamp = event.block.timestamp;
    trade.fundState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == redeemType && outgoingAssetAmounts.length == 1 && incomingAssetAmounts.length == 1) {
    let trade = new RedeemTrade(genericId(event));
    trade.fund = fund.id;
    trade.adapter = adapter.id;
    trade.method = convertSelectorToType(selector);
    trade.incomingAssetAmount = incomingAssetAmounts[0].id;
    trade.outgoingAssetAmount = outgoingAssetAmounts[0].id;
    trade.price = outgoingAssetAmounts[0].amount.div(incomingAssetAmounts[0].amount);
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
    trade.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.outgoingAssetAmounts = outgoingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
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
    trade.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.timestamp = event.block.timestamp;
    trade.fundState = fund.state;
    trade.save();

    return;
  }
}
