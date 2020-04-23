import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Participation } from '../generated/schema';

function participationId(accountAddress: Address, hubAddress: Address): string {
  return accountAddress.toHex() + '/' + hubAddress.toHex();
}

export function ensureParticipation(accountAddress: Address, hubAddress: Address): Participation {
  let id = participationId(accountAddress, hubAddress);
  let participation = Participation.load(id) as Participation;
  if (participation) {
    return participation;
  }

  participation = new Participation(id);
  participation.fund = hubAddress.toHex();
  participation.investor = accountAddress.toHex();
  participation.shares = BigInt.fromI32(0);
  participation.save();

  return participation;
}
