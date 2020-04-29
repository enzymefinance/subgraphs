import { ethereum, Entity, BigInt, log } from '@graphprotocol/graph-ts';
import { Fund, FundHoldingsMetric, FundSharesMetric, Investment, FundAggregatedMetric } from '../generated/schema';
import { useInvestmentWithId } from './Investment';
import { Context } from '../context';

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

// export function trackFundHoldings(event: ethereum.Event, fund: Fund, cause: Entity): FundHoldingsMetric {
//   let metrics = new FundHoldingsMetric(
//     fund.id + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString() + '/holdings',
//   );
//   metrics.fund = fund.id;
//   metrics.holdings = fund.holdings;
//   metrics.timestamp = event.block.timestamp;
//   metrics.event = cause.getString('id');
//   metrics.save();

//   return metrics;
// }

export function trackFundShares(event: ethereum.Event, fund: Fund, cause: Entity, context: Context): FundSharesMetric {
  let id = fund.id + '/' + event.block.timestamp.toString() + '/shares';
  let causeId = cause.getString('id');

  let metric = FundSharesMetric.load(id) as FundSharesMetric;

  if (!metric) {
    metric = new FundSharesMetric(id);
    metric.fund = fund.id;
    metric.shares = context.contracts.shares.totalSupply();
    metric.timestamp = event.block.timestamp;
    metric.events = [];
  }

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
  let causeId = cause.getString('id');

  let currentId = fund.metrics;

  let metric: FundAggregatedMetric;

  if (currentId != id) {
    let current = FundAggregatedMetric.load(currentId) as FundAggregatedMetric;

    metric = new FundAggregatedMetric(id);
    metric.fund = fund.id;
    metric.timestamp = event.block.timestamp;
    metric.shares = current.shares;
    metric.holdings = current.holdings;
    metric.events = [];
  } else {
    metric = FundAggregatedMetric.load(id) as FundAggregatedMetric;
  }

  if (changeDescription == 'shares') {
    metric.shares = changedEntity.getString('id');
  }

  if (metric.events.indexOf(causeId) != -1) {
    log.critical('Event has already been tracked', []);
  }

  metric.events = metric.events.concat([causeId]);
  metric.save();

  fund.metrics = metric.id;
  fund.save();

  return metric;
}
