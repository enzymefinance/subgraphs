import { ethereum, Address, BigDecimal } from '@graphprotocol/graph-ts';
import { PrimitiveRegistration, CurrencyRegistration, DerivativeRegistration, Asset } from '../generated/schema';
import { getOrCreateAsset, updateAssetPrice, updateAssetPriceWithValueInterpreter } from '../entities/Asset';
import { getOrCreateCurrency } from '../entities/Currency';
import { Registration } from '../entities/Registration';
import { updateCurrency } from '../entities/Currency';

export function updateForCurrencyRegistration(
  registration: CurrencyRegistration,
  event: ethereum.Event,
  value: BigDecimal,
): void {
  let currency = getOrCreateCurrency(registration.currency, event);
  updateCurrency(currency, value, event);
}

export function updateForPrimitiveRegistration(
  registration: PrimitiveRegistration,
  event: ethereum.Event,
  value: BigDecimal | null = null,
): void {
  let asset = getOrCreateAsset(
    Address.fromString(registration.asset),
    Address.fromString(registration.version.toHex()),
    event,
  );
  // Skip the update if the given registration is not the active registration for this asset.
  if (!isActiveRegistration(changetype<Registration>(registration), asset)) {
    return;
  }

  if (!value) {
    updateAssetPriceWithValueInterpreter(asset, Address.fromString(registration.version.toHex()), event);
  } else {
    updateAssetPrice(asset, value as BigDecimal, event);
  }
}

export function updateForDerivativeRegistration(registration: DerivativeRegistration, event: ethereum.Event): void {
  let asset = getOrCreateAsset(
    Address.fromString(registration.asset),
    Address.fromString(registration.version.toHex()),
    event,
  );
  // Skip the update if the given registration is not the active registration for this asset.
  if (!isActiveRegistration(changetype<Registration>(registration), asset)) {
    return;
  }

  updateAssetPriceWithValueInterpreter(asset, Address.fromString(registration.version.toHex()), event);
}

function isActiveRegistration(registration: Registration, asset: Asset): boolean {
  let registrations = asset.registrations;
  if (registrations.length == 0) {
    return false;
  }

  return registrations[0] == registration.id;
}
