import { arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureAllowedExternalPositionTypesPerManagerPolicy } from '../../entities/AllowedExternalPositionTypesPerManagerPolicy';
import { ensureUserUintList, getUserUintListId } from '../../entities/UserUintList';
import { ListsSetForFundAndUser } from '../../generated/contracts/AllowedExternalPositionTypesPerManagerPolicy4Events';

export function handleListsSetForFundAndUser(event: ListsSetForFundAndUser): void {
  let userUintListId = getUserUintListId(event.address, event.params.comptrollerProxy, event.params.user);

  let userUintList = ensureUserUintList(userUintListId, event.params.user, event);

  userUintList.uintLists = event.params.listIds.map<string>((listId) => listId.toString());

  userUintList.save();

  let policy = ensureAllowedExternalPositionTypesPerManagerPolicy(event.params.comptrollerProxy, event.address, event);
  policy.userUintLists = arrayUnique<string>(policy.userUintLists.concat([userUintListId]));

  policy.save();
}
