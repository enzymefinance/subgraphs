import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts';
import { GeneralInfo } from '../generated/schema';

let generalInfoId = 'general.info';

export function increaseDepositorCounter(event: ethereum.Event) {
  let generalInfo = ensureGeneralInfo();

  generalInfo.depositorsCounter = generalInfo.depositorsCounter + 1;
  generalInfo.updatedAt = event.block.timestamp.toI32();
  generalInfo.save();
}

function ensureGeneralInfo(): GeneralInfo {
  let generalInfo = GeneralInfo.load(generalInfoId);

  if (generalInfo) {
    return generalInfo;
  }

  generalInfo = new GeneralInfo(generalInfoId);
  generalInfo.depositorsCounter = 0;
  generalInfo.updatedAt = 0;
  generalInfo.save();

  return generalInfo;
}
