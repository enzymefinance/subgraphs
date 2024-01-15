import { ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { GeneralInfo } from '../generated/schema';

let generalInfoId = 'general.info';

export function increaseDepositorCounter(numberOfNewDepositors: i32, event: ethereum.Event): GeneralInfo {
  let generalInfo = ensureGeneralInfo();

  generalInfo.depositorsCounterActive = (generalInfo.depositorsCounterActive + numberOfNewDepositors) as i32;
  generalInfo.depositorsCounterOverall = (generalInfo.depositorsCounterOverall + numberOfNewDepositors) as i32;
  generalInfo.updatedAt = event.block.timestamp.toI32();
  generalInfo.save();

  return generalInfo;
}

export function decreaseDepositorCounter(numberOfNewDepositors: i32, event: ethereum.Event): GeneralInfo {
  let generalInfo = ensureGeneralInfo();

  generalInfo.depositorsCounterActive = (generalInfo.depositorsCounterActive - numberOfNewDepositors) as i32;
  generalInfo.updatedAt = event.block.timestamp.toI32();
  generalInfo.save();

  return generalInfo;
}

export function ensureGeneralInfo(): GeneralInfo {
  let generalInfo = GeneralInfo.load(generalInfoId);

  if (generalInfo) {
    return generalInfo;
  }

  generalInfo = new GeneralInfo(generalInfoId);
  generalInfo.depositorsCounterActive = 0;
  generalInfo.depositorsCounterOverall = 0;
  generalInfo.updatedAt = 0;
  generalInfo.vaultsGav = BigDecimal.zero();
  generalInfo.save();

  return generalInfo;
}

export function increaseVaultsGav(amount: BigDecimal, event: ethereum.Event): GeneralInfo {
  let generalInfo = ensureGeneralInfo();

  generalInfo.vaultsGav = generalInfo.vaultsGav.plus(amount);
  generalInfo.updatedAt = event.block.timestamp.toI32();
  generalInfo.save();

  return generalInfo;
}

export function decreaseVaultsGav(amount: BigDecimal, event: ethereum.Event): GeneralInfo {
  let generalInfo = ensureGeneralInfo();

  generalInfo.vaultsGav = generalInfo.vaultsGav.minus(amount);
  generalInfo.updatedAt = event.block.timestamp.toI32();
  generalInfo.save();

  return generalInfo;
}
