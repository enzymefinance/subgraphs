import { log, Entity, BigInt, Address } from '@graphprotocol/graph-ts';
import {
  FundHoldingsMetric,
  FundSharesMetric,
  FundAggregatedMetric,
  FundHoldingMetric,
  Asset,
} from '../generated/schema';
import { Context } from '../context';
import { arrayUnique } from '../utils/arrayUnique';

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
    log.critical('Failed to load fund aggregated metrics {}.', [id]);
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
    metric.events = arrayUnique<string>(metric.events.concat([cause.getString('id')]));
    metric.save();
  }

  return metric;
}

export function useFundSharesMetric(id: string): FundSharesMetric {
  let metric = FundSharesMetric.load(id);
  if (metric == null) {
    log.critical('Failed to load fund shares {}.', [id]);
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
    let previous = useFundHoldingsMetric(aggregate.holdings);
    let records = previous.holdings.map<FundHoldingMetric>((id) => useFundHoldingMetric(id));
    metric = createFundHoldingsMetric(records, cause, context);
  } else {
    metric.events = arrayUnique<string>(metric.events.concat([cause.getString('id')]));
    metric.save();
  }

  return metric;
}

export function useFundHoldingsMetric(id: string): FundHoldingsMetric {
  let holdings = FundHoldingsMetric.load(id);
  if (holdings == null) {
    log.critical('Failed to load fund holdings {}.', [id]);
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

function useFundHoldingMetric(id: string): FundHoldingMetric {
  let holdings = FundHoldingMetric.load(id);
  if (holdings == null) {
    log.critical('Failed to load fund holdings {}.', [id]);
  }

  return holdings as FundHoldingMetric;
}

export function trackFundHoldings(assets: Asset[], cause: Entity, context: Context): FundHoldingsMetric {
  let metric = ensureFundHoldingsMetric(cause, context);
  let holdings: FundHoldingMetric[] = metric.holdings.map<FundHoldingMetric>((id) => useFundHoldingMetric(id));
  let result = context.contracts.accounting.getFundHoldings();

  for (let i: i32 = 0; i < assets.length; i++) {
    let asset = assets[i];
    let quantity = BigInt.fromI32(0);

    // Remove the previous record for this asset from the list.
    for (let k: i32 = 0; k < holdings.length; k++) {
      if (holdings[k].asset == asset.id) {
        holdings = holdings.splice(k, 1);
        break;
      }
    }

    // Get the quantities for the selected assets from the contract call result.
    for (let j: i32 = 0; j < result.value0.length; j++) {
      if (result.value1[j].toHex() == asset.id) {
        quantity = result.value0[j];
        break;
      }
    }

    // Create the fund holding entry for the current asset.
    let current = createFundHoldingMetric(asset, quantity, cause, context);
    holdings = holdings.concat([current]);
  }

  metric.holdings = holdings.map<string>((item) => item.id);
  metric.save();

  let aggregated = context.entities.metrics;
  aggregated.events = arrayUnique<string>(aggregated.events.concat(metric.events));
  aggregated.holdings = metric.id;
  aggregated.save();

  return metric;
}

export function trackFundShares(cause: Entity, context: Context): FundSharesMetric {
  let shares = ensureFundSharesMetric(cause, context);
  shares.shares = context.contracts.shares.totalSupply();
  shares.save();

  let aggregated = context.entities.metrics;
  aggregated.events = arrayUnique<string>(aggregated.events.concat(shares.events));
  aggregated.shares = shares.id;
  aggregated.save();

  return shares;
}
