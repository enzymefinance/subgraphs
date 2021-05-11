import { Address } from '@graphprotocol/graph-ts';
import { logCritical } from '../../../utils/utils/logging';
import { GuaranteedRedemptionContract } from '../generated/GuaranteedRedemptionContract';
import { GuaranteedRedemption } from '../generated/schema';

export function ensureGuaranteedRedemption(address: Address): GuaranteedRedemption {
  let guaranteedRedemption = GuaranteedRedemption.load(address.toHex()) as GuaranteedRedemption;
  if (guaranteedRedemption) {
    return guaranteedRedemption;
  }

  let contract = GuaranteedRedemptionContract.bind(address);
  let redemptionWindowBufferCall = contract.try_getRedemptionWindowBuffer();
  if (redemptionWindowBufferCall.reverted) {
    logCritical('getRedemptionWindowBuffer() call reverted for {}', [address.toHex()]);
  }

  guaranteedRedemption = new GuaranteedRedemption(address.toHex());
  guaranteedRedemption.adapters = new Array<string>();
  guaranteedRedemption.buffer = redemptionWindowBufferCall.value;
  guaranteedRedemption.save();

  return guaranteedRedemption;
}
