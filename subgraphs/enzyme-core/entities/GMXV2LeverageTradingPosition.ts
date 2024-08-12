import { Address, BigDecimal, Bytes, ethereum } from '@graphprotocol/graph-ts';
import {
  Asset,
  AssetAmount,
  ExternalPositionType,
  GMXV2LeverageTradingPosition,
  GMXV2LeverageTradingPositionChange,
  Vault,
} from '../generated/schema';
import { useVault } from './Vault';
import { getActivityCounter } from './Counter';
import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';

export function useGMXV2LeverageTradingPosition(id: string): GMXV2LeverageTradingPosition {
  let position = GMXV2LeverageTradingPosition.load(id);
  if (position == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return position as GMXV2LeverageTradingPosition;
}

export function createGMXV2LeverageTradingPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): GMXV2LeverageTradingPosition {
  let position = new GMXV2LeverageTradingPosition(externalPositionAddress.toHex());
  position.vault = useVault(vaultAddress.toHex()).id;
  position.active = true;
  position.type = type.id;
  position.trackedMarkets = new Array<Bytes>(0);
  position.trackedAssets = new Array<string>(0);
  position.save();

  return position;
}

export function createGMXV2LeverageTradingPositionChange(
  position: Address,
  changeType: string,
  vault: Vault,
  assets: Asset[],
  assetAmount: AssetAmount,
  executionFee: AssetAmount,
  orderType: string,
  sizeDeltaUsd: BigDecimal,
  triggerPrice: BigDecimal,
  acceptablePrice: BigDecimal,
  isLong: boolean,
  exchangeRouter: Address,
  markets: Address[],
  event: ethereum.Event,
): GMXV2LeverageTradingPositionChange {
  let change = new GMXV2LeverageTradingPositionChange(uniqueEventId(event));
  change.gmxV2LeverageTradingPositionChangeType = changeType;
  change.externalPosition = position.toHex();
  change.assets = assets.map<string>((asset) => asset.id);
  change.assetAmount = assetAmount.id;
  change.executionFee = executionFee.id;
  change.orderType = orderType;
  change.sizeDeltaUsd = sizeDeltaUsd;
  change.triggerPrice = triggerPrice;
  change.acceptablePrice = acceptablePrice;
  change.isLong = isLong;
  change.exchangeRouter = exchangeRouter;
  change.markets = markets;
  change.vault = vault.id;
  change.timestamp = event.block.timestamp.toI32();
  change.activityCounter = getActivityCounter();
  change.activityCategories = ['Vault'];
  change.activityType = 'Trade';
  change.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();

  return change;
}

export enum GMXV2LeverageTradingOrderType {
  MarketSwap = 0,
  LimitSwap = 1,
  MarketIncrease = 2,
  LimitIncrease = 3,
  MarketDecrease = 4,
  LimitDecrease = 5,
  StopLossDecrease = 6,
  Liquidation = 7,
}

export let gmxUsdDecimals = 30;
