import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureInvestorWhitelistPolicy } from '../../entities/InvestorWhitelistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/InvestorWhitelist3Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let policy = ensureInvestorWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.investors = arrayUnique<Bytes>(policy.investors.concat(event.params.items as Bytes[]));
  policy.updatedAt = event.block.timestamp.toI32();
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let policy = ensureInvestorWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.investors = arrayDiff<Bytes>(policy.investors, event.params.items as Bytes[]);
  policy.updatedAt = event.block.timestamp.toI32();
  policy.save();
}
