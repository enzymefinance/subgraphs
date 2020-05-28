import { Entity, Value, Address, BigInt } from '@graphprotocol/graph-ts';
import { ManagementFee, PerformanceFee } from '../generated/schema';
import { ManagementFeeContract } from '../generated/ManagementFeeContract';
import { PerformanceFeeContract } from '../generated/PerformanceFeeContract';
import { toBigDecimal } from '../utils/tokenValue';
import { Context } from '../context';
import { logCritical } from '../utils/logCritical';

export function feeId(address: Address, context: Context): string {
  let fund = context.entities.fund;
  return fund.id + '/' + address.toHex();
}

export function createFees(context: Context): Fee[] {
  let contract = context.contracts.fees;
  let fees: Fee[] = [];

  let managementFee = contract.fees(BigInt.fromI32(0));
  if (managementFee) {
    let fee = createManagementFee(managementFee, context);
    fees.push(fee as Fee);

    let performanceFee = contract.fees(BigInt.fromI32(1));
    if (performanceFee) {
      let fee = createPerformanceFee(performanceFee, context);
      fees.push(fee as Fee);
    }
  }

  return fees;
}

export function createManagementFee(managementFee: Address, context: Context): ManagementFee {
  let fund = context.entities.fund;
  let feeManagerAddress = Address.fromString(context.fees);

  let contract = ManagementFeeContract.bind(managementFee);
  let rate = contract.managementFeeRate(feeManagerAddress);
  let id = feeId(managementFee, context);

  if (ManagementFee.load(id)) {
    logCritical('Duplicate management fee "{}" for fund {}.', [id, fund.name]);
  }

  let fee = new ManagementFee(id);
  fee.identifier = 'MANAGEMENT';
  fee.fund = fund.id;
  fee.rate = toBigDecimal(rate);
  fee.save();

  return fee;
}

export function createPerformanceFee(performanceFee: Address, context: Context): PerformanceFee {
  let fund = context.entities.fund;
  let feeManagerAddress = Address.fromString(context.fees);

  let contract = PerformanceFeeContract.bind(performanceFee);
  let id = feeId(performanceFee, context);

  if (PerformanceFee.load(id)) {
    logCritical('Duplicate performance fee "{}" for fund {}.', [id, fund.name]);
  }

  let period = contract.performanceFeePeriod(feeManagerAddress);
  let rate = contract.performanceFeeRate(feeManagerAddress);
  let initialization = contract.initializeTime(feeManagerAddress);

  let fee = new PerformanceFee(id);
  fee.identifier = 'PERFORMANCE';
  fee.fund = fund.id;
  fee.period = period;
  fee.rate = toBigDecimal(rate);
  fee.initialization = initialization;
  fee.save();

  return fee;
}

export function ensureManagementFee(id: string, context: Context): ManagementFee {
  let fee = ManagementFee.load(id) as ManagementFee;
  if (fee) {
    return fee;
  }

  let contract = context.contracts.fees;
  let managementFee = contract.fees(BigInt.fromI32(0));
  fee = createManagementFee(managementFee, context);

  return fee;
}

export function ensurePerformanceFee(id: string, context: Context): PerformanceFee {
  let fee = PerformanceFee.load(id) as PerformanceFee;
  if (fee) {
    return fee;
  }

  let contract = context.contracts.fees;
  let performanceFee = contract.fees(BigInt.fromI32(1));
  fee = createPerformanceFee(performanceFee, context);

  return fee;
}

export class Fee extends Entity {
  get id(): string {
    let value = this.get('id');
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get fund(): string {
    let value = this.get('fund');
    return value.toString();
  }

  set fund(value: string) {
    this.set('fund', Value.fromString(value));
  }

  get identifier(): string {
    let value = this.get('identifier');
    return value.toString();
  }

  set identifier(value: string) {
    this.set('identifier', Value.fromString(value));
  }
}
