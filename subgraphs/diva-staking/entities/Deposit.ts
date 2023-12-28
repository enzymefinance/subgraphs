import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts';
import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Deposit } from '../generated/schema';

function depositId(depositor: Address, event: ethereum.Event): string {
  return depositor + '/' + uniqueEventId(event);
}

export function createDeposit(
  depositor: Address,
  tranches: { amount: BigInt; id: number }[],
  event: ethereum.Event,
): Deposit {
  let deposit = new Deposit(depositId(depositor, event));

  deposit.depositor = depositor;
  deposit.amounts = tranches.map<BigInt>((tranche) => tranche.amount);
  deposit.trancheIds = tranches.map<number>((tranche) => tranche.id);
  deposit.createdAt = event.block.timestamp.toI32();
  deposit.save();

  return deposit;
}
