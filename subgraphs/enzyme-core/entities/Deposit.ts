import { toBigDecimal, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Account, Deposit, Vault } from '../generated/schema';
import { tokenBalance } from '../utils/tokenCalls';
import { ensureDepositor } from './Account';
import { trackNetworkDeposits } from './Network';
import { useVault } from './Vault';

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

export function trackDeposit(vaultAddress: Address, depositorAddress: Address, event: ethereum.Event): void {
  let id = vaultAddress.toHex() + '/' + depositorAddress.toHex() + '/' + event.block.number.toString();

  let balanceCallResult = tokenBalance(vaultAddress, depositorAddress);
  let balance = balanceCallResult ? toBigDecimal(balanceCallResult) : ZERO_BD;

  let depositor = ensureDepositor(depositorAddress, event);
  let vault = useVault(vaultAddress.toHex());
  let deposit = ensureDeposit(depositor, vault, event);

  deposit.shares = balance;
  deposit.save();
}
