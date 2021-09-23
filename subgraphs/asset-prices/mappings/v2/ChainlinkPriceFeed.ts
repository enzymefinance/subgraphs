import {
  PrimitiveAdded,
  PrimitiveUpdated,
  PrimitiveRemoved,
  StalePrimitiveRemoved,
} from '../../generated/contracts/ChainlinkPriceFeed2Events';
import { createOrUpdatePrimitiveRegistration, removePrimitiveRegistration } from '../../entities/Registration';
import { initializeCurrencies } from '../../utils/initializeCurrencies';
import { updateForPrimitiveRegistration } from '../../utils/updateForRegistration';

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  initializeCurrencies(event);

  let quote = event.params.rateAsset == 0 ? 'ETH' : 'USD';
  let registration = createOrUpdatePrimitiveRegistration(
    event.params.primitive,
    event.params.aggregator,
    2,
    event,
    quote,
  );
  updateForPrimitiveRegistration(registration, event);
}

export function handlePrimitiveUpdated(event: PrimitiveUpdated): void {
  initializeCurrencies(event);

  let registration = createOrUpdatePrimitiveRegistration(event.params.primitive, event.params.nextAggregator, 2, event);
  updateForPrimitiveRegistration(registration, event);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  initializeCurrencies(event);
  removePrimitiveRegistration(event.params.primitive, 2, event);
}

export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {
  initializeCurrencies(event);
  removePrimitiveRegistration(event.params.primitive, 2, event);
}
