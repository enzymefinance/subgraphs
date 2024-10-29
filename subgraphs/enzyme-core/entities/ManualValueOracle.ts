import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { ManualValueOracle } from '../generated/schema';
import { ZERO_ADDRESS, ZERO_BI, ZERO_HASH } from '@enzymefinance/subgraph-utils';

export function ensureManualValueOracle(address: Address, event: ethereum.Event): ManualValueOracle {
  let manualValueOracle = ManualValueOracle.load(address.toHex());

  if (manualValueOracle != null) {
    return manualValueOracle;
  }

  manualValueOracle = new ManualValueOracle(address.toHex());
  manualValueOracle.owner = ZERO_ADDRESS;
  manualValueOracle.nominatedOwner = ZERO_ADDRESS;
  manualValueOracle.updater = ZERO_ADDRESS;
  manualValueOracle.description = ZERO_HASH;
  manualValueOracle.createdAt = event.block.timestamp.toI32();
  manualValueOracle.value = ZERO_BI;
  manualValueOracle.save();

  return manualValueOracle;
}
