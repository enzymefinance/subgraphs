import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import { GasRelayer } from '../generated/schema';

export function ensureGasRelayer(address: Address): GasRelayer {
  let id = address.toHex();

  let gasRelayer = GasRelayer.load(id);
  if (gasRelayer) {
    return gasRelayer;
  }

  let gasRelayerContract = ProtocolSdk.bind(address);
  let comptroller = gasRelayerContract.getParentComptroller();
  let balance = gasRelayerContract.getRelayHubDeposit();

  gasRelayer = new GasRelayer(id);
  gasRelayer.comptroller = comptroller.toHex();
  gasRelayer.balance = toBigDecimal(balance);
  gasRelayer.save();

  return gasRelayer;
}

export function trackGasRelayerBalance(address: Address): void {
  let gasRelayerContract = ProtocolSdk.bind(address);
  let balance = gasRelayerContract.getRelayHubDeposit();

  let gasRelayer = ensureGasRelayer(address);
  gasRelayer.balance = toBigDecimal(balance);
  gasRelayer.save();
}
