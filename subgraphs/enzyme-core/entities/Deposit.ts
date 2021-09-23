import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Account, Deposit, Vault } from '../generated/schema';
import { trackNetworkDeposits } from './Network';

function depositId(depositor: Account, vault: Vault): string {
  return vault.id + '/' + depositor.id;
}

export function ensureDeposit(depositor: Account, vault: Vault, event: ethereum.Event): Deposit {
  let id = depositId(depositor, vault);

  let deposit = Deposit.load(id);
  if (deposit) {
    return deposit;
  }

  deposit = new Deposit(id);
  deposit.vault = vault.id;
  deposit.depositor = depositor.id;
  deposit.shares = BigDecimal.fromString('0');
  deposit.since = event.block.timestamp.toI32();
  deposit.save();

  vault.depositCount = vault.depositCount + 1;
  vault.save();

  trackNetworkDeposits(event);

  return deposit;
}
