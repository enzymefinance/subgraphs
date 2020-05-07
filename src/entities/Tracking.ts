import { Entity, BigInt, BigDecimal, Address, log } from '@graphprotocol/graph-ts';
import { Portfolio, Share, State, Holding, Asset, Payout, FeePayout } from '../generated/schema';
import { Context } from '../context';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/tokenValue';
import { Fee, ensureManagementFee, ensurePerformanceFee } from './Fee';
import { PerformanceFeeContract } from '../generated/PerformanceFeeContract';

export function stateId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + event.block.timestamp.toString();
}

export function createState(shares: Share, holdings: Portfolio, payouts: Payout, context: Context): State {
  let event = context.event;
  let fund = context.entities.fund;
  let state = new State(stateId(context));
  state.timestamp = event.block.timestamp;
  state.fund = fund.id;
  state.shares = shares.id;
  state.portfolio = holdings.id;
  state.payouts = payouts.id;
  state.events = [];
  state.save();

  // load additional infos

  return state;
}

export function ensureState(context: Context): State {
  let fund = context.entities.fund;
  let current = State.load(stateId(context)) as State;
  if (current) {
    return current;
  }

  let previous = useState(fund.state);
  let shares = useShares(previous.shares);
  let holdings = usePortfolio(previous.portfolio);
  let payouts = usePayout(previous.payouts);
  let state = createState(shares, holdings, payouts, context);

  fund.state = state.id;
  fund.save();

  return state;
}

export function useState(id: string): State {
  let state = State.load(id);
  if (state == null) {
    logCritical('Failed to load fund aggregated state {}.', [id]);
  }

  return state as State;
}

export function shareId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + event.block.timestamp.toString() + '/shares';
}

export function createShares(shares: BigDecimal, cause: Entity | null, context: Context): Share {
  let event = context.event;
  let fund = context.entities.fund;
  let entity = new Share(shareId(context));
  entity.timestamp = event.block.timestamp;
  entity.fund = fund.id;
  entity.shares = shares;
  entity.events = cause ? [cause.getString('id')] : [];
  entity.save();

  return entity;
}

export function ensureShares(cause: Entity, context: Context): Share {
  let shares = Share.load(shareId(context)) as Share;

  if (!shares) {
    let aggregate = context.entities.state;
    let previous = useShares(aggregate.shares);
    shares = createShares(previous.shares, cause, context);
  } else {
    let events = shares.events;
    shares.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    shares.save();
  }

  return shares;
}

export function useShares(id: string): Share {
  let shares = Share.load(id);
  if (shares == null) {
    logCritical('Failed to load fund shares {}.', [id]);
  }

  return shares as Share;
}

export function portfolioId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + event.block.timestamp.toString() + '/holdings';
}

export function createPortfolio(holdings: Holding[], cause: Entity | null, context: Context): Portfolio {
  let event = context.event;
  let fund = context.entities.fund;
  let portfolio = new Portfolio(portfolioId(context));
  portfolio.timestamp = event.block.timestamp;
  portfolio.fund = fund.id;
  portfolio.holdings = holdings.map<string>((item) => item.id);
  portfolio.events = cause ? [cause.getString('id')] : [];
  portfolio.save();

  return portfolio;
}

export function ensurePortfolio(cause: Entity, context: Context): Portfolio {
  let portfolio = Portfolio.load(portfolioId(context)) as Portfolio;

  if (!portfolio) {
    let state = context.entities.state;
    let previous = usePortfolio(state.portfolio).holdings;
    let records = previous.map<Holding>((id) => useHolding(id));
    portfolio = createPortfolio(records, cause, context);
  } else {
    let events = portfolio.events;
    portfolio.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    portfolio.save();
  }

  return portfolio;
}

export function usePortfolio(id: string): Portfolio {
  let porfolio = Portfolio.load(id);
  if (porfolio == null) {
    logCritical('Failed to load fund porfolio {}.', [id]);
  }

  return porfolio as Portfolio;
}

