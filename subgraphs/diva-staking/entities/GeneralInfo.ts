import { BigDecimal } from '@graphprotocol/graph-ts';
import { GeneralInfo } from '../generated/schema';

let generalInfoId = 'general.info';

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