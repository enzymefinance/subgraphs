import { arrayUnique, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import { Account, SharesSplitter } from '../generated/schema';

export function sharesSplitterUserPercentageId(address: Address, user: Address): string {
  return address.toHex() + '/' + user.toHex();
}

export function linkSharesSplitterToVault(recipient: Account, comptrollerProxy: Address): void {
  let sharesSplitter = SharesSplitter.load(recipient.id);
  if (sharesSplitter != null) {
    let comptroller = ProtocolSdk.bind(comptrollerProxy);
    let vaultProxy = comptroller.try_getVaultProxy();

    if (!vaultProxy.reverted && vaultProxy.value.notEqual(ZERO_ADDRESS)) {
      sharesSplitter.vaults = arrayUnique(sharesSplitter.vaults.concat([vaultProxy.value.toHex()]));
      sharesSplitter.save();
    }
  }
}

export function createSharesSplitter(
  sharesSplitterAddress: Address,
  creator: Account,
  event: ethereum.Event,
): SharesSplitter {
  let sharesSplitter = new SharesSplitter(sharesSplitterAddress.toHex());
  sharesSplitter.creator = creator.id;
  sharesSplitter.createdAt = event.block.timestamp.toI32();
  sharesSplitter.vaults = new Array<string>();
  sharesSplitter.save();

  return sharesSplitter;
}
