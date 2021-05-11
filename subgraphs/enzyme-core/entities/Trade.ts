import { uniqueEventId } from '../../../utils/utils/id';
import { CallOnIntegrationExecutedForFund } from '../generated/IntegrationManagerContract';
import {
  AddTrackedAssetsTrade,
  ApproveAssetsTrade,
  Asset,
  AssetAmount,
  ClaimRewardsAndReinvestTrade,
  ClaimRewardsAndSwapTrade,
  ClaimRewardsTrade,
  IntegrationAdapter,
  LendAndStakeTrade,
  LendTrade,
  MultiLendTrade,
  MultiRedeemTrade,
  MultiTokenSwapTrade,
  RedeemTrade,
  StakeTrade,
  TokenSwapTrade,
  UnstakeAndRedeemTrade,
  UnstakeTrade,
  Vault,
} from '../generated/schema';
import {
  addTrackedAssetsType,
  approveAssetsType,
  claimRewardsAndReinvestType,
  claimRewardsAndSwapType,
  claimRewardsType,
  convertSelectorToType,
  lendAndStakeType,
  lendType,
  redeemType,
  stakeType,
  takeOrderType,
  unstakeAndRedeemType,
  unstakeType,
} from '../utils/integrationSelectors';

export function trackTrade(
  fund: Vault,
  adapter: IntegrationAdapter,
  selector: string,
  incomingAssets: Asset[],
  outgoingAssets: Asset[],
  incomingAssetAmounts: AssetAmount[],
  outgoingAssetAmounts: AssetAmount[],
  event: CallOnIntegrationExecutedForFund,
): void {
  let tradeType = convertSelectorToType(selector);

  // TokenSwap (one to one)
  if (tradeType == takeOrderType && outgoingAssetAmounts.length == 1 && incomingAssetAmounts.length == 1) {
    let trade = new TokenSwapTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmount = incomingAssetAmounts[0].id;
    trade.outgoingAssetAmount = outgoingAssetAmounts[0].id;
    trade.price = outgoingAssetAmounts[0].amount.div(incomingAssetAmounts[0].amount);
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  // MultiTokenSwap (one to many, many to one, many to many)
  if (tradeType == takeOrderType) {
    let trade = new MultiTokenSwapTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.outgoingAssetAmounts = outgoingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == lendType && outgoingAssetAmounts.length == 1 && incomingAssetAmounts.length == 1) {
    let trade = new LendTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmount = incomingAssetAmounts[0].id;
    trade.outgoingAssetAmount = outgoingAssetAmounts[0].id;
    trade.price = outgoingAssetAmounts[0].amount.div(incomingAssetAmounts[0].amount);
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == lendType) {
    let trade = new MultiLendTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.outgoingAssetAmounts = outgoingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == redeemType && outgoingAssetAmounts.length == 1 && incomingAssetAmounts.length == 1) {
    let trade = new RedeemTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmount = incomingAssetAmounts[0].id;
    trade.outgoingAssetAmount = outgoingAssetAmounts[0].id;
    trade.price = outgoingAssetAmounts[0].amount.div(incomingAssetAmounts[0].amount);
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == redeemType) {
    let trade = new MultiRedeemTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.outgoingAssetAmounts = outgoingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == addTrackedAssetsType) {
    let trade = new AddTrackedAssetsTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == approveAssetsType) {
    let trade = new ApproveAssetsTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssets = incomingAssets.map<string>((asset) => asset.id);
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == stakeType) {
    let trade = new StakeTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmount = incomingAssetAmounts[0].id;
    trade.outgoingAssetAmount = outgoingAssetAmounts[0].id;
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == unstakeType) {
    let trade = new UnstakeTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmount = incomingAssetAmounts[0].id;
    trade.outgoingAssetAmount = outgoingAssetAmounts[0].id;
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == claimRewardsType) {
    let trade = new ClaimRewardsTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == claimRewardsAndReinvestType) {
    let trade = new ClaimRewardsAndReinvestTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmount = incomingAssetAmounts[0].id;
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == claimRewardsAndSwapType) {
    let trade = new ClaimRewardsAndSwapTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmount = incomingAssetAmounts[0].id;
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == lendAndStakeType) {
    let trade = new LendAndStakeTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmount = incomingAssetAmounts[0].id;
    trade.outgoingAssetAmounts = outgoingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }

  if (tradeType == unstakeAndRedeemType) {
    let trade = new UnstakeAndRedeemTrade(uniqueEventId(event));
    trade.vault = fund.id;
    trade.adapter = adapter.id;
    trade.method = tradeType;
    trade.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
    trade.outgoingAssetAmount = outgoingAssetAmounts[0].id;
    trade.timestamp = event.block.timestamp;
    trade.vaultState = fund.state;
    trade.save();

    return;
  }
}
