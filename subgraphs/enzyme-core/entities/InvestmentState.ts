import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { logCritical } from '../../../utils/utils/logging';
import { toBigDecimal } from '../../../utils/utils/math';
import { Account, InvestmentState, Vault } from '../generated/schema';
import { VaultLibContract } from '../generated/VaultLibContract';
import { ensureInvestment } from './Investment';

function investmentStateId(investor: Account, fund: Vault, event: ethereum.Event): string {
  return fund.id + '/' + investor.id + '/' + event.block.timestamp.toString();
}

export function ensureInvestmentState(investor: Account, vault: Vault, event: ethereum.Event): InvestmentState {
  let id = investmentStateId(investor, vault, event);

  let investmentState = InvestmentState.load(id) as InvestmentState;
  if (investmentState) {
    return investmentState;
  }

  investmentState = new InvestmentState(id);
  investmentState.timestamp = event.block.timestamp;
  investmentState.vault = vault.id;
  investmentState.investor = investor.id;
  investmentState.shares = BigDecimal.fromString('0');
  investmentState.investment = ensureInvestment(investor, vault, id, event).id;
  investmentState.vaultState = vault.state;
  investmentState.save();

  return investmentState;
}

export function trackInvestmentState(investor: Account, vault: Vault, event: ethereum.Event): InvestmentState {
  let vaultProxy = VaultLibContract.bind(Address.fromString(vault.id));
  let balanceCall = vaultProxy.try_balanceOf(Address.fromString(investor.id));
  if (balanceCall.reverted) {
    logCritical('balanceOf() reverted for {}', [investor.id]);
  }

  let investmentState = ensureInvestmentState(investor, vault, event);
  investmentState.shares = toBigDecimal(balanceCall.value);
  investmentState.vaultState = vault.state;
  investmentState.save();

  let investment = ensureInvestment(investor, vault, investmentState.id, event);
  investment.shares = toBigDecimal(balanceCall.value);
  investment.save();

  return investmentState;
}
