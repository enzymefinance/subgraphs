import { ensureAllowedSharesTransferRecipientsPolicy } from '../../entities/AllowedSharesTransferRecipientsPolicy';
import { ListsSetForFund } from '../../generated/contracts/AllowedSharesTransferRecipientsPolicy4Events';

export function handleListsSetForFund(event: ListsSetForFund): void {
  let policy = ensureAllowedSharesTransferRecipientsPolicy(event.params.comptrollerProxy, event.address, event);
  policy.addressLists = event.params.listIds.map<string>((listId) => listId.toString());
  policy.save();
}
