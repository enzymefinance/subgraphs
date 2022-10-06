import { logCritical, toBigDecimal, uniqueEventId, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, ethereum, Bytes, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { grtAddress, theGraphStakingProxyAddress } from '../generated/addresses';
import { ExternalSdk } from '../generated/contracts/ExternalSdk';
import {
  TheGraphDelegationPosition,
  TheGraphDelegationPositionChange,
  Vault,
  AssetAmount,
  ExternalPositionType,
  Asset,
} from '../generated/schema';
import { ensureAsset } from './Asset';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';
import { createAssetAmount } from './AssetAmount';

export function useTheGraphDelegationPosition(id: string): TheGraphDelegationPosition {
  let theGraphDelegationPosition = TheGraphDelegationPosition.load(id);
  if (theGraphDelegationPosition == null) {
    logCritical('Failed to load TheGraphDelegationPosition {}.', [id]);
  }

  return theGraphDelegationPosition as TheGraphDelegationPosition;
}

export function createTheGraphDelegationPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): TheGraphDelegationPosition {
  let position = new TheGraphDelegationPosition(externalPositionAddress.toHex());
  position.vault = useVault(vaultAddress.toHex()).id;
  position.active = true;
  position.type = type.id;
  position.save();

  return position;
}

export function createTheGraphDelegationPositionChange(
  theGraphDelegationPositionAddress: Address,
  assetAmount: AssetAmount,
  indexer: Bytes,
  feeAmount: AssetAmount | null,
  newIndexer: Bytes | null,
  withdrewWhileUndelegatingAssetAmount: AssetAmount | null,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): TheGraphDelegationPositionChange {
  let change = new TheGraphDelegationPositionChange(uniqueEventId(event));
  change.theGraphDelegationPositionChangeType = changeType;
  change.externalPosition = theGraphDelegationPositionAddress.toHex();
  change.assetAmount = assetAmount.id;
  change.indexer = indexer;
  change.feeAmount = feeAmount == null ? null : feeAmount.id;
  change.newIndexer = newIndexer;
  change.withdrewWhileUndelegatingAssetAmount =
    withdrewWhileUndelegatingAssetAmount == null ? null : withdrewWhileUndelegatingAssetAmount.id;
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

export function sharesToTheGraphAssetAmount(
  shares: BigInt,
  indexer: Address,
  denominationAsset: Asset,
  event: ethereum.Event,
): AssetAmount {
  let theGraphStakingContract = ExternalSdk.bind(theGraphStakingProxyAddress);

  let delegationPoolsCall = theGraphStakingContract.delegationPools(indexer);

  let grtAsset = ensureAsset(grtAddress);

  let currentTotalTokens = delegationPoolsCall.value4;
  let currentTotalShares = delegationPoolsCall.value5;

  let grtAmount = shares.times(currentTotalTokens).div(currentTotalShares);

  return createAssetAmount(
    grtAsset,
    toBigDecimal(grtAmount, grtAsset.decimals),
    denominationAsset,
    'grt-asset-amount',
    event,
  );
}

export function getDelegationTaxPercentage(): BigDecimal {
  let theGraphStakingContract = ExternalSdk.bind(theGraphStakingProxyAddress);

  let delegationTaxPercentageResult = theGraphStakingContract.delegationTaxPercentage();

  return toBigDecimal(delegationTaxPercentageResult, 6); // 1'000'000 corresponds to 100%
}
