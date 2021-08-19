import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import { GasRelayPaymasterLib4Contract } from '../generated/GasRelayPaymasterLib4Contract';
import { GasRelayer } from '../generated/schema';

export function ensureGasRelayer(address: Address): GasRelayer {
  let id = address.toHex();

  let gasRelayer = GasRelayer.load(id) as GasRelayer;
  if (gasRelayer) {
    return gasRelayer;
  }

  let gasRelayerContract = GasRelayPaymasterLib4Contract.bind(address);
  let comptroller = gasRelayerContract.getParentComptroller();
  let balance = gasRelayerContract.getRelayHubDeposit();

  gasRelayer = new GasRelayer(id);
  gasRelayer.comptroller = comptroller.toHex();
  gasRelayer.balance = toBigDecimal(balance);
  gasRelayer.save();

  return gasRelayer;
}

export function trackGasRelayerBalance(address: Address): void {
  let gasRelayerContract = GasRelayPaymasterLib4Contract.bind(address);
  let balance = gasRelayerContract.getRelayHubDeposit();

  let gasRelayer = ensureGasRelayer(address);
  gasRelayer.balance = toBigDecimal(balance);
  gasRelayer.save();
}
