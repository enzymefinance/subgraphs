import { Entity, Value, Address, BigInt } from '@graphprotocol/graph-ts';
import { Fund, ManagementFee, PerformanceFee } from '../generated/schema';
import { ManagementFeeContract } from '../generated/ManagementFeeContract';
import { PerformanceFeeContract } from '../generated/PerformanceFeeContract';
import { Context } from '../context';

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

function feeId(fund: Fund, address: Address): string {
  return fund.id + '/' + address.toHex();
}

export function createFees(context: Context): Fee[] {
  let fund = context.entities.fund;
  let contract = context.contracts.fees;
  let address = Address.fromString(context.fees);
  let fees: Fee[] = [];

  let managementFee = contract.fees(BigInt.fromI32(0));
  if (managementFee) {
    let contract = ManagementFeeContract.bind(managementFee);
    let rate = contract.managementFeeRate(address);

    let fee = new ManagementFee(feeId(fund, managementFee));
    fee.identifier = 'MANAGEMENT';
    fee.fund = fund.id;
    fee.rate = rate.divDecimal(BigInt.fromI32(10).pow(18).toBigDecimal());
    fee.save();

    fees.push(fee as Fee);
  }

  let performanceFee = contract.fees(BigInt.fromI32(1));
  if (performanceFee) {
    let feeContract = PerformanceFeeContract.bind(performanceFee);
    let period = feeContract.performanceFeePeriod(address);
    let rate = feeContract.performanceFeeRate(address);

    let fee = new PerformanceFee(feeId(fund, performanceFee));
    fee.identifier = 'PERFORMANCE';
    fee.fund = fund.id;
    fee.period = period;
    fee.rate = rate.divDecimal(BigInt.fromI32(10).pow(18).toBigDecimal());
    fee.save();

    fees.push(fee as Fee);
  }

  return fees;
}
