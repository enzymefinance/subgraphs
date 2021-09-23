import { ensureAllowedAdaptersPolicy } from '../../entities/AllowedAdaptersPolicy';
import { ListsSetForFund } from '../../generated/contracts/AllowedAdaptersPolicy4Events';

export function handleListsSetForFund(event: ListsSetForFund): void {
  let policy = ensureAllowedAdaptersPolicy(event.params.comptrollerProxy, event.address, event);
  policy.addressLists = event.params.listIds.map<string>((listId) => listId.toString());
  policy.save();
}
