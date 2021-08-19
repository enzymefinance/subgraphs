import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureInvestorWhitelistPolicy } from '../../entities/InvestorWhitelistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/InvestorWhitelist3Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureInvestorWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.investors = arrayUnique<string>(policy.investors.concat(items));
  policy.updatedAt = event.block.timestamp;
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureInvestorWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.investors = arrayDiff<string>(policy.investors, items);
  policy.updatedAt = event.block.timestamp;
  policy.save();
}
