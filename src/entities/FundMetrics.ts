import { ethereum, Entity } from '@graphprotocol/graph-ts';
import { Fund, FundHoldingsMetric, FundSharesMetric } from '../generated/schema';

export function trackFundHoldings(event: ethereum.Event, fund: Fund, cause: Entity): FundHoldingsMetric {
  let metrics = new FundHoldingsMetric(
    fund.id + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString() + '/holdings',
  );
  metrics.fund = fund.id;
  metrics.holdings = fund.holdings;
  metrics.timestamp = event.block.timestamp;
  metrics.event = cause.getString('id');
  metrics.save();

  return metrics;
}

export function trackFundShares(event: ethereum.Event, fund: Fund, cause: Entity): FundSharesMetric {
  let metrics = new FundSharesMetric(
    fund.id + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString() + '/shares',
  );
  metrics.fund = fund.id;
  metrics.shares = fund.shares;
  metrics.timestamp = event.block.timestamp;
  metrics.event = cause.getString('id');
  metrics.save();

  return metrics;
}
