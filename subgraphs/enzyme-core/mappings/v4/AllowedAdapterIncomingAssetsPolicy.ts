import { ensureAllowedAdapterIncomingAssetsPolicy } from '../../entities/AllowedAdapterIncomingAssetsPolicy';
import { ListsSetForFund } from '../../generated/contracts/AllowedAdapterIncomingAssetsPolicy4Events';

export function handleListsSetForFund(event: ListsSetForFund): void {
  let policy = ensureAllowedAdapterIncomingAssetsPolicy(event.params.comptrollerProxy, event.address, event);
  policy.addressLists = event.params.listIds.map<string>((listId) => listId.toString());
  policy.save();
}
