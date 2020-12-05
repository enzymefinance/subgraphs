import { Address } from '@graphprotocol/graph-ts';
import { GuaranteedRedemptionContract } from '../generated/GuaranteedRedemptionContract';
import { GuaranteedRedemption } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useGuaranteedRedemption(id: string): GuaranteedRedemption {
  let guaranteedRedemption = GuaranteedRedemption.load(id) as GuaranteedRedemption;
  if (guaranteedRedemption == null) {
    logCritical('Failed to load GuaranteedRedemption {}.', [id]);
  }

  return guaranteedRedemption;
}

export function ensureGuaranteedRedemption(address: Address): GuaranteedRedemption {
  let guaranteedRedemption = GuaranteedRedemption.load(address.toHex()) as GuaranteedRedemption;
  if (guaranteedRedemption) {
    return guaranteedRedemption;
  }

  let contract = GuaranteedRedemptionContract.bind(address);

  guaranteedRedemption = new GuaranteedRedemption(address.toHex());
  guaranteedRedemption.adapters = new Array<string>();
  guaranteedRedemption.buffer = contract.getRedemptionWindowBuffer();
  guaranteedRedemption.save();

  return guaranteedRedemption;
}
