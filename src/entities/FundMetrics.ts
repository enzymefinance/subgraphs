import { log, Entity, BigInt } from '@graphprotocol/graph-ts';
import {
  FundHoldingsMetric,
  FundSharesMetric,
  FundAggregatedMetric,
  FundHoldingMetric,
  Asset,
} from '../generated/schema';
import { Context } from '../context';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';

export function fundAggregatedMetricId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + event.block.timestamp.toString();
}

export function createFundAggregatedMetric(
  shares: FundSharesMetric,
  holdings: FundHoldingsMetric,
  context: Context,
): FundAggregatedMetric {
  let event = context.event;
  let fund = context.entities.fund;
  let metrics = new FundAggregatedMetric(fundAggregatedMetricId(context));
  metrics.timestamp = event.block.timestamp;
  metrics.fund = fund.id;
  metrics.shares = shares.id;
  metrics.holdings = holdings.id;
  metrics.events = [];
  metrics.save();

  return metrics;
}

export function ensureAggregatedMetric(context: Context): FundAggregatedMetric {
  let fund = context.entities.fund;
  let current = FundAggregatedMetric.load(fundAggregatedMetricId(context)) as FundAggregatedMetric;
  if (current) {
    return current;
  }

  let previous = useFundAggregatedMetric(fund.metrics);
  let shares = useFundSharesMetric(previous.shares);
  let holdings = useFundHoldingsMetric(previous.holdings);
  let metrics = createFundAggregatedMetric(shares, holdings, context);

  fund.metrics = metrics.id;

  fund.save();

  return metrics;
}

export function useFundAggregatedMetric(id: string): FundAggregatedMetric {
  let metrics = FundAggregatedMetric.load(id);
  if (metrics == null) {
    logCritical('Failed to load fund aggregated metrics {}.', [id]);
  }

  return metrics as FundAggregatedMetric;
}

export function fundSharesMetricId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + event.block.timestamp.toString() + '/shares';
}

export function createFundSharesMetric(shares: BigInt, cause: Entity | null, context: Context): FundSharesMetric {
  let event = context.event;
  let fund = context.entities.fund;
  let metric = new FundSharesMetric(fundSharesMetricId(context));
  metric.timestamp = event.block.timestamp;
  metric.fund = fund.id;
  metric.shares = shares;
  metric.events = cause ? [cause.getString('id')] : [];
  metric.save();

  return metric;
}

export function ensureFundSharesMetric(cause: Entity, context: Context): FundSharesMetric {
  let metric = FundSharesMetric.load(fundSharesMetricId(context)) as FundSharesMetric;

  if (!metric) {
    let aggregate = context.entities.metrics;
    let previous = useFundSharesMetric(aggregate.shares);
    metric = createFundSharesMetric(previous.shares, cause, context);
  } else {
    let events = metric.events;
    metric.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    metric.save();
  }

  return metric;
}

export function useFundSharesMetric(id: string): FundSharesMetric {
  let metric = FundSharesMetric.load(id);
  if (metric == null) {
    logCritical('Failed to load fund shares {}.', [id]);
  }

  return metric as FundSharesMetric;
}

export function fundHoldingsMetricId(context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + event.block.timestamp.toString() + '/holdings';
}

export function createFundHoldingsMetric(
  holdings: FundHoldingMetric[],
  cause: Entity | null,
  context: Context,
): FundHoldingsMetric {
  let event = context.event;
  let fund = context.entities.fund;
  let metric = new FundHoldingsMetric(fundHoldingsMetricId(context));
  metric.timestamp = event.block.timestamp;
  metric.fund = fund.id;
  metric.holdings = holdings.map<string>((item) => item.id);
  metric.events = cause ? [cause.getString('id')] : [];
  metric.save();

  return metric;
}

export function ensureFundHoldingsMetric(cause: Entity, context: Context): FundHoldingsMetric {
  let metric = FundHoldingsMetric.load(fundHoldingsMetricId(context)) as FundHoldingsMetric;

  if (!metric) {
    let aggregate = context.entities.metrics;
    let previous = useFundHoldingsMetric(aggregate.holdings).holdings;
    let records = previous.map<FundHoldingMetric>((id) => useFundHoldingMetric(id));
    metric = createFundHoldingsMetric(records, cause, context);
  } else {
    let events = metric.events;
    metric.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    metric.save();
  }

  return metric;
}

export function useFundHoldingsMetric(id: string): FundHoldingsMetric {
  let holdings = FundHoldingsMetric.load(id);
  if (holdings == null) {
    logCritical('Failed to load fund holdings {}.', [id]);
  }

  return holdings as FundHoldingsMetric;
}

function fundHoldingMetricId(asset: Asset, context: Context): string {
  let event = context.event;
  let fund = context.entities.fund;
  return fund.id + '/' + asset.id + '/' + event.block.timestamp.toString() + '/holding';
}

function createFundHoldingMetric(asset: Asset, quantity: BigInt, cause: Entity, context: Context): FundHoldingMetric {
  let event = context.event;
  let fund = context.entities.fund;
  let metric = new FundHoldingMetric(fundHoldingMetricId(asset, context));
  metric.timestamp = event.block.timestamp;
  metric.fund = fund.id;
  metric.asset = asset.id;
  metric.quantity = quantity;
  metric.events = [cause.getString('id')];
  metric.save();

  return metric;
}

export function useFundHoldingMetric(id: string): FundHoldingMetric {
  let holdings = FundHoldingMetric.load(id);
  if (holdings == null) {
    logCritical('Failed to load fund holdings {}.', [id]);
  }

  return holdings as FundHoldingMetric;
}

export function trackFundHoldings(assets: Asset[], cause: Entity, context: Context): FundHoldingsMetric {
  let metric = ensureFundHoldingsMetric(cause, context);
  let timestamp = context.event.block.timestamp;

  let previous: FundHoldingMetric[] = metric.holdings.map<FundHoldingMetric>((id) => useFundHoldingMetric(id));
  let ids = assets.map<string>((item) => item.id);

  // Create a list of all the previous fund holdings without the assets that we are
  // currently tracking for changes.
  let track: FundHoldingMetric[] = [];
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

    if (quantity.isZero()) {
      let match = findHolding(previous, asset);
      if (!match || (match.quantity.isZero() && match.timestamp < timestamp)) {
        continue;
      }
    }

    track.push(createFundHoldingMetric(asset, quantity, cause, context));
  }

  metric.holdings = track.map<string>((item) => item.id);
  metric.save();

  let aggregated = context.entities.metrics;
  let events = aggregated.events;
  aggregated.events = arrayUnique<string>(events.concat(metric.events));
  aggregated.holdings = metric.id;
  aggregated.save();

  let fund = context.entities.fund;
  fund.holdings = metric.id;
  fund.save();

  return metric;
}

export function trackFundShares(cause: Entity, context: Context): FundSharesMetric {
  let shares = ensureFundSharesMetric(cause, context);
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

function findHolding(holdings: FundHoldingMetric[], asset: Asset): FundHoldingMetric | null {
  for (let i: i32 = 0; i < holdings.length; i++) {
    if (holdings[i].asset == asset.id) {
      return holdings[i];
    }
  }

  return null;
}
