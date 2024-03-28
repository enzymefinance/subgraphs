import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  ExternalPositionType,
  PendleV2Market,
  PendleV2Position,
  PendleV2PositionChange,
  PendleV2PrincipleTokenWithMarketAndDuration,
  Vault,
} from '../generated/schema';
import { useVault } from './Vault';
import { getActivityCounter } from './Counter';
import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureAsset } from './Asset';

export function usePendleV2Position(id: string): PendleV2Position {
  let position = PendleV2Position.load(id);
  if (position == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return position as PendleV2Position;
}

export function createPendleV2Position(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): PendleV2Position {
  let position = new PendleV2Position(externalPositionAddress.toHex());
  position.vault = useVault(vaultAddress.toHex()).id;
  position.active = true;
  position.type = type.id;
  position.lpMarkets = new Array<string>(0);
  position.save();

  return position;
}

export function createPendleV2PositionChange(
  position: Address,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): PendleV2PositionChange {
  let change = new PendleV2PositionChange(uniqueEventId(event));
  change.pendleV2PositionChangeType = changeType;
  change.externalPosition = position.toHex();
  change.assets = new Array<string>(0);
  change.assetAmount = null;
  change.lpMarket = null;
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

export function ensurePendleV2Market(marketAddress: Address): PendleV2Market {
  let market = PendleV2Market.load(marketAddress.toHex());

  if (market) {
    return market;
  }

  market = new PendleV2Market(marketAddress.toHex());
  market.duration = 0;
  market.save();

  return market;
}

function getPendleV2PrincipleTokenWithMarketAndDurationId(
  externalPosition: Address,
  principleToken: Address,
  market: Address,
): string {
  return externalPosition.toHex() + '/' + principleToken.toHex() + '/' + market.toHex();
}

export function ensurePendleV2PrincipleTokenWithMarketAndDuration(
  externalPosition: Address,
  principleToken: Address,
  market: Address,
): PendleV2PrincipleTokenWithMarketAndDuration {
  let id = getPendleV2PrincipleTokenWithMarketAndDurationId(externalPosition, principleToken, market);

  let item = PendleV2PrincipleTokenWithMarketAndDuration.load(id);

  if (item) {
    return item;
  }

  item = new PendleV2PrincipleTokenWithMarketAndDuration(id);
  item.pendleV2Position = usePendleV2Position(externalPosition.toHex()).id;
  item.principalToken = ensureAsset(principleToken).id;
  item.market = ensurePendleV2Market(market).id;
  item.save();

  return item;
}
