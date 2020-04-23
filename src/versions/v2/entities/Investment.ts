import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Investment } from '../generated/schema';

function investmentId(accountAddress: Address, hubAddress: Address): string {
  return accountAddress.toHex() + '/' + hubAddress.toHex();
}

export function ensureInvestment(accountAddress: Address, hubAddress: Address): Investment {
  let id = investmentId(accountAddress, hubAddress);
  let investment = Investment.load(id) as Investment;
  if (investment) {
    return investment;
  }

  investment = new Investment(id);
  investment.fund = hubAddress.toHex();
  investment.investor = accountAddress.toHex();
  investment.shares = BigInt.fromI32(0);
  investment.save();

  return investment;
}
