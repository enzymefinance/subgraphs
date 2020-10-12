import { BigDecimal } from '@graphprotocol/graph-ts';
import { NewFundCreated } from '../generated/FundDeployerContract';
import { Fund } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { ensureAccount, ensureManager } from './Account';
import { useAsset } from './Asset';
import { createFeePayout } from './FeePayout';
import { createPortfolio } from './Portfolio';
import { useRelease } from './Release';
import { createShares } from './Shares';
import { createState } from './State';

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
  let shares = createShares(BigDecimal.fromString('0'), fund, event, null);
  let portfolio = createPortfolio([], fund, event, null);
  let feePayout = createFeePayout([], fund, event, null);
  let state = createState(shares, portfolio, feePayout, fund, event);

  fund.name = event.params.fundName;
  fund.inception = event.block.timestamp;
  fund.release = useRelease(event.address.toHex()).id;
  fund.accessor = event.params.comptrollerProxy.toHex();
  fund.manager = ensureManager(event.params.fundOwner, event).id;
  fund.creator = ensureAccount(event.params.creator, event).id;
  fund.trackedAssets = [];
  fund.shares = shares.id;
  fund.portfolio = portfolio.id;
  fund.feePayout = feePayout.id;
  fund.state = state.id;
  fund.denominationAsset = useAsset(event.params.denominationAsset.toHex()).id;
  fund.save();

  return fund;
}
