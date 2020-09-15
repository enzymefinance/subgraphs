import { BigDecimal } from '@graphprotocol/graph-ts';
import { NewFundDeployed } from '../generated/FundDeployerContract';
import { Fund, FundDeployment } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { ensureManager } from './Account';
import { ensureAsset } from './Asset';
import { ensureComptroller } from './Comptroller';
import { ensureContract } from './Contract';
import { ensureFundDeployer } from './FundDeployer';
import { createPortfolio } from './Portfolio';
import { createShares } from './Shares';
import { createState } from './State';
import { ensureTransaction } from './Transaction';

export function useFund(id: string): Fund {
  let fund = Fund.load(id);
  if (fund == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return fund as Fund;
}

export function createFund(event: NewFundDeployed): Fund {
  let id = event.params.vaultProxy.toHex();

  let fundDeployment = new FundDeployment(id);
  fundDeployment.timestamp = event.block.timestamp;
  fundDeployment.fund = id;
  fundDeployment.account = ensureManager(event.params.fundOwner).id;
  fundDeployment.contract = ensureContract(event.address, 'FundDeployer', event.block.timestamp).id;
  fundDeployment.comptrollerProxy = ensureComptroller(event.params.comptrollerProxy).id;
  fundDeployment.vaultProxy = event.params.vaultProxy.toHex();
  fundDeployment.fundOwner = ensureManager(event.params.fundOwner).id;
  fundDeployment.fundName = event.params.fundName;
  fundDeployment.denominationAsset = ensureAsset(event.params.denominationAsset).id;
  fundDeployment.feeManagerConfig = event.params.feeManagerConfig.toHex();
  fundDeployment.policyManagerConfig = event.params.policyManagerConfig.toHex();
  fundDeployment.transaction = ensureTransaction(event).id;
  fundDeployment.save();

  let fund = new Fund(id);
  let shares = createShares(BigDecimal.fromString('0'), fund, event, null);
  let portfolio = createPortfolio([], fund, event, null);
  // let payout = createPayout([], null, context);
  let state = createState(shares, portfolio, fund, event);

  // let fees = createFees(context);

  fund.name = event.params.fundName;
  fund.inception = event.block.timestamp;
  fund.deployer = ensureFundDeployer(event.address).id;
  fund.accessor = ensureComptroller(event.params.comptrollerProxy).id;
  fund.manager = ensureManager(event.params.fundOwner).id;
  fund.trackedAssets = [];
  fund.shares = shares.id;
  fund.portfolio = portfolio.id;
  fund.state = state.id;
  fund.status = 'None';
  fund.denominationAsset = ensureAsset(event.params.denominationAsset).id;
  fund.creator = ensureManager(event.params.fundOwner).id;
  fund.policies = [];
  // fund.payouts = payout.id;
  // fund.fees = fees.map<string>((fee) => fee.id);
  fund.save();

  return fund;
}
