import { ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Depositor, Deposit, Vault } from '../generated/schema';

export function getOrCreateDeposit(vault: Vault, depositor: Depositor): Deposit {
  let id = vault.id + '/' + depositor.id;
  let deposit = Deposit.load(id);
  if (deposit == null) {
    deposit = new Deposit(id);
    deposit.vault = vault.id;
    deposit.depositor = depositor.id;
    deposit.shares = ZERO_BD;
    deposit.save();
  }

  return deposit;
}
