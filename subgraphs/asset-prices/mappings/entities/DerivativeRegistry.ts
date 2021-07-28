import { arrayDiff } from '@enzymefinance/subgraph-utils';
import { DerivativeRegistry, Asset } from '../../generated/schema';
import { Registration } from './Registration';

export function getOrCreateDerivativeRegistry(): DerivativeRegistry {
  let registry = DerivativeRegistry.load('REGISTRY') as DerivativeRegistry;
  if (registry == null) {
    registry = new DerivativeRegistry('REGISTRY');
    registry.assets = [];
    registry.save();
  }

  return registry;
}

export function updateDerivativeRegistry(asset: Asset): void {
  let registry = getOrCreateDerivativeRegistry();

  // Grab the first registration (highest priority) for the asset.
  let registrations = asset.registrations;
  let registration: Registration | null = registrations.length > 0 ? Registration.load(registrations[0]) : null;

  // Check if the first registration is a derivative registration.
  let shouldBeRegistered = registration != null && registration.type == 'DERIVATIVE';
  let isRegistered = registry.assets.includes(asset.id);

  if (shouldBeRegistered && !isRegistered) {
    // Add the derivative to the registry.
    registry.assets = registry.assets.concat([asset.id]);
    registry.save();
  } else if (!shouldBeRegistered && isRegistered) {
    // Remove the derivative from the registry.
    registry.assets = arrayDiff<string>(registry.assets, [asset.id]);
    registry.save();
  }
}
