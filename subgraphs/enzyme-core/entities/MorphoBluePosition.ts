import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import {
  AssetAmount,
  ExternalPositionType,
  MorphoBlueMarket,
  MorphoBluePosition,
  MorphoBluePositionChange,
  Vault,
} from '../generated/schema';
import { useVault } from './Vault';
import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { getActivityCounter } from './Counter';
import { ExternalSdk } from '../generated/contracts/ExternalSdk';
import { morphoBlueAddress } from '../generated/addresses';
import { ensureAsset } from './Asset';

function morphoBlueMarketId(morphoBluePosition: Address, marketId: Bytes): string {
  return morphoBluePosition.toHex() + '/' + marketId.toHex();
}

export function ensureMorphoBlueMarket(morphoBluePosition: Address, marketId: Bytes): MorphoBlueMarket {
  let id = morphoBlueMarketId(morphoBluePosition, marketId);
  let market = MorphoBlueMarket.load(id);

  if (market) {
    return market;
  }

  let contract = ExternalSdk.bind(morphoBlueAddress);
  let marketParams = contract.try_idToMarketParams(marketId);

  if (marketParams.reverted) {
    logCritical('Unable to obtain market params for market id {}', [marketId.toHex()]);
  }

  let loanToken = ensureAsset(marketParams.value.loanToken);
  let collateralToken = ensureAsset(marketParams.value.collateralToken);

  market = new MorphoBlueMarket(id);
  market.marketId = marketId;
  market.morpheBluePosition = morphoBluePosition.toHex();
  market.loanToken = loanToken.id;
  market.collateralToken = collateralToken.id;
  market.removed = false;
  market.save();

  return market;
}

export function createMorphoBluePosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): MorphoBluePosition {
  let position = new MorphoBluePosition(externalPositionAddress.toHex());
  position.vault = useVault(vaultAddress.toHex()).id;
  position.active = true;
  position.type = type.id;
  position.save();

  return position;
}

export function useMorphoBluePosition(id: string): MorphoBluePosition {
  let position = MorphoBluePosition.load(id);
  if (position == null) {
    logCritical('Failed to load MorphoBluePosition {}.', [id]);
  }

  return position as MorphoBluePosition;
}

export function createMorphoBluePositionChange(
  MorphoBluePositionAddress: Address,
  changeType: string,
  vault: Vault,
  market: MorphoBlueMarket,
  assetAmount: AssetAmount,
  event: ethereum.Event,
): MorphoBluePositionChange {
  let change = new MorphoBluePositionChange(uniqueEventId(event));
  change.morphoBluePositionChangeType = changeType;
  change.externalPosition = MorphoBluePositionAddress.toHex();
  change.vault = vault.id;
  change.timestamp = event.block.timestamp.toI32();
  change.market = market.id;
  change.assetAmount = assetAmount.id;
  change.activityCounter = getActivityCounter();
  change.activityCategories = ['Vault'];
  change.activityType = 'Trade';
  change.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();

  return change;
}
