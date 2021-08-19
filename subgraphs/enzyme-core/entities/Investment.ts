import { logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { ERC20Contract } from '../generated/ERC20Contract';
import { Account, Investment, Vault } from '../generated/schema';
import { trackNetworkInvestments } from './Network';

function investmentId(participant: Account, vault: Vault): string {
  return vault.id + '/' + participant.id;
}

export function ensureInvestment(investor: Account, vault: Vault, event: ethereum.Event): Investment {
  let id = investmentId(investor, vault);

  let investment = Investment.load(id) as Investment;
  if (investment) {
    return investment;
  }

  investment = new Investment(id);
  investment.vault = vault.id;
  investment.investor = investor.id;
  investment.shares = BigDecimal.fromString('0');
  investment.since = event.block.timestamp;
  investment.save();

  vault.investmentCount = vault.investmentCount + 1;
  vault.save();

  trackNetworkInvestments(event);

  return investment;
}

export function trackInvestmentBalance(vault: Vault, investment: Investment): void {
  let vaultProxy = ERC20Contract.bind(Address.fromString(vault.id));
  let balanceCall = vaultProxy.try_balanceOf(Address.fromString(investment.investor));
  if (balanceCall.reverted) {
    logCritical('balanceOf() reverted for account {} on vault {}', [investment.investor, vault.id]);
  }

  investment.shares = toBigDecimal(balanceCall.value);
  investment.save();
}
