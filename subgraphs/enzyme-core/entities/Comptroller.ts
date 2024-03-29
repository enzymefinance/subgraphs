import { ZERO_ADDRESS, ZERO_BI } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Comptroller } from '../generated/schema';

export function ensureComptroller(address: Address, event: ethereum.Event): Comptroller {
  let comptroller = Comptroller.load(address.toHex());
  if (comptroller) {
    return comptroller;
  }

  comptroller = new Comptroller(address.toHex());
  comptroller.creator = ZERO_ADDRESS.toHex();
  comptroller.creation = event.block.timestamp.toI32();
  comptroller.activation = 0;
  comptroller.denomination = ZERO_ADDRESS.toHex();
  comptroller.sharesActionTimelock = ZERO_BI;
  comptroller.release = ZERO_ADDRESS.toHex();
  comptroller.status = 'FREE';
  comptroller.authUsers = new Array<string>();
  comptroller.autoProtocolFeeSharesBuyback = false;
  comptroller.save();

  return comptroller;
}
