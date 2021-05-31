import { BigDecimal } from '@graphprotocol/graph-ts';
import { NewFundCreated } from '../generated/FundDeployerContract';
import { Fund } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { ensureAccount, ensureManager } from './Account';
import { createFeeState } from './FeeState';
import { createFundState } from './FundState';
import { trackNetworkFunds } from './NetworkState';
import { createPortfolioState } from './PortfolioState';
import { ensureRelease } from './Release';
import { createShareState } from './ShareState';

export function useFund(id: string): Fund {
  let fund = Fund.load(id) as Fund;
  if (fund == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return fund;
}

export function createFund(event: NewFundCreated): Fund {
  let id = event.params.vaultProxy.toHex();

  let fund = new Fund(id);
  let shares = createShareState(
    fund,
    { totalSupply: BigDecimal.fromString('0'), outstandingForFees: BigDecimal.fromString('0') },
    event,
    null,
  );
  let portfolio = createPortfolioState([], fund, event, null);

  let feeState = createFeeState([], fund, event, null);
  let state = createFundState(shares, portfolio, feeState, 0, fund, event);

  fund.name = event.params.fundName;
  fund.inception = event.block.timestamp;
  fund.release = ensureRelease(event.address.toHex(), event).id;
  fund.accessor = event.params.comptrollerProxy.toHex();
  fund.manager = ensureManager(event.params.fundOwner, event).id;
  fund.creator = ensureAccount(event.params.creator, event).id;
  fund.trackedAssets = new Array<string>();
  fund.investmentCount = 0;
  fund.shares = shares.id;
  fund.portfolio = portfolio.id;
  fund.feeState = feeState.id;
  fund.state = state.id;

  fund.save();

  trackNetworkFunds(event);

  return fund;
}
