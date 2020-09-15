import { MigrationSignaled } from '../generated/DispatcherContract';
import { Migration } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useMigration(id: string): Migration {
  let migration = Migration.load(id);
  if (migration == null) {
    logCritical('Failed to load migration {}.', [id]);
  }

  return migration as Migration;
}

export function createMigration(event: MigrationSignaled): Fund {
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