function holdingId(asset: Asset, context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + asset.id + '/' + event.block.timestamp.toString() + '/holding';
}

function createHolding(asset: Asset, quantity: BigDecimal, cause: Entity, context: Context): Holding {
  let event = context.event;
  let fund = context.entities.fund;
  let holding = new Holding(holdingId(asset, context));
  holding.timestamp = event.block.timestamp;
  holding.fund = fund.id;
  holding.asset = asset.id;
  holding.quantity = quantity;
  holding.events = [cause.getString('id')];
  holding.save();

  return holding;
}

export function useHolding(id: string): Holding {
  let holdings = Holding.load(id);
  if (holdings == null) {
    logCritical('Failed to load fund holdings {}.', [id]);
  }

  return holdings as Holding;
}

export function trackFundPortfolio(assets: Asset[], cause: Entity, context: Context): Portfolio {
  let portfolio = ensurePortfolio(cause, context);
  let holdings: Holding[] = portfolio.holdings.map<Holding>((id) => useHolding(id));
  let updates = context.contracts.accounting.getFundHoldings();

  for (let i: i32 = 0; i < assets.length; i++) {
    // By default, we set the value to 0. This is necessary to track records for
    // assets that have been removed from the holdings at least once when they
    // become 0. We will remove these when we track the fund holdings the next
    // time.
    let quantity = BigDecimal.fromString('0');
    let asset = assets[i];

    // Get the quantities for the selected assets from the contract call results.
    for (let j: i32 = 0; j < updates.value0.length; j++) {
      if (updates.value1[j].toHex() == asset.id) {
        quantity = toBigDecimal(updates.value0[j], asset.decimals);
        break;
      }
    }

    // Add the fund holding entry for the current asset unless it's 0.
    if (!quantity.digits.isZero()) {
      let match = findHolding(holdings, asset) as Holding;

      // Re-use the previous holding entry unless it has changed.
      if (!(match != null && match.quantity == quantity)) {
        // Prepend updated items to the array.
        holdings.unshift(createHolding(asset, quantity, cause, context));
      }
    }
  }

  // Eliminate old holdings from the array by only keeping the first copy for each asset.
  portfolio.holdings = uniqueHoldings(holdings).map<string>((item) => item.id);
  portfolio.save();

  let state = context.entities.state;
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(portfolio.events));
  state.portfolio = portfolio.id;
  state.save();

  let fund = context.entities.fund;
  fund.portfolio = portfolio.id;
  fund.save();

  return portfolio;
}

export function trackFundShares(cause: Entity, context: Context): Share {
  let shares = ensureShares(cause, context);
  shares.shares = toBigDecimal(context.contracts.shares.totalSupply());
  shares.save();

  let state = context.entities.state;
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(shares.events));
  state.shares = shares.id;
  state.save();

  let fund = context.entities.fund;
  fund.shares = shares.id;
  fund.save();

  return shares;
}

function findHolding(holdings: Holding[], asset: Asset): Holding | null {
  for (let i: i32 = 0; i < holdings.length; i++) {
    if (holdings[i].asset == asset.id) {
      return holdings[i];
    }
  }

  return null;
}

export function payoutId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + event.block.timestamp.toString() + '/payout';
}

export function createPayout(feePayouts: FeePayout[], cause: Entity | null, context: Context): Payout {
  let event = context.event;
  let fund = context.entities.fund;
  let payout = new Payout(payoutId(context));
  payout.timestamp = event.block.timestamp;
  payout.fund = fund.id;
  payout.shares = BigDecimal.fromString('0');
  payout.feePayouts = feePayouts.map<string>((item) => item.id);
  payout.events = cause ? [cause.getString('id')] : [];
  payout.save();

  return payout;
}

export function ensurePayout(cause: Entity, context: Context): Payout {
  let payout = Payout.load(payoutId(context)) as Payout;

  if (!payout) {
    let state = context.entities.state;
    let previous = usePayout(state.payouts).feePayouts;
    let records = previous.map<FeePayout>((id) => useFeePayout(id));
    payout = createPayout(records, cause, context);
  } else {
    let events = payout.events;
    payout.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    payout.save();
  }

  return payout;
}

