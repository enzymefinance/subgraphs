import { arrayUnique, logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, Entity, ethereum } from '@graphprotocol/graph-ts';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { FundActionsWrapperContract } from '../generated/FundActionsWrapperContract';
import { CalculationState, Vault } from '../generated/schema';
import { VaultLibContract } from '../generated/VaultLibContract';
import { ensureAsset } from './Asset';
import { ensureAssetPrice } from './AssetPrice';
// import { useAssetPrice } from './AssetPrice';
import { ensureComptrollerProxy } from './ComptrollerProxy';
import { useCurrentRelease } from './Release';
import { ensureVaultState } from './VaultState';

export function calculationStateId(vault: Vault, event: ethereum.Event): string {
  return vault.id + '/' + event.block.timestamp.toString() + '/calculations';
}

export function createCalculationState(vault: Vault, event: ethereum.Event, cause: Entity | null): CalculationState {
  let calculations = new CalculationState(calculationStateId(vault, event));
  calculations.timestamp = event.block.timestamp;
  calculations.vault = vault.id;
  calculations.gav = BigDecimal.fromString('0');
  calculations.totalSupply = BigDecimal.fromString('0');
  calculations.grossSharePrice = BigDecimal.fromString('0');
  calculations.netSharePrice = BigDecimal.fromString('0');
  calculations.events = cause ? [cause.getString('id')] : new Array<string>();
  calculations.save();

  return calculations;
}

export function ensureCalculationState(vault: Vault, event: ethereum.Event, cause: Entity): CalculationState {
  let calculations = CalculationState.load(calculationStateId(vault, event)) as CalculationState;

  if (!calculations) {
    calculations = createCalculationState(vault, event, cause);
  } else {
    let events = calculations.events;
    calculations.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    calculations.save();
  }

  return calculations;
}

export function useCalculationState(id: string): CalculationState {
  let calculations = CalculationState.load(id) as CalculationState;
  if (calculations == null) {
    logCritical('Failed to load vault calculations {}.', [id]);
  }

  return calculations;
}

export function trackCalculationState(vault: Vault, event: ethereum.Event, cause: Entity): void {
  let release = useCurrentRelease();

  let comptroller = ComptrollerLibContract.bind(Address.fromString(vault.accessor));
  let wrapper = FundActionsWrapperContract.bind(Address.fromString(release.fundActionsWrapper));
  let vaultContract = VaultLibContract.bind(Address.fromString(vault.id));

  let gav = comptroller.try_calcGav(true);
  let totalSupply = vaultContract.try_totalSupply();
  let grossShareValue = comptroller.try_calcGrossShareValue(true);
  let netShareValue = wrapper.try_calcNetShareValueForFund(Address.fromString(vault.accessor));

  if (
    gav.reverted ||
    totalSupply.reverted ||
    grossShareValue.reverted ||
    netShareValue.reverted ||
    !gav.value.value1 ||
    !grossShareValue.value.value1 ||
    !netShareValue.value.value1
  ) {
    return;
  }

  let comptrollerProxy = ensureComptrollerProxy(Address.fromString(vault.accessor), event);
  let denominationAsset = ensureAsset(Address.fromString(comptrollerProxy.denominationAsset));

  let calculations = ensureCalculationState(vault, event, cause);
  calculations.gav = toBigDecimal(gav.value.value0, denominationAsset.decimals);
  calculations.totalSupply = toBigDecimal(totalSupply.value);
  calculations.grossSharePrice = toBigDecimal(grossShareValue.value.value0, denominationAsset.decimals);
  calculations.netSharePrice = toBigDecimal(netShareValue.value.value0, denominationAsset.decimals);
  calculations.save();

  let state = ensureVaultState(vault, event);
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(calculations.events));
  state.calculations = calculations.id;
  state.save();

  let denominationAssetPrice = ensureAssetPrice(denominationAsset, event);
  vault.lastKnowGavInEth = calculations.gav.times(denominationAssetPrice.price);

  vault.calculations = calculations.id;
  vault.save();

  return;
}
