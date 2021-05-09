import { Address, BigDecimal, Entity, ethereum } from '@graphprotocol/graph-ts';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { FundActionsWrapperContract } from '../generated/FundActionsWrapperContract';
import { CalculationState, Fund } from '../generated/schema';
import { VaultLibContract } from '../generated/VaultLibContract';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';
import { ensureAsset } from './Asset';
import { useAssetPrice } from './AssetPrice';
import { ensureComptrollerProxy } from './ComptrollerProxy';
import { ensureFundState } from './FundState';
import { useCurrentRelease } from './Release';

export function calculationStateId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/calculations';
}

export function createCalculationState(fund: Fund, event: ethereum.Event, cause: Entity | null): CalculationState {
  let calculations = new CalculationState(calculationStateId(fund, event));
  calculations.timestamp = event.block.timestamp;
  calculations.fund = fund.id;
  calculations.gav = BigDecimal.fromString('0');
  calculations.totalSupply = BigDecimal.fromString('0');
  calculations.grossSharePrice = BigDecimal.fromString('0');
  calculations.netSharePrice = BigDecimal.fromString('0');
  calculations.events = cause ? [cause.getString('id')] : new Array<string>();
  calculations.save();

  return calculations;
}

export function ensureCalculationState(fund: Fund, event: ethereum.Event, cause: Entity): CalculationState {
  let calculations = CalculationState.load(calculationStateId(fund, event)) as CalculationState;

  if (!calculations) {
    calculations = createCalculationState(fund, event, cause);
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
    logCritical('Failed to load fund calculations {}.', [id]);
  }

  return calculations;
}

export function trackCalculationState(fund: Fund, event: ethereum.Event, cause: Entity): void {
  let release = useCurrentRelease();

  let comptroller = ComptrollerLibContract.bind(Address.fromString(fund.accessor));
  let wrapper = FundActionsWrapperContract.bind(Address.fromString(release.fundActionsWrapper));
  let vault = VaultLibContract.bind(Address.fromString(fund.id));

  let gav = comptroller.try_calcGav(true);
  let totalSupply = vault.try_totalSupply();
  let grossShareValue = comptroller.try_calcGrossShareValue(true);
  let netShareValue = wrapper.try_calcNetShareValueForFund(Address.fromString(fund.accessor));

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

  let comptrollerProxy = ensureComptrollerProxy(Address.fromString(fund.accessor), event);
  let denominationAsset = ensureAsset(Address.fromString(comptrollerProxy.denominationAsset));

  let calculations = ensureCalculationState(fund, event, cause);
  calculations.gav = toBigDecimal(gav.value.value0, denominationAsset.decimals);
  calculations.totalSupply = toBigDecimal(totalSupply.value);
  calculations.grossSharePrice = toBigDecimal(grossShareValue.value.value0, denominationAsset.decimals);
  calculations.netSharePrice = toBigDecimal(netShareValue.value.value0, denominationAsset.decimals);
  calculations.save();

  let state = ensureFundState(fund, event);
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(calculations.events));
  state.calculations = calculations.id;
  state.save();

  if (denominationAsset.price) {
    let denominationAssetPrice = useAssetPrice(denominationAsset.price);
    fund.lastKnowGavInEth = calculations.gav.times(denominationAssetPrice.price);
  }

  fund.calculations = calculations.id;
  fund.save();

  return;
}
