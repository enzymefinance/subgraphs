import { arrayDiff } from '@enzymefinance/subgraph-utils';
import { UsdQuotedPrimitiveRegistry, Asset, PrimitiveRegistration } from '../generated/schema';
import { Registration } from './Registration';

export function getOrCreateUsdQuotedPrimitiveRegistry(): UsdQuotedPrimitiveRegistry {
  let registry = UsdQuotedPrimitiveRegistry.load('REGISTRY') as UsdQuotedPrimitiveRegistry;
  if (registry == null) {
    registry = new UsdQuotedPrimitiveRegistry('REGISTRY');
    registry.assets = [];
    registry.save();
  }

  return registry;
}

export function updateUsdQuotedPrimitiveRegistry(asset: Asset): void {
  let registry = getOrCreateUsdQuotedPrimitiveRegistry();

  // Grab the first registration (highest priority) for the asset.
  let registrations = asset.registrations;
  let registration: Registration | null = registrations.length > 0 ? Registration.load(registrations[0]) : null;

  // Check if the first registration is a primitive registration and if the primitive is quoted using USD.
  let shouldBeRegistered =
    registration != null && registration.type == 'PRIMITIVE' && (registration as PrimitiveRegistration).quote == 'USD';
  let isRegistered = registry.assets.includes(asset.id);

  if (shouldBeRegistered && !isRegistered) {
    // Add the primitive to the registry.
    registry.assets = registry.assets.concat([asset.id]);
    registry.save();
  } else if (!shouldBeRegistered && isRegistered) {
    // Remove the primitive from the registry.
    registry.assets = arrayDiff<string>(registry.assets, [asset.id]);
    registry.save();
  }
}
