import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Account, Fund, InvestmentState } from '../generated/schema';
import { VaultLibContract } from '../generated/VaultLibContract';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';
import { ensureInvestment } from './Investment';

function investmentStateId(investor: Account, fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + investor.id + '/' + event.block.timestamp.toString();
}

export function ensureInvestmentState(investor: Account, fund: Fund, event: ethereum.Event): InvestmentState {
  let id = investmentStateId(investor, fund, event);

  let investmentState = InvestmentState.load(id) as InvestmentState;
  if (investmentState) {
    return investmentState;
  }

  investmentState = new InvestmentState(id);
  investmentState.timestamp = event.block.timestamp;
  investmentState.fund = fund.id;
  investmentState.investor = investor.id;
  investmentState.shares = BigDecimal.fromString('0');
  investmentState.investment = ensureInvestment(investor, fund, id, event).id;
  investmentState.fundState = fund.state;
  investmentState.save();

  return investmentState;
}

export function trackInvestmentState(investor: Account, fund: Fund, event: ethereum.Event): InvestmentState {
  let vaultProxy = VaultLibContract.bind(Address.fromString(fund.id));
  let balanceCall = vaultProxy.try_balanceOf(Address.fromString(investor.id));
  if (balanceCall.reverted) {
    logCritical('balanceOf() reverted for {}', [investor.id]);
  }

  let investmentState = ensureInvestmentState(investor, fund, event);
  investmentState.shares = toBigDecimal(balanceCall.value);
  investmentState.fundState = fund.state;
  investmentState.save();

  let investment = ensureInvestment(investor, fund, investmentState.id, event);
  investment.shares = toBigDecimal(balanceCall.value);
  investment.save();

  return investmentState;
}
