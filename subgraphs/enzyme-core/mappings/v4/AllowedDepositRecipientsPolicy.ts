import { ensureAllowedDepositRecipientsPolicy } from '../../entities/AllowedDepositRecipientsPolicy';
import { ListsSetForFund } from '../../generated/AllowedDepositRecipientsPolicy4Contract';

export function handleListsSetForFund(event: ListsSetForFund): void {
  let policy = ensureAllowedDepositRecipientsPolicy(event.params.comptrollerProxy, event.address, event);
  policy.addressLists = event.params.listIds.map<string>((listId) => listId.toString());
  policy.save();
}
