import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Asset, DerivativeRegistration, Registry, Updater } from '../../generated/schema';
import { updateForDerivativeRegistration } from '../utils/updateForRegistration';
import { getOrCreateAsset } from './Asset';
import { Registration } from './Registration';

export function getOrCreateUpdater(): Updater {
  let updater = Updater.load('UPDATER') as Updater;
  if (updater == null) {
    updater = new Updater('UPDATER');
    updater.progress = 0;
    updater.save();
  }

  return updater;
}

export function getOrCreateRegistry(): Registry {
  let registry = Registry.load('REGISTRY') as Registry;
  if (registry == null) {
    registry = new Registry('REGISTRY');
    registry.derivatives = [];
    registry.save();
  }

  return registry;
}

export function updateDerivativeRegistry(asset: Asset): void {
  let registry = getOrCreateRegistry();

  // Grab the first registration (highest priority) for the asset.
  let registrations = asset.registrations;
  let registration: Registration | null = registrations.length > 0 ? Registration.load(registrations[0]) : null;

  // Check if the first registration is a derivative registration.
  let shouldBeRegistered = registration != null && registration.type == 'DERIVATIVE';
  let isRegistered = registry.derivatives.includes(asset.id);

  if (shouldBeRegistered && !isRegistered) {
    // Add the derivative to the registry.
    registry.derivatives = registry.derivatives.concat([asset.id]);
    registry.save();
  } else if (!shouldBeRegistered && isRegistered) {
    let index = registry.derivatives.findIndex((item) => item == asset.id);

    // Remove the derivative from the registry.
    registry.derivatives = registry.derivatives.splice(index, 1);
    registry.save();

    // If the position of the derivative in the registry was before the current progress mark,
    // we must reduce the progress by one in order to not skip the update for the next
    // derivative in the list.
    let updater = getOrCreateUpdater();
    if (index < updater.progress) {
      updater.progress = Math.max(0, updater.progress - 1) as i32;
      updater.save();
    }
  }
}

export function updateDerivativePrices(event: ethereum.Event): void {
  let registry = getOrCreateRegistry();
  let derivatives = registry.derivatives;
  if (!derivatives.length) {
    return;
  }

  // Update the next batch of derivatives. We assume that the number of derivatives exceeds the
  // number of primitives by a factor of ~3. Hence, for every primitive update, we also update
  // 3 derivatives. If this proportion changes significantly in the future, this number could
  // be adjusted.
  let updater = getOrCreateUpdater();
  for (let i: i32 = 0; i < 3; i++) {
    updater.progress = updater.progress + 1 >= derivatives.length ? 0 : updater.progress + 1;
    let derivative = getOrCreateAsset(Address.fromString(derivatives[updater.progress]));
    let registrations = derivative.registrations;
    let registration: Registration | null = registrations.length > 0 ? Registration.load(registrations[0]) : null;

    if (registration == null || registration.type != 'DERIVATIVE') {
      return;
    }

    updateForDerivativeRegistration(registration as DerivativeRegistration, event);
  }

  updater.save();
}
