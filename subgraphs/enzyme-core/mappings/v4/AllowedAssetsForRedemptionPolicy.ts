import { ensureAllowedAssetsForRedemptionPolicy } from '../../entities/AllowedAssetsForRedemptionPolicy';
import { ListsSetForFund } from '../../generated/contracts/AllowedAssetsForRedemptionPolicy4Events';

export function handleListsSetForFund(event: ListsSetForFund): void {
  let policy = ensureAllowedAssetsForRedemptionPolicy(event.params.comptrollerProxy, event.address, event);
  policy.addressLists = event.params.listIds.map<string>((listId) => listId.toString());
  policy.save();
}
