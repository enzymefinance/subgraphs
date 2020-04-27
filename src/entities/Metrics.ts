import { ethereum, Entity } from '@graphprotocol/graph-ts';
import { Fund, FundMetrics } from '../generated/schema';

export function trackFundMetrics(event: ethereum.Event, fund: Fund, cause: Entity): FundMetrics {
  let holdings = fund.holdings;
  let metrics = new FundMetrics(fund.id + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString());
  metrics.fund = fund.id;
  metrics.holdings = holdings;
  metrics.shares = fund.shares;
  metrics.timestamp = event.block.timestamp;
  metrics.event = cause.getString('id');
  metrics.save();

  return metrics;
}
