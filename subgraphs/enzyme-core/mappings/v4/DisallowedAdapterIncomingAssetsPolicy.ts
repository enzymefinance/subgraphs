import { ensureDisallowedAdapterIncomingAssetsPolicy } from '../../entities/DisallowedAdapterIncomingAssetsPolicy';
import { ListsSetForFund } from '../../generated/contracts/DisallowedAdapterIncomingAssetsPolicy4Events';

export function handleListsSetForFund(event: ListsSetForFund): void {
  let policy = ensureDisallowedAdapterIncomingAssetsPolicy(event.params.comptrollerProxy, event.address, event);
  policy.addressLists = event.params.listIds.map<string>((listId) => listId.toString());
  policy.save();
}
