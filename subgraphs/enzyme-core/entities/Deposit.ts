import { logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { ERC20Contract } from '../generated/ERC20Contract';
import { Account, Deposit, Vault } from '../generated/schema';
import { trackBalanceOfMetric } from './Metric';
import { trackNetworkDeposits } from './Network';

function depositId(depositor: Account, vault: Vault): string {
  return vault.id + '/' + depositor.id;
}

export function ensureDeposit(investor: Account, vault: Vault, event: ethereum.Event): Deposit {
  let id = depositId(investor, vault);

  let deposit = Deposit.load(id) as Deposit;
  if (deposit) {
    return deposit;
  }

  deposit = new Deposit(id);
  deposit.vault = vault.id;
  deposit.depositor = investor.id;
  deposit.shares = BigDecimal.fromString('0');
  deposit.since = event.block.timestamp.toI32();
  deposit.save();

  vault.depositCount = vault.depositCount + 1;
  vault.save();

  trackNetworkDeposits(event);

  return deposit;
}

export function trackDepositBalance(vault: Vault, investment: Deposit, event: ethereum.Event): void {
  let vaultAddress = Address.fromString(vault.id);
  let depositorAddress = Address.fromString(investment.depositor);

  let vaultProxy = ERC20Contract.bind(vaultAddress);
  let balanceCall = vaultProxy.try_balanceOf(depositorAddress);
  if (balanceCall.reverted) {
    logCritical('balanceOf() reverted for account {} on vault {}', [investment.depositor, vault.id]);
  }

  let balance = toBigDecimal(balanceCall.value);

  investment.shares = balance;
  investment.save();

  trackBalanceOfMetric(vaultAddress, depositorAddress, balance, event);
}
