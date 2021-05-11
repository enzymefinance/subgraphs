import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Account, Investment, Vault } from '../generated/schema';
import { trackNetworkInvestments } from './NetworkState';

function investmentId(investor: Account, vault: Vault): string {
  return vault.id + '/' + investor.id;
}

export function ensureInvestment(investor: Account, vault: Vault, stateId: string, event: ethereum.Event): Investment {
  let id = investmentId(investor, vault);

  let investment = Investment.load(id) as Investment;
  if (investment) {
    return investment;
  }

  investment = new Investment(id);
  investment.vault = vault.id;
  investment.investor = investor.id;
  investment.shares = BigDecimal.fromString('0');
  investment.state = stateId;
  investment.since = event.block.timestamp;
  investment.save();

  vault.investmentCount = vault.investmentCount + 1;
  vault.save();

  trackNetworkInvestments(event);

  return investment;
}
