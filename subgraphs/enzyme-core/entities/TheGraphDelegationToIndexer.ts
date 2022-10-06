import { Address, ethereum, BigInt, log } from '@graphprotocol/graph-ts';
import { TheGraphDelegationToIndexer } from '../generated/schema';
import { ExternalSdk } from '../generated/contracts/ExternalSdk';
import { grtAddress, theGraphStakingProxyAddress } from '../generated/addresses';
import { ensureAsset } from './Asset';
import { logCritical, toBigDecimal, ZERO_BD } from '@enzymefinance/subgraph-utils';

export function getTheGraphDelegationToIndexerId(externalPositionAddress: Address, indexerAddress: Address): string {
  return externalPositionAddress.toHex() + '/' + indexerAddress.toHex();
}

export function useTheGraphDelegationToIndexer(id: string): TheGraphDelegationToIndexer {
  let theGraphDelegationToIndexer = TheGraphDelegationToIndexer.load(id);
  if (theGraphDelegationToIndexer == null) {
    logCritical('Failed to load TheGraphDelegationToIndexer {}.', [id]);
  }

  return theGraphDelegationToIndexer as TheGraphDelegationToIndexer;
}

export function ensureTheGraphDelegationToIndexer(
  externalPositionAddress: Address,
  indexer: Address,
): TheGraphDelegationToIndexer {
  let id = getTheGraphDelegationToIndexerId(externalPositionAddress, indexer);

  let delegation = TheGraphDelegationToIndexer.load(id);

  if (delegation) {
    return delegation;
  }

  delegation = new TheGraphDelegationToIndexer(id);
  delegation.externalPosition = externalPositionAddress.toHex();
  delegation.shares = BigInt.fromI32(0);
  delegation.indexer = indexer;
  delegation.tokensLocked = ZERO_BD;
  delegation.tokensLockedUntil = 0;
  delegation.save();

  return delegation;
}

export function trackTheGraphDelegationToIndexer(
  externalPositionAddress: Address,
  indexer: Address,
  event: ethereum.Event,
): TheGraphDelegationToIndexer {
  let delegation = ensureTheGraphDelegationToIndexer(externalPositionAddress, indexer);

  let theGraphStakingContract = ExternalSdk.bind(theGraphStakingProxyAddress);
  let delegationCall = theGraphStakingContract.try_getDelegation(
    Address.fromBytes(delegation.indexer),
    Address.fromString(delegation.externalPosition as string),
  );

  if (delegationCall.reverted) {
    return delegation;
  }

  let grtAsset = ensureAsset(grtAddress);

  delegation.shares = delegationCall.value[0].toBigInt();
  delegation.tokensLocked = toBigDecimal(delegationCall.value[1].toBigInt(), grtAsset.decimals);
  delegation.tokensLockedUntil = delegationCall.value[2].toBigInt().toI32();
  delegation.save();

  return delegation;
}
