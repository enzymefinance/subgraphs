import { Entity, Value, Address, BigInt } from '@graphprotocol/graph-ts';
import { Fund, ManagementFee, PerformanceFee } from '../generated/schema';
import { HubContract } from '../generated/HubContract';
import { FeeManagerContract } from '../generated/FeeManagerContract';
import { ManagementFeeContract } from '../generated/ManagementFeeContract';
import { PerformanceFeeContract } from '../generated/PerformanceFeeContract';

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

function feeId(feeManagerAddress: Address, feeAddress: Address): string {
  return feeManagerAddress.toHex() + '/' + feeAddress.toHex();
}

export function ensureFees(fund: Fund): Fee[] {
  let hubContract = HubContract.bind(Address.fromString(fund.id));
  let hubRoutes = hubContract.routes();
  let feeManagerAddress = hubRoutes.value1;
  let feeManagerContract = FeeManagerContract.bind(feeManagerAddress);

  let fees: Fee[] = [];

  let managementFeeAddress = feeManagerContract.fees(BigInt.fromI32(0));
  if (managementFeeAddress) {
    let feeContract = ManagementFeeContract.bind(managementFeeAddress);
    let managementFeeRate = feeContract.managementFeeRate(feeManagerContract._address);

    let fee = new ManagementFee(feeId(feeManagerAddress, managementFeeAddress));
    fee.identifier = 'MANAGEMENT';
    fee.fund = fund.id;
    fee.rate = managementFeeRate.divDecimal(BigInt.fromI32(10).pow(18).toBigDecimal());
    fee.save();

    fees.push(fee as Fee);
  }

  let performanceFeeAddress = feeManagerContract.fees(BigInt.fromI32(1));
  if (performanceFeeAddress) {
    let feeContract = PerformanceFeeContract.bind(performanceFeeAddress);
    let performanceFeeRate = feeContract.performanceFeeRate(feeManagerContract._address);

    let fee = new PerformanceFee(feeId(feeManagerAddress, performanceFeeAddress));
    fee.identifier = 'PERFORMANCE';
    fee.fund = fund.id;
    fee.rate = performanceFeeRate.divDecimal(BigInt.fromI32(10).pow(18).toBigDecimal());
    fee.period = feeContract.performanceFeePeriod(feeManagerContract._address);
    fee.save();

    fees.push(fee as Fee);
  }

  return fees;
}
