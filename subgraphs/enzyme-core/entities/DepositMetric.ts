import { toBigDecimal, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { DepositMetric } from '../generated/schema';
import { tokenBalance } from '../utils/tokenCalls';
import { ensureDepositor } from './Account';
import { getDepositMetricCounter } from './Counter';
import { ensureDeposit } from './Deposit';
import { useVault } from './Vault';

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
  metric.depositMetricCounter = getDepositMetricCounter();
  metric.timestamp = event.block.timestamp.toI32();
  metric.vault = vaultAddress;
  metric.depositor = depositorAddress;
  metric.balance = balance;
  metric.save();
}
