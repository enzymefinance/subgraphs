import { Address, BigDecimal, Entity, ethereum } from '@graphprotocol/graph-ts';
import { fundCalculatorAddress } from '../addresses';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { FundCalculatorContract } from '../generated/FundCalculatorContract';
import { Calculation, Fund } from '../generated/schema';
import { VaultLibContract } from '../generated/VaultLibContract';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';
import { useAsset } from './Asset';
import { ensureState } from './State';

export function calculationsId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/calculations';
}

export function createCalculations(fund: Fund, event: ethereum.Event, cause: Entity | null): Calculation {
  let calculations = new Calculation(calculationsId(fund, event));
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

export function ensureCalculations(fund: Fund, event: ethereum.Event, cause: Entity): Calculation {
  let calculations = Calculation.load(calculationsId(fund, event)) as Calculation;

  if (!calculations) {
    calculations = createCalculations(fund, event, cause);
  } else {
    let events = calculations.events;
    calculations.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    calculations.save();
  }

  return calculations;
}

export function useCalculations(id: string): Calculation {
  let calculations = Calculation.load(id) as Calculation;
  if (calculations == null) {
    logCritical('Failed to load fund calculations {}.', [id]);
  }

  return calculations;
}

export function trackFundCalculations(fund: Fund, event: ethereum.Event, cause: Entity): void {
  let comptroller = ComptrollerLibContract.bind(Address.fromString(fund.accessor));
  let calculator = FundCalculatorContract.bind(fundCalculatorAddress);
  let vault = VaultLibContract.bind(Address.fromString(fund.id));

  let gav = comptroller.try_calcGav();
  let totalSupply = vault.try_totalSupply();
  let grossShareValue = comptroller.try_calcGrossShareValue();
  let netShareValue = calculator.try_calcNetShareValue(Address.fromString(fund.accessor));

  if (
    gav.reverted ||
    !gav.value.value1 ||
    totalSupply.reverted ||
    grossShareValue.reverted ||
    !grossShareValue.value.value1 ||
    netShareValue.reverted ||
    !netShareValue.value.value1
  ) {
    return;
  }

  let denominationAsset = useAsset(fund.denominationAsset);

  let calculations = ensureCalculations(fund, event, cause);
  calculations.gav = toBigDecimal(gav.value.value0, denominationAsset.decimals);
  calculations.totalSupply = toBigDecimal(totalSupply.value);
  calculations.grossSharePrice = toBigDecimal(grossShareValue.value.value0);
  calculations.netSharePrice = toBigDecimal(netShareValue.value.value0);
  calculations.save();

  let state = ensureState(fund, event);
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(calculations.events));
  state.calculations = calculations.id;
  state.save();

  fund.calculations = calculations.id;
  fund.save();

  return;
}
