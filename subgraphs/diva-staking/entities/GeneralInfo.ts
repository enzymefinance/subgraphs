import { ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { GeneralInfo } from '../generated/schema';

let generalInfoId = 'general.info';

export function updateDepositorCounter(amount: number, event: ethereum.Event): GeneralInfo {
  let generalInfo = ensureGeneralInfo();

  generalInfo.depositorsCounter = (generalInfo.depositorsCounter + amount) as i32;
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
  generalInfo.depositorsCounter = 0;
  generalInfo.updatedAt = 0;
  generalInfo.vaultsGav = BigDecimal.zero();
  generalInfo.save();

  return generalInfo;
}

export function updateVaulsGav(amount: BigDecimal, event: ethereum.Event): GeneralInfo {
  let generalInfo = ensureGeneralInfo();

  generalInfo.vaultsGav = generalInfo.vaultsGav.plus(amount);
  generalInfo.updatedAt = event.block.timestamp.toI32();
  generalInfo.save();

  return generalInfo;
}