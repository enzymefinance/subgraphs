import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  ExternalPositionType,
  PendleV2AllowedMarket,
  PendleV2Position,
  PendleV2PositionChange,
  Vault,
} from '../generated/schema';
import { useVault } from './Vault';
import { getActivityCounter } from './Counter';
import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureAsset } from './Asset';
import { ExternalSdk } from '../generated/contracts/ExternalSdk';


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
  position.principalTokenHoldings = new Array<string>(0);
  position.lpTokenHoldings = new Array<string>(0);
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
  change.market = null;
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

function pendleV2AllowedMarketId(vault: Vault, marketAddress: Address): string {
  return vault.id + '/' + marketAddress.toHex()
}


export function ensurePendleV2AllowedMarket(vault: Vault, marketAddress: Address): PendleV2AllowedMarket {
  let id = pendleV2AllowedMarketId(vault, marketAddress);

  let market = PendleV2AllowedMarket.load(id);

  if (market) {
    return market;
  }

  let pendleMarketContract = ExternalSdk.bind(marketAddress);
  let tokens = pendleMarketContract.try_readTokens();

  if (tokens.reverted == true) {
    logCritical('Unable to read Pendle tokens for market {}',[marketAddress.toHex()]);
  }

  market = new PendleV2AllowedMarket(id);
  market.vault = vault.id;
  market.duration = 0;
  market.principalToken = ensureAsset(tokens.value.getPt_()).id;
  market.active = true;
  market.save();

  return market;
}
