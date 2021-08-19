import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureAllowedDepositRecipientsPolicy } from '../../entities/AllowedDepositRecipientsPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/AllowedDepositRecipients4Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let policy = ensureAllowedDepositRecipientsPolicy(event.params.comptrollerProxy, event.address, event);
  policy.accounts = arrayUnique<Bytes>(policy.accounts.concat(event.params.items as Bytes[]));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let policy = ensureAllowedDepositRecipientsPolicy(event.params.comptrollerProxy, event.address, event);
  policy.accounts = arrayDiff<Bytes>(policy.accounts, event.params.items as Bytes[]);
  policy.save();
}
