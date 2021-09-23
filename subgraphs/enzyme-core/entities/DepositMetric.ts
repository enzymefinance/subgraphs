import { toBigDecimal, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { DepositMetric, MetricCounter } from '../generated/schema';
import { tokenBalance } from '../utils/tokenCalls';
import { ensureDepositor } from './Account';
import { ensureDeposit } from './Deposit';
import { useVault } from './Vault';

export function getDepositMetricCounter(): i32 {
  let counter = MetricCounter.load('metricId');

  if (counter == null) {
    counter = new MetricCounter('metricId');
    counter.vaultMetricCounter = 0;
    counter.depositMetricCounter = 1;
    counter.save();

    return counter.depositMetricCounter;
  }

  counter.depositMetricCounter = counter.depositMetricCounter + 1;
  counter.save();

  return counter.depositMetricCounter;
}

export function trackDepositMetric(vaultAddress: Address, depositorAddress: Address, event: ethereum.Event): void {
  let id = vaultAddress.toHex() + '/' + depositorAddress.toHex() + '/' + event.block.number.toString();
  let metric = DepositMetric.load(id);
  if (metric != null) {
    return;
  }

  let balanceCallResult = tokenBalance(vaultAddress, depositorAddress);
  let balance = balanceCallResult ? toBigDecimal(balanceCallResult) : ZERO_BD;

  let depositor = ensureDepositor(depositorAddress, event);
  let vault = useVault(vaultAddress.toHex());
  let deposit = ensureDeposit(depositor, vault, event);

  deposit.shares = balance;
  deposit.save();

  metric = new DepositMetric(id);
  metric.counter = getDepositMetricCounter();
  metric.timestamp = event.block.timestamp.toI32();
  metric.vault = vaultAddress;
  metric.depositor = depositorAddress;
  metric.balance = balance;
  metric.save();
}
