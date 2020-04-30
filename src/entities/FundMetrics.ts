import { log, Entity, BigInt } from '@graphprotocol/graph-ts';
import { Portfolio, Share, State, Holding, Asset } from '../generated/schema';
import { Context } from '../context';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';

export function StateId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + event.block.timestamp.toString();
}

export function createState(shares: Share, holdings: Portfolio, context: Context): State {
  let event = context.event;
  let fund = context.entities.fund;
  let metrics = new State(StateId(context));
  metrics.timestamp = event.block.timestamp;
  metrics.fund = fund.id;
  metrics.shares = shares.id;
  metrics.portfolio = holdings.id;
  metrics.events = [];
  metrics.save();

  return metrics;
}

export function ensureAggregatedMetric(context: Context): State {
  let fund = context.entities.fund;
  let current = State.load(StateId(context)) as State;
  if (current) {
    return current;
  }

  let previous = useState(fund.metrics);
  let shares = useShares(previous.shares);
  let holdings = usePortfolio(previous.portfolio);
  let metrics = createState(shares, holdings, context);

  fund.metrics = metrics.id;

  fund.save();

  return metrics;
}

export function useState(id: string): State {
  let metrics = State.load(id);
  if (metrics == null) {
    logCritical('Failed to load fund aggregated metrics {}.', [id]);
  }

  return metrics as State;
}

export function shareId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + event.block.timestamp.toString() + '/shares';
}

export function createShares(shares: BigInt, cause: Entity | null, context: Context): Share {
  let event = context.event;
  let fund = context.entities.fund;
  let metric = new Share(shareId(context));
  metric.timestamp = event.block.timestamp;
  metric.fund = fund.id;
  metric.shares = shares;
  metric.events = cause ? [cause.getString('id')] : [];
  metric.save();

  return metric;
}

export function ensureShares(cause: Entity, context: Context): Share {
  let metric = Share.load(shareId(context)) as Share;

  if (!metric) {
    let aggregate = context.entities.metrics;
    let previous = useShares(aggregate.shares);
    metric = createShares(previous.shares, cause, context);
  } else {
    let events = metric.events;
    metric.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    metric.save();
  }

  return metric;
}

export function useShares(id: string): Share {
  let metric = Share.load(id);
  if (metric == null) {
    logCritical('Failed to load fund shares {}.', [id]);
  }

  return metric as Share;
}

export function PortfolioId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + event.block.timestamp.toString() + '/holdings';
}

export function createPortfolio(holdings: Holding[], cause: Entity | null, context: Context): Portfolio {
  let event = context.event;
  let fund = context.entities.fund;
  let metric = new Portfolio(PortfolioId(context));
  metric.timestamp = event.block.timestamp;
  metric.fund = fund.id;
  metric.holdings = holdings.map<string>((item) => item.id);
  metric.events = cause ? [cause.getString('id')] : [];
  metric.save();

  return metric;
}

export function ensurePortfolio(cause: Entity, context: Context): Portfolio {
  let metric = Portfolio.load(PortfolioId(context)) as Portfolio;

  if (!metric) {
    let aggregate = context.entities.metrics;
    let previous = usePortfolio(aggregate.portfolio).holdings;
    let records = previous.map<Holding>((id) => useHolding(id));
    metric = createPortfolio(records, cause, context);
  } else {
    let events = metric.events;
    metric.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    metric.save();
  }

  return metric;
}

export function usePortfolio(id: string): Portfolio {
  let holdings = Portfolio.load(id);
  if (holdings == null) {
    logCritical('Failed to load fund holdings {}.', [id]);
  }

  return holdings as Portfolio;
}

function fundHoldingId(asset: Asset, context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + asset.id + '/' + event.block.timestamp.toString() + '/holding';
}

function createHolding(asset: Asset, quantity: BigInt, cause: Entity, context: Context): Holding {
  let event = context.event;
  let fund = context.entities.fund;
  let metric = new Holding(fundHoldingId(asset, context));
  metric.timestamp = event.block.timestamp;
  metric.fund = fund.id;
  metric.asset = asset.id;
  metric.quantity = quantity;
  metric.events = [cause.getString('id')];
  metric.save();

  return metric;
}

export function useHolding(id: string): Holding {
  let holdings = Holding.load(id);
  if (holdings == null) {
    logCritical('Failed to load fund holdings {}.', [id]);
  }

  return holdings as Holding;
}

export function trackFundPortfolio(assets: Asset[], cause: Entity, context: Context): Portfolio {
  let metric = ensurePortfolio(cause, context);
  let timestamp = context.event.block.timestamp;

  let previous: Holding[] = metric.holdings.map<Holding>((id) => useHolding(id));
  let ids = assets.map<string>((item) => item.id);

  // Create a list of all the previous fund holdings without the assets that we are
  // currently tracking for changes.
  let track: Holding[] = [];
  for (let k: i32 = 0; k < previous.length; k++) {
    let prev = previous[k];

    // Don't carry over holdings with a quantity of '0' to  the next metrics entry.
    // We only track these once when they become 0 initially (e.g. full redemption)
    // but we don't want to keep them in the holdings metrics forever.
    if (prev.quantity.isZero() && prev.timestamp < timestamp) {
      continue;
    }

    if (ids.indexOf(prev.asset) == -1) {
      track.push(prev);
    }
  }

  let holdings = context.contracts.accounting.getFundHoldings();
  for (let i: i32 = 0; i < assets.length; i++) {
    // By default, we set the value to 0. This is necessary to track records for
    // assets that have been removed from the holdings at least once when they
    // become 0. We will remove these when we track the fund holdings the next
    // time.
    let quantity = BigInt.fromI32(0);
    let asset = assets[i];

    // Get the quantities for the selected assets from the contract call results.
    for (let j: i32 = 0; j < holdings.value0.length; j++) {
      if (holdings.value1[j].toHex() == asset.id) {
        quantity = holdings.value0[j];
        break;
      }
    }

    // Add the fund holding entry for the current asset.
    //
    // TODO: Should we add a check so that 0s don't get added if the value was
    // previously already untracked or 0? This should not happen, but who knows ...

    // (quantity = 0 && previous quantity not existant or zero) => don't add
    // loop over pre

    let match = findHolding(previous, asset) as Holding;

    if (quantity.isZero() && (!match || (match.quantity.isZero() && match.timestamp < timestamp))) {
      continue;
    }

    track.push(createHolding(asset, quantity, cause, context));
  }

  metric.holdings = track.map<string>((item) => item.id);
  metric.save();

  let aggregated = context.entities.metrics;
  let events = aggregated.events;
  aggregated.events = arrayUnique<string>(events.concat(metric.events));
  aggregated.portfolio = metric.id;
  aggregated.save();

  let fund = context.entities.fund;
  fund.holdings = metric.id;
  fund.save();

  return metric;
}

export function trackFundShares(cause: Entity, context: Context): Share {
  let shares = ensureShares(cause, context);
  shares.shares = context.contracts.shares.totalSupply();
  shares.save();

  let aggregated = context.entities.metrics;
  let events = aggregated.events;
  aggregated.events = arrayUnique<string>(events.concat(shares.events));
  aggregated.shares = shares.id;
  aggregated.save();

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
