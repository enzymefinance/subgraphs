import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts';
import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Deposit } from '../generated/schema';
import { Tranche } from '../utils/tranches';

function depositId(depositor: Address, event: ethereum.Event): string {
  return depositor.toString() + '/' + uniqueEventId(event);
}

export function createDeposit(depositor: Address, tranches: Tranche[], event: ethereum.Event): Deposit {
  let deposit = new Deposit(depositId(depositor, event));

  deposit.depositor = depositor;
  deposit.amounts = tranches.map<BigInt>((tranche) => tranche.amount);
  deposit.trancheIds = tranches.map<i32>((tranche) => tranche.id as i32);
  deposit.createdAt = event.block.timestamp.toI32();
  deposit.save();

  return deposit;
}
