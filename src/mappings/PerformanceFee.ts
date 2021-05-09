import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { ensureAsset } from '../entities/Asset';
import { ensureComptrollerProxy } from '../entities/ComptrollerProxy';
import { ensureFee } from '../entities/Fee';
import { trackFeeState } from '../entities/FeeState';
import { useFund } from '../entities/Fund';
import { ensurePerformanceFeeSetting } from '../entities/PerformanceFeeSetting';
import { performanceFeeStateId, usePerformanceFeeState } from '../entities/PerformanceFeeState';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import {
  ActivatedForFund,
  FundSettingsAdded,
  LastSharePriceUpdated,
  PaidOut,
  PerformanceUpdated,
} from '../generated/PerformanceFeeContract';
import {
  Fund,
  PerformanceFeeActivatedForFundEvent,
  PerformanceFeePaidOutEvent,
  PerformanceFeePerformanceUpdatedEvent,
  PerformanceFeeSettingsAddedEvent,
  PerformanceFeeSharePriceUpdatedEvent,
} from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';

// on fund creation, this event occurs before the Fund and Comptroller entities have been created
// on a migration, this event occurs without a vault proxy (only comptroller)
export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensureFee(event.address);
  let rate = toBigDecimal(event.params.rate);

  let feeSettings = new PerformanceFeeSettingsAddedEvent(genericId(event));
  feeSettings.timestamp = event.block.timestamp;
  feeSettings.transaction = ensureTransaction(event).id;
  feeSettings.comptroller = event.params.comptrollerProxy.toHex();
  feeSettings.rate = rate;
  feeSettings.period = event.params.period;
  feeSettings.save();

  let setting = ensurePerformanceFeeSetting(event.params.comptrollerProxy.toHex(), fee);
  setting.rate = rate;
  setting.period = event.params.period;
  setting.events = arrayUnique<string>(setting.events.concat([feeSettings.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleActivatedForFund(event: ActivatedForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();

  let fee = ensureFee(event.address);

  let denominationAsset = ensureAsset(comptroller.getDenominationAsset());

  let feeActivation = new PerformanceFeeActivatedForFundEvent(genericId(event));
  feeActivation.fund = vault.toHex();
  feeActivation.timestamp = event.block.timestamp;
  feeActivation.transaction = ensureTransaction(event).id;
  feeActivation.comptrollerProxy = event.params.comptrollerProxy.toHex();
  feeActivation.highWaterMark = toBigDecimal(event.params.highWaterMark, denominationAsset.decimals);
  feeActivation.save();

  let setting = ensurePerformanceFeeSetting(event.params.comptrollerProxy.toHex(), fee);
  setting.activated = event.block.timestamp;
  setting.save();

  // track fee state for migrated funds
  let fund = Fund.load(vault.toHex()) as Fund;
  if (fund != null) {
    trackFeeState(fund, fee, BigDecimal.fromString('0'), event, feeActivation);

    let performanceFeeState = usePerformanceFeeState(performanceFeeStateId(fund, event));
    performanceFeeState.grossSharePrice = toBigDecimal(event.params.highWaterMark, denominationAsset.decimals);
    performanceFeeState.highWaterMark = toBigDecimal(event.params.highWaterMark, denominationAsset.decimals);
    performanceFeeState.save();
  }
}

export function handleLastSharePriceUpdated(event: LastSharePriceUpdated): void {
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  if (comptrollerProxy.fund == null) {
    logCritical('no vault attached to comptrollerProxy {}', [comptrollerProxy.id]);
    return;
  }

  let fund = useFund(comptrollerProxy.fund);
  let fee = ensureFee(event.address);
  let denominationAsset = ensureAsset(Address.fromString(comptrollerProxy.denominationAsset));

  let sharePriceUpdate = new PerformanceFeeSharePriceUpdatedEvent(genericId(event));
  sharePriceUpdate.fund = fund.id;
  sharePriceUpdate.timestamp = event.block.timestamp;
  sharePriceUpdate.transaction = ensureTransaction(event).id;
  sharePriceUpdate.comptrollerProxy = event.params.comptrollerProxy.toHex();
  sharePriceUpdate.prevSharePrice = toBigDecimal(event.params.prevSharePrice, denominationAsset.decimals);
  sharePriceUpdate.nextSharePrice = toBigDecimal(event.params.nextSharePrice, denominationAsset.decimals);
  sharePriceUpdate.save();

  trackFeeState(fund, fee, BigDecimal.fromString('0'), event, sharePriceUpdate);

  let performanceFeeState = usePerformanceFeeState(performanceFeeStateId(fund, event));
  performanceFeeState.grossSharePrice = toBigDecimal(event.params.nextSharePrice, denominationAsset.decimals);
  performanceFeeState.lastPaid = event.block.timestamp;
  performanceFeeState.save();
}

export function handlePaidOut(event: PaidOut): void {
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  if (comptrollerProxy.fund == null) {
    logCritical('no vault attached to comptrollerProxy {}', [comptrollerProxy.id]);
    return;
  }

  let fund = useFund(comptrollerProxy.fund);
  let fee = ensureFee(event.address);
  let denominationAsset = ensureAsset(Address.fromString(comptrollerProxy.denominationAsset));

  let paidOut = new PerformanceFeePaidOutEvent(genericId(event));
  paidOut.fund = fund.id;
  paidOut.timestamp = event.block.timestamp;
  paidOut.transaction = ensureTransaction(event).id;
  paidOut.comptrollerProxy = event.params.comptrollerProxy.toHex();
  paidOut.prevHighWaterMark = toBigDecimal(event.params.prevHighWaterMark, denominationAsset.decimals);
  paidOut.nextHighWaterMark = toBigDecimal(event.params.nextHighWaterMark, denominationAsset.decimals);
  paidOut.save();

  trackFeeState(fund, fee, BigDecimal.fromString('0'), event, paidOut);

  let performanceFeeState = usePerformanceFeeState(performanceFeeStateId(fund, event));
  performanceFeeState.highWaterMark = toBigDecimal(event.params.nextHighWaterMark, denominationAsset.decimals);
  performanceFeeState.lastPaid = event.block.timestamp;
  // AggregateValueDue is not emitted, but it is always set to zero just before the event is emitted
  performanceFeeState.aggregateValueDue = BigDecimal.fromString('0');
  performanceFeeState.save();
}

export function handlePerformanceUpdated(event: PerformanceUpdated): void {
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  if (comptrollerProxy.fund == null) {
    logCritical('no vault attached to comptrollerProxy {}', [comptrollerProxy.id]);
    return;
  }

  let fund = useFund(comptrollerProxy.fund);
  let fee = ensureFee(event.address);
  let denominationAsset = ensureAsset(Address.fromString(comptrollerProxy.denominationAsset));

  let updated = new PerformanceFeePerformanceUpdatedEvent(genericId(event));
  updated.fund = fund.id;
  updated.timestamp = event.block.timestamp;
  updated.transaction = ensureTransaction(event).id;
  updated.comptrollerProxy = event.params.comptrollerProxy.toHex();
  updated.prevAggregateValueDue = toBigDecimal(event.params.prevAggregateValueDue, denominationAsset.decimals);
  updated.nextAggregateValueDue = toBigDecimal(event.params.nextAggregateValueDue, denominationAsset.decimals);
  updated.sharesOutstandingDiff = toBigDecimal(event.params.sharesOutstandingDiff);
  updated.save();

  trackFeeState(fund, fee, BigDecimal.fromString('0'), event, updated);

  let performanceFeeState = usePerformanceFeeState(performanceFeeStateId(fund, event));
  performanceFeeState.aggregateValueDue = toBigDecimal(event.params.nextAggregateValueDue, denominationAsset.decimals);
  performanceFeeState.sharesOutstanding = performanceFeeState.sharesOutstanding.plus(
    toBigDecimal(event.params.sharesOutstandingDiff),
  );
  performanceFeeState.save();
}
