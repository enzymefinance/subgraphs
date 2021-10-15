import {
  PrimitiveAdded,
  PrimitiveUpdated,
  PrimitiveRemoved,
  StalePrimitiveRemoved,
} from '../../generated/contracts/ChainlinkPriceFeed3Events';
import { createOrUpdatePrimitiveRegistration, removePrimitiveRegistration } from '../../entities/Registration';
import { initializeCurrencies } from '../../utils/initializeCurrencies';
import { updateForPrimitiveRegistration } from '../../utils/updateForRegistration';
import { releaseV3Address } from '../../templates/configuration';

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  initializeCurrencies(event);

  let quote = event.params.rateAsset == 0 ? 'ETH' : 'USD';
  let registration = createOrUpdatePrimitiveRegistration(
    event.params.primitive,
    event.params.aggregator,
    releaseV3Address,
    event,
    quote,
  );
  updateForPrimitiveRegistration(registration, event);
}

export function handlePrimitiveUpdated(event: PrimitiveUpdated): void {
  initializeCurrencies(event);

  let registration = createOrUpdatePrimitiveRegistration(
    event.params.primitive,
    event.params.nextAggregator,
    releaseV3Address,
    event,
  );
  updateForPrimitiveRegistration(registration, event);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  initializeCurrencies(event);
  removePrimitiveRegistration(event.params.primitive, releaseV3Address, event);
}

export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {
  initializeCurrencies(event);
  removePrimitiveRegistration(event.params.primitive, releaseV3Address, event);
}
