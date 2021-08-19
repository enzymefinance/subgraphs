import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureAllowedDepositRecipientsPolicy } from '../../entities/AllowedDepositRecipientsPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/AllowedDepositRecipients4Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureAllowedDepositRecipientsPolicy(event.params.comptrollerProxy, event.address, event);
  policy.accounts = arrayUnique<string>(policy.accounts.concat(items));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureAllowedDepositRecipientsPolicy(event.params.comptrollerProxy, event.address, event);
  policy.accounts = arrayDiff<string>(policy.accounts, items);
  policy.save();
}
