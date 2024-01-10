import { Address, ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Deposit, Depositor } from '../generated/schema';
import { Tranche, tranchesConfig } from '../utils/tranches';

function depositId(depositor: Address, event: ethereum.Event): string {
  return depositor.toHexString() + '/' + uniqueEventId(event);
}

export function createDeposit(depositor: Address, tranches: Tranche[], event: ethereum.Event): Deposit {
  let deposit = new Deposit(depositId(depositor, event));

  // init array with zeroes
  let trancheAmounts = tranchesConfig.map<BigDecimal>(() => BigDecimal.zero());

  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];

    trancheAmounts[tranche.id as i32] = tranche.amount;
  }

  deposit.trancheAmounts = trancheAmounts;
  deposit.depositor = depositor;
  deposit.createdAt = event.block.timestamp.toI32();
  deposit.save();

  return deposit;
}

export function decreaseDeposit(
  depositId: string,
  tranches: Tranche[],
  event: ethereum.Event,
): Depositor {
  let deposit =  Deposit.load(depositId));

  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];

    // tranche.amount can be on minus when redeeming
    trancheAmounts[tranche.id as i32] = trancheAmounts[tranche.id as i32].plus(tranche.amount);
  }
  depositor.trancheAmounts = trancheAmounts;

}