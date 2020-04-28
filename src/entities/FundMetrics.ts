import { ethereum, Entity, BigInt, log } from '@graphprotocol/graph-ts';
import { Fund, FundHoldingsMetric, FundSharesMetric, FundInvestmentsMetric, Investment } from '../generated/schema';
import { useInvestmentWithId } from './Investment';

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

export function trackFundInvestments(event: ethereum.Event, fund: Fund, cause: Entity): FundInvestmentsMetric {
  let activeInvestments = fund.investments
    .map<Investment>((investment) => useInvestmentWithId(investment))
    .filter((investment) => !investment.shares.isZero());

  let metrics = new FundInvestmentsMetric(
    fund.id + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString() + '/investments',
  );
  metrics.fund = fund.id;
  metrics.activeInvestors = activeInvestments.length;
  metrics.inactiveInvestors = activeInvestments.length - fund.investments.length;
  metrics.investments = fund.investments;
  metrics.timestamp = event.block.timestamp;
  metrics.event = cause.getString('id');
  metrics.save();

  return metrics;
}
