import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { zeroAddress } from '../constants';
import { ComptrollerProxy } from '../generated/schema';

export function ensureComptrollerProxy(address: Address, event: ethereum.Event): ComptrollerProxy {
  let comptrollerProxy = ComptrollerProxy.load(address.toHex()) as ComptrollerProxy;
  if (comptrollerProxy) {
    return comptrollerProxy;
  }

  comptrollerProxy = new ComptrollerProxy(address.toHex());
  comptrollerProxy.creator = zeroAddress.toHex();
  comptrollerProxy.timestamp = event.block.timestamp;
  comptrollerProxy.activationTime = BigInt.fromI32(0);
  comptrollerProxy.denominationAsset = zeroAddress.toHex();
  comptrollerProxy.sharesActionTimelock = BigInt.fromI32(0);
  comptrollerProxy.feeManagerConfigData = '';
  comptrollerProxy.policyManagerConfigData = '';
  comptrollerProxy.authUsers = new Array<string>();
  comptrollerProxy.release = zeroAddress.toHex();
  comptrollerProxy.status = 'FREE';
  comptrollerProxy.save();

  return comptrollerProxy;
}
