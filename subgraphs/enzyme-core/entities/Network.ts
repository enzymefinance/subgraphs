import { logCritical, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { dispatcherAddress } from '../generated/addresses';
import { DispatcherContract } from '../generated/DispatcherContract';
import { Network } from '../generated/schema';

export let networkId = 'ENZYME';

export function createNetwork(event: ethereum.Event): Network {
  let network = new Network(networkId);
  network.vaults = 0;
  network.managers = 0;
  network.depositors = 0;
  network.deposits = 0;

  network.protocolFeeRate = BigDecimal.fromString('0');
  network.mlnBurned = BigDecimal.fromString('0');

  let dispatcher = DispatcherContract.bind(dispatcherAddress);
  network.migrationTimelock = dispatcher.getMigrationTimelock().toI32();
  network.sharesTokenSymbol = dispatcher.getSharesTokenSymbol();
  network.owner = dispatcher.getOwner();

  let nominatedOwner = dispatcher.getNominatedOwner();
  network.nominatedOwner = nominatedOwner.equals(ZERO_ADDRESS) ? null : nominatedOwner;

  network.save();

  return network;
}

export function ensureNetwork(event: ethereum.Event): Network {
  let network = Network.load(networkId) as Network;

  if (network != null) {
    return network;
  }

  return createNetwork(event);
}

export function useNetwork(): Network {
  let network = Network.load(networkId) as Network;

  if (network == null) {
    logCritical('Network {} does not exist', [networkId]);
  }
  return network;
}

export function trackNetworkFunds(event: ethereum.Event): void {
  let network = ensureNetwork(event);
  network.vaults = network.vaults + 1;
  network.save();
}

export function trackNetworkManagers(event: ethereum.Event): void {
  let network = ensureNetwork(event);
  network.managers = network.managers + 1;
  network.save();
}

export function trackNetworkDepositors(event: ethereum.Event): void {
  let network = ensureNetwork(event);
  network.depositors = network.depositors + 1;
  network.save();
}

export function trackNetworkDeposits(event: ethereum.Event): void {
  let network = ensureNetwork(event);
  network.deposits = network.deposits + 1;
  network.save();
}
