import { BigDecimal } from '@graphprotocol/graph-ts';
import { NewFundDeployed } from '../generated/FundDeployerContract';
import { Fund, FundCreation } from '../generated/schema';
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
  let fund = new Fund(event.params.vaultProxy.toHex());

  let shares = createShares(BigDecimal.fromString('0'), fund, event, null);
  let portfolio = createPortfolio([], fund, event, null);
  // let payout = createPayout([], null, context);
  let state = createState(shares, portfolio, fund, event);

  // let fees = createFees(context);

  fund.name = event.params.fundName;
  fund.inception = event.block.timestamp;
  fund.deployer = ensureFundDeployer(event.address).id;
  fund.comptroller = ensureComptroller(event.params.comptrollerProxy).id;
  fund.manager = ensureManager(event.params.fundOwner).id;
  fund.trackedAssets = [];
  fund.shares = shares.id;
  fund.portfolio = portfolio.id;
  fund.state = state.id;
  fund.status = 'None';
  fund.denominationAsset = ensureAsset(event.params.denominationAsset).id;
  // fund.payouts = payout.id;
  // fund.fees = fees.map<string>((fee) => fee.id);
  fund.save();

  let fundCreation = new FundCreation(fund.id);
  fundCreation.timestamp = fund.inception;
  fundCreation.fund = fund.id;
  fundCreation.account = fund.manager;
  fundCreation.contract = ensureContract(event.address, 'FundDeployer', event.block.timestamp).id;
  fundCreation.transaction = ensureTransaction(event).id;
  fundCreation.save();

  return fund;
}

// function investableAssets(context: Context): Asset[] {
//   let participation = context.contracts.participation;
//   let assets = context.entities.version.assets;
//   let investable: Asset[] = [];
//   for (let i: i32 = 0; i < assets.length; i++) {
//     if (!participation.investAllowed(Address.fromString(assets[i]))) {
//       continue;
//     }

//     investable.push(useAsset(assets[i]));
//   }

//   return investable;
// }
