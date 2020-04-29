import { ethereum, Entity, BigInt, log, Address } from '@graphprotocol/graph-ts';
import {
  Fund,
  FundHoldingsMetric,
  FundSharesMetric,
  Investment,
  FundAggregatedMetric,
  Asset,
  FundHoldingMetric,
} from '../generated/schema';
import { useInvestmentWithId } from './Investment';
import { Context } from '../context';
import { useAsset, ensureAsset } from './Asset';

export function createFundAggregatedMetrics(event: ethereum.Event, fund: Fund): FundAggregatedMetric {
  let id = fund.id + event.block.timestamp.toString();

  let metric = new FundAggregatedMetric(id);
  metric.timestamp = event.block.timestamp;
  metric.fund = fund.id;
  metric.shares = createFundSharesMetrics(event, fund).id;
  metric.holdings = createFundHoldingsMetrics(event, fund).id;
  metric.events = [];
  metric.save();

  return metric;
}

export function createFundSharesMetrics(event: ethereum.Event, fund: Fund): FundSharesMetric {
  let id = fund.id + event.block.timestamp.toString() + '/shares';

  let metric = new FundSharesMetric(id);
  metric.timestamp = event.block.timestamp;
  metric.fund = fund.id;
  metric.shares = BigInt.fromI32(0);
  metric.events = [];
  metric.save();

  return metric;
}

export function createFundHoldingsMetrics(event: ethereum.Event, fund: Fund): FundHoldingsMetric {
  let id = fund.id + event.block.timestamp.toString() + '/holdings';

  let metric = new FundHoldingsMetric(id);
  metric.timestamp = event.block.timestamp;
  metric.fund = fund.id;
  metric.holdings = [];
  metric.events = [];
  metric.save();

  return metric;
}

export function trackFundHolding(
  event: ethereum.Event,
  fund: Fund,
  asset: Asset,
  quantity: BigInt,
  cause: Entity,
): FundHoldingMetric {
  let id = fund.id + '/' + asset.id + '/' + event.block.timestamp.toString();
  let causeId = cause.getString('id');

  let metric = FundHoldingMetric.load(id) as FundHoldingMetric;

  if (!metric) {
    metric = new FundHoldingMetric(id);
    metric.fund = fund.id;
    metric.timestamp = event.block.timestamp;
    metric.events = [];
  }

  metric.quantity = quantity;
  metric.asset = asset.id;

  if (metric.events.indexOf(causeId) != -1) {
    log.critical('Event has already been tracked', []);
  }
  metric.events = metric.events.concat([causeId]);

  return metric;
}

export function trackFundHoldings(
  event: ethereum.Event,
  fund: Fund,
  assets: Asset[],
  cause: Entity,
  context: Context,
): FundHoldingsMetric {
  let id = fund.id + '/' + event.block.timestamp.toString() + '/holdings';

  let metric = FundHoldingsMetric.load(id) as FundHoldingsMetric;
  let holdings: string[] = [];

  if (!metric) {
    let aggregatedMetrics = FundAggregatedMetric.load(fund.metrics) as FundAggregatedMetric;

    let currentHoldings = FundHoldingsMetric.load(aggregatedMetrics.holdings) as FundHoldingsMetric;

    metric = new FundHoldingsMetric(id);
    metric.fund = fund.id;
    metric.timestamp = event.block.timestamp;
    holdings = currentHoldings.holdings;
    metric.events = [];
  }

  let fundHoldings = context.contracts.accounting.getFundHoldings();

  for (let i: i32 = 0; i < assets.length; i++) {
    let asset = ensureAsset(Address.fromString(assets[i].id), context);

    let index = fundHoldings.value1.indexOf(Address.fromString(assets[i].id));

    let quantity = BigInt.fromI32(0);
    if (index != -1) {
      quantity = fundHoldings.value0[index];
    }

    let fundHolding = trackFundHolding(event, fund, asset, quantity, cause);

    let holdingsIndex = holdings.indexOf(asset.id);
    if (holdingsIndex != -1) {
      holdings[holdingsIndex] = fundHolding.id;
    } else {
      holdings = holdings.concat([fundHolding.id]);
    }
  }

  metric.holdings = holdings;

  let causeId = cause.getString('id');
  if (metric.events.indexOf(causeId) != -1) {
    log.critical('Event has already been tracked', []);
  }

  metric.events = metric.events.concat([causeId]);
  metric.save();

  fund.metrics = metric.id;
  fund.save();

  trackAggregatedMetrics(event, fund, cause, 'holdings', metric);

  return metric;
}

export function trackFundShares(event: ethereum.Event, fund: Fund, cause: Entity, context: Context): FundSharesMetric {
  let id = fund.id + '/' + event.block.timestamp.toString() + '/shares';
  let causeId = cause.getString('id');

  let metric = FundSharesMetric.load(id) as FundSharesMetric;

  if (!metric) {
    metric = new FundSharesMetric(id);
    metric.fund = fund.id;
    metric.timestamp = event.block.timestamp;
    metric.events = [];
  }

  metric.shares = context.contracts.shares.totalSupply();

  if (metric.events.indexOf(causeId) != -1) {
    log.critical('Event has already been tracked', []);
  }
  metric.events = metric.events.concat([causeId]);
  metric.save();

  trackAggregatedMetrics(event, fund, cause, 'shares', metric);

  return metric;
}

// export function trackFundInvestments(event: ethereum.Event, fund: Fund, cause: Entity): FundInvestmentsMetric {
//   let activeInvestments = fund.investments
//     .map<Investment>((investment) => useInvestmentWithId(investment))
//     .filter((investment) => !investment.shares.isZero());

//   let metrics = new FundInvestmentsMetric(
//     fund.id + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString() + '/investments',
//   );
//   metrics.fund = fund.id;
//   metrics.activeInvestors = activeInvestments.length;
//   metrics.inactiveInvestors = activeInvestments.length - fund.investments.length;
//   metrics.investments = fund.investments;
//   metrics.timestamp = event.block.timestamp;
//   metrics.event = cause.getString('id');
//   metrics.save();

//   return metrics;
// }

export function trackAggregatedMetrics(
  event: ethereum.Event,
  fund: Fund,
  cause: Entity,
  changeDescription: string,
  changedEntity: Entity,
): FundAggregatedMetric {
  let id = fund.id + '/' + event.block.timestamp.toString();
  let currentId = fund.metrics;

  let metric: FundAggregatedMetric;
  if (currentId == id) {
    // refactor into useF
    metric = FundAggregatedMetric.load(id) as FundAggregatedMetric;

    if (!metric) {
      log.critical('Failed to load FundAggregatedMetric {}', [id]);
    }
  } else {
    let current = FundAggregatedMetric.load(currentId) as FundAggregatedMetric;

    metric = new FundAggregatedMetric(id);
    metric.fund = fund.id;
    metric.timestamp = event.block.timestamp;
    metric.shares = current.shares;
    metric.holdings = current.holdings;
    metric.events = [];
  }

  if (changeDescription == 'shares') {
    metric.shares = changedEntity.getString('id');
  }

  if (changeDescription == 'holdings') {
    metric.holdings = changedEntity.getString('id');
  }

  let causeId = cause.getString('id');
  if (metric.events.indexOf(causeId) != -1) {
    log.critical('Event has already been tracked', []);
  }

  metric.events = metric.events.concat([causeId]);
  log.warning('zzz', []);

  metric.save();

  log.warning('aaa', []);
  fund.metrics = metric.id;

  fund.save();

  return metric as FundAggregatedMetric;
}
