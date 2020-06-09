import { Entity, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import {
  Portfolio,
  Share,
  State,
  Holding,
  Asset,
  Payout,
  ManagementFeePayout,
  PerformanceFeePayout,
} from '../generated/schema';
import { Context } from '../context';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/tokenValue';
import { Fee, ensureManagementFee, ensurePerformanceFee } from './Fee';
import {
  IndividualPayout,
  useManagementFeePayout,
  usePerformanceFeePayout,
  ensureManagementFeePayout,
  ensurePerformanceFeePayout,
} from './IndividualPayout';
import { useAsset } from './Asset';

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
  return fund.id + '/' + event.block.timestamp.toString() + '/portfolio';
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

export function trackFundPortfolio(cause: Entity, context: Context): Portfolio {
  let portfolio = ensurePortfolio(cause, context);
  let previousHoldings: Holding[] = portfolio.holdings.map<Holding>((id) => useHolding(id));
  let nextHoldings: Holding[] = [];
  let updates = context.contracts.accounting.getFundHoldings();

  for (let i: i32 = 0; i < updates.value0.length; i++) {
    let asset = useAsset(updates.value1[i].toHex());
    let quantity = toBigDecimal(updates.value0[i], asset.decimals);

    // Add the fund holding entry for the current asset unless it's 0.
    if (!quantity.digits.isZero()) {
      let match = findHolding(previousHoldings, asset) as Holding;

      // Re-use the previous holding entry unless it has changed.
      if (match != null && match.quantity == quantity) {
        nextHoldings.push(match);
      } else {
        nextHoldings.push(createHolding(asset, quantity, cause, context));
      }
    }
  }

  portfolio.holdings = nextHoldings.map<string>((item) => item.id);
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

export function createPayout(feePayouts: IndividualPayout[], cause: Entity | null, context: Context): Payout {
  let event = context.event;
  let fund = context.entities.fund;
  let payout = new Payout(payoutId(context));
  payout.timestamp = event.block.timestamp;
  payout.fund = fund.id;
  payout.shares = BigDecimal.fromString('0');
  payout.payouts = feePayouts.map<string>((item) => item.id);
  payout.events = cause ? [cause.getString('id')] : [];
  payout.save();

  return payout;
}

export function ensurePayout(cause: Entity, context: Context): Payout {
  let payout = Payout.load(payoutId(context)) as Payout;

  if (!payout) {
    let state = context.entities.state;
    let previous = usePayout(state.payouts).payouts;
    let records = previous.map<IndividualPayout>((id, index) => {
      if (index != 0 && index != 1) {
        logCritical('Unknown fee index');
      }

      if (index == 0) {
        return useManagementFeePayout(id) as IndividualPayout;
      }

      return usePerformanceFeePayout(id) as IndividualPayout;
    });

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

export function trackPayout(shares: BigDecimal, cause: Entity, context: Context): Payout {
  let fund = context.entities.fund;

  let payout = ensurePayout(cause, context);
  payout.shares = payout.shares.plus(shares);

  // first fee payout event in a block is always management fee (shares can be zero or not)
  // more...
  // any subsequent event with non-zero shares is performance fee payout

  let previous = payout.payouts;
  let timestamps = previous.map<BigInt>((id, index) => {
    if (index != 0 && index != 1) {
      logCritical('Unknown fee index');
    }

    if (index == 0) {
      return useManagementFeePayout(id).timestamp;
    }

    return usePerformanceFeePayout(id).timestamp;
  });

  // There can be several fee payments in the same block.
  // We know that the first fee that is paid out is always the management fee.
  // Any subsequent fee can be either management fee or performance fee.
  // Since management fee has already been paid out as the first fee,
  // any subsequent management fee payment has to be zero (no further management fee within a block).
  // So the first non zero fee after the management fee is necessarily the performance fee.
  // ;)
  if (!timestamps.length) {
    previous[0] = trackManagementFee(shares, cause, context).id;
  } else if (timestamps[0].lt(context.event.block.timestamp)) {
    previous[0] = trackManagementFee(shares, cause, context).id;
  } else if (!shares.digits.isZero()) {
    previous[1] = trackPerformanceFee(shares, cause, context).id;
  }
  payout.payouts = previous;
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

function trackManagementFee(shares: BigDecimal, cause: Entity, context: Context): ManagementFeePayout {
  let fund = context.entities.fund;
  let feeAddresses = fund.fees;
  let mgmtFee = ensureManagementFee(feeAddresses[0], context);

  return ensureManagementFeePayout(mgmtFee as Fee, shares, cause, context);
}

function trackPerformanceFee(shares: BigDecimal, cause: Entity, context: Context): PerformanceFeePayout {
  let fund = context.entities.fund;
  let feeAddresses = fund.fees;

  let perfFee = ensurePerformanceFee(feeAddresses[1], context);

  let individualPayout = ensurePerformanceFeePayout(perfFee as Fee, shares, cause, context);

  return individualPayout;
}