export function usePayout(id: string): Payout {
  let payout = Payout.load(id);
  if (payout == null) {
    logCritical('Failed to load payout entity {}.', [id]);
  }

  return payout as Payout;
}

function feePayoutId(fee: Fee, context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + event.block.timestamp.toString() + '/fee/' + fee.identifier;
}

function createFeePayout(fee: Fee, shares: BigDecimal, cause: Entity, context: Context): FeePayout {
  let event = context.event;
  let fund = context.entities.fund;
  let feePayout = new FeePayout(feePayoutId(fee, context));
  feePayout.timestamp = event.block.timestamp;
  feePayout.fund = fund.id;
  feePayout.fee = fee.id;
  feePayout.kind = fee.identifier;
  feePayout.shares = shares;
  feePayout.events = [cause.getString('id')];
  feePayout.save();

  return feePayout;
}

export function ensureFeePayout(fee: Fee, shares: BigDecimal, cause: Entity, context: Context): FeePayout {
  let feePayout = FeePayout.load(feePayoutId(fee, context)) as FeePayout;

  if (!feePayout) {
    feePayout = createFeePayout(fee, shares, cause, context);
  } else {
    let events = feePayout.events;
    feePayout.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    feePayout.save();
  }

  return feePayout;
}

export function useFeePayout(id: string): FeePayout {
  let feePayout = FeePayout.load(id);
  if (feePayout == null) {
    logCritical('Failed to load fee payout {}.', [id]);
  }

  return feePayout as FeePayout;
}

export function trackPayout(shares: BigDecimal, cause: Entity, context: Context): Payout {
  let fund = context.entities.fund;
  // let sharesSet = cause.isSet('shares');
  // log.warning('sharesSet {}', [sharesSet ? 'true' : 'false']);
  // let shares = cause.get('shares');
  // if (shares) {
  //   logCritical('shares {}', [shares.toString()]);
  // }
  // let shares = BigDecimal.fromString(cause.isSet('shares') ? cause.getString('shares') : '');

  let feeAddresses = fund.fees;
  let mgmtFee = ensureManagementFee(feeAddresses[0], context);

  let mgmtFeePayoutId = feePayoutId(mgmtFee as Fee, context);
  let feePayout = FeePayout.load(mgmtFeePayoutId);

  if (!feePayout) {
    // first fee payout event in a block is always management fee (shares can be zero or not)
    feePayout = createFeePayout(mgmtFee as Fee, shares, cause, context);
  } else if (shares.gt(BigDecimal.fromString('0'))) {
    // any subsequent event with non-zero shares is performance fee payout
    let perfFee = ensurePerformanceFee(feeAddresses[1], context);

    let perfFeePayoutId = feePayoutId(perfFee as Fee, context);
    feePayout = FeePayout.load(perfFeePayoutId);

    if (!feePayout) {
      let feeManagerAddress = Address.fromString(context.fees);
      feePayout = createFeePayout(perfFee as Fee, shares, cause, context);

      let perfFeeContract = PerformanceFeeContract.bind(Address.fromString(feeAddresses[1]));
      feePayout.highWaterMark = perfFeeContract.highWaterMark(feeManagerAddress).toBigDecimal();
      feePayout.save();
    }
  }

  let payout = ensurePayout(cause, context);
  payout.shares = payout.shares.plus(shares);
  payout.feePayouts = payout.feePayouts.concat([feePayout.id]);
  payout.save();

  let state = context.entities.state;
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(payout.events));
  state.payouts = payout.id;
  state.save();

  fund.payouts = payout.id;
  fund.save();

  return payout;
}

function uniqueHoldings(holdings: Holding[]): Holding[] {
  let references = holdings.map<string>((item) => item.asset);
  let unique: Holding[] = [];
  for (let i: i32 = 0; i < references.length; i++) {
    if (references.indexOf(references[i]) == i) {
      unique.push(holdings[i]);
    }
  }

  return unique;
}
