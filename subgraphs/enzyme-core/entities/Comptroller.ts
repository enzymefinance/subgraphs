import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { Comptroller } from '../generated/schema';

export function ensureComptroller(address: Address, event: ethereum.Event): Comptroller {
  let comptroller = Comptroller.load(address.toHex()) as Comptroller;
  if (comptroller) {
    return comptroller;
  }

  comptroller = new Comptroller(address.toHex());
  comptroller.creator = ZERO_ADDRESS.toHex();
  comptroller.creation = event.block.timestamp;
  comptroller.activation = BigInt.fromI32(0);
  comptroller.denomination = ZERO_ADDRESS.toHex();
  // comptroller.sharesActionTimelock = BigInt.fromI32(0);
  comptroller.release = ZERO_ADDRESS.toHex();
  comptroller.status = 'FREE';
  comptroller.authUsers = new Array<string>();
  comptroller.autoProtocolFeeSharesBuyback = false;
  comptroller.save();

  return comptroller;
}
