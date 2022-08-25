import { arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureAllowedAdaptersPerManagerPolicy } from '../../entities/AllowedAdaptersPerManagerPolicy';
import { ensureUserAddressList, getUserAddressListId } from '../../entities/UserAddressList';
import { ListsSetForFundAndUser } from '../../generated/contracts/AllowedAdaptersPerManagerPolicy4Events';

export function handleListsSetForFundAndUser(event: ListsSetForFundAndUser): void {
  let userAddressListId = getUserAddressListId(event.address, event.params.comptrollerProxy, event.params.user);

  let userAddressList = ensureUserAddressList(userAddressListId, event.params.user, event);

  userAddressList.addressLists = event.params.listIds.map<string>((listId) => listId.toString());

  userAddressList.save();

  let policy = ensureAllowedAdaptersPerManagerPolicy(event.params.comptrollerProxy, event.address, event);
  policy.userAddressLists = arrayUnique<string>(policy.userAddressLists.concat([userAddressListId]));

  policy.save();
}
