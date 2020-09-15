import { BigDecimal } from '@graphprotocol/graph-ts';
import { NewFundDeployed } from '../generated/FundDeployerContract';
import { Fund } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { ensureAccount, ensureManager } from './Account';
import { ensureAsset } from './Asset';
import { ensureComptroller } from './Comptroller';
import { ensureFundDeployer } from './FundDeployer';
import { useRelease } from './Release';
import { createPortfolio } from './Portfolio';
import { createShares } from './Shares';
import { createState } from './State';

export function useFund(id: string): Fund {
  let fund = Fund.load(id);
  if (fund == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return fund as Fund;
}

export function createFund(event: NewFundDeployed): Fund {
  let id = event.params.vaultProxy.toHex();

  let fund = new Fund(id);
  let shares = createShares(BigDecimal.fromString('0'), fund, event, null);
  let portfolio = createPortfolio([], fund, event, null);
  // let payout = createPayout([], null, context);
  let state = createState(shares, portfolio, fund, event);

  // let fees = createFees(context);

  fund.name = event.params.fundName;
  fund.inception = event.block.timestamp;
  fund.deployer = ensureFundDeployer(event.address).id;
  // Release ID is the FundDeployer address
  fund.release = useRelease(event.address).id;
  fund.accessor = ensureComptroller(event.params.comptrollerProxy).id;
  fund.manager = ensureManager(event.params.fundOwner, event).id;
  fund.creator = ensureAccount(event.params.caller, event).id;
  fund.trackedAssets = [];
  fund.shares = shares.id;
  fund.portfolio = portfolio.id;
  fund.state = state.id;
  fund.status = 'None';
  fund.denominationAsset = ensureAsset(event.params.denominationAsset).id;
  fund.policies = [];
  // fund.payouts = payout.id;
  // fund.fees = fees.map<string>((fee) => fee.id);
  fund.save();

  return fund;
}
