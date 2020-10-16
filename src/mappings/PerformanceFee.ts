import { ensureManager } from '../entities/Account';
import { ensureContract } from '../entities/Contract';
import { useFee } from '../entities/Fee';
import { useFund } from '../entities/Fund';
import { ensurePerformanceFeeSetting, usePerformanceFeeSetting } from '../entities/PerformanceFeeSetting';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { ActivatedForFund, FundSettingsAdded, PaidOut, PerformanceUpdated } from '../generated/PerformanceFeeContract';
import {
  PerformanceFeeActivatedForFundEvent,
  PerformanceFeePaidOutEvent,
  PerformanceFeePerformanceUpdatedEvent,
  PerformanceFeeSettingsAddedEvent,
} from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let fee = useFee(event.address.toHex());
  let rate = toBigDecimal(event.params.rate);

  let feeSettings = new PerformanceFeeSettingsAddedEvent(genericId(event));
  feeSettings.fund = vault.toHex(); // fund does not exist yet
  feeSettings.account = ensureManager(event.transaction.from, event).id;
  feeSettings.contract = ensureContract(event.address, 'PerformanceFee').id;
  feeSettings.timestamp = event.block.timestamp;
  feeSettings.transaction = ensureTransaction(event).id;
  feeSettings.comptrollerProxy = event.params.comptrollerProxy.toHex();
  feeSettings.rate = rate;
  feeSettings.period = event.params.period;
  feeSettings.save();

  let setting = ensurePerformanceFeeSetting(vault.toHex(), fee);
  setting.rate = rate;
  setting.period = event.params.period;
  setting.events = arrayUnique<string>(setting.events.concat([feeSettings.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleActivatedForFund(event: ActivatedForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let fee = useFee(event.address.toHex());

  let feeActivation = new PerformanceFeeActivatedForFundEvent(genericId(event));
  feeActivation.fund = vault.toHex(); // fund does not exist yet
  feeActivation.account = ensureManager(event.transaction.from, event).id;
  feeActivation.contract = ensureContract(event.address, 'PerformanceFee').id;
  feeActivation.timestamp = event.block.timestamp;
  feeActivation.transaction = ensureTransaction(event).id;
  feeActivation.comptrollerProxy = event.params.comptrollerProxy.toHex();
  feeActivation.highWaterMark = toBigDecimal(event.params.highWaterMark);
  feeActivation.save();

  let setting = ensurePerformanceFeeSetting(vault.toHex(), fee);
  setting.highWaterMark = toBigDecimal(event.params.highWaterMark);
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handlePaidOut(event: PaidOut): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useFund(comptroller.getVaultProxy().toHex());
  let fee = useFee(event.address.toHex());

  let paidOut = new PerformanceFeePaidOutEvent(genericId(event));
  paidOut.fund = fund.id;
  paidOut.account = ensureManager(event.transaction.from, event).id;
  paidOut.contract = ensureContract(event.address, 'PerformanceFee').id;
  paidOut.timestamp = event.block.timestamp;
  paidOut.transaction = ensureTransaction(event).id;
  paidOut.comptrollerProxy = event.params.comptrollerProxy.toHex();
  paidOut.prevHighWaterMark = toBigDecimal(event.params.prevHighWaterMark);
  paidOut.nextHighWaterMark = toBigDecimal(event.params.nextHighWaterMark);
  paidOut.save();

  let setting = usePerformanceFeeSetting(fund, fee);
  setting.highWaterMark = toBigDecimal(event.params.nextHighWaterMark);
  setting.save();
}

export function handlePerformanceUpdated(event: PerformanceUpdated): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useFund(comptroller.getVaultProxy().toHex());
  let fee = useFee(event.address.toHex());

  let updated = new PerformanceFeePerformanceUpdatedEvent(genericId(event));
  updated.fund = fund.id;
  updated.account = ensureManager(event.transaction.from, event).id;
  updated.contract = ensureContract(event.address, 'PerformanceFee').id;
  updated.timestamp = event.block.timestamp;
  updated.transaction = ensureTransaction(event).id;
  updated.comptrollerProxy = event.params.comptrollerProxy.toHex();
  updated.prevAggregateValueDue = toBigDecimal(event.params.prevAggregateValueDue);
  updated.nextAggregateValueDue = toBigDecimal(event.params.nextAggregateValueDue);
  updated.prevSharePrice = toBigDecimal(event.params.prevSharePrice);
  updated.nextSharePrice = toBigDecimal(event.params.nextSharePrice);
  updated.sharesOutstandingDiff = toBigDecimal(event.params.sharesOutstandingDiff);
  updated.save();
}
