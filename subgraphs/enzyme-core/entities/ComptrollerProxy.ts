import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { ComptrollerProxy } from '../generated/schema';

export function ensureComptrollerProxy(address: Address, event: ethereum.Event): ComptrollerProxy {
  let comptrollerProxy = ComptrollerProxy.load(address.toHex()) as ComptrollerProxy;
  if (comptrollerProxy) {
    return comptrollerProxy;
  }

  comptrollerProxy = new ComptrollerProxy(address.toHex());
  comptrollerProxy.creator = ZERO_ADDRESS.toHex();
  comptrollerProxy.timestamp = event.block.timestamp;
  comptrollerProxy.activationTime = BigInt.fromI32(0);
  comptrollerProxy.denominationAsset = ZERO_ADDRESS.toHex();
  comptrollerProxy.sharesActionTimelock = BigInt.fromI32(0);
  comptrollerProxy.feeManagerConfigData = '';
  comptrollerProxy.policyManagerConfigData = '';
  comptrollerProxy.release = ZERO_ADDRESS.toHex();
  comptrollerProxy.status = 'FREE';
  comptrollerProxy.save();

  return comptrollerProxy;
}
