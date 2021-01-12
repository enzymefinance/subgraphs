import { Address } from '@graphprotocol/graph-ts';
import { IFeeInterface } from '../generated/IFeeInterface';
import { Fee } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { ensureFeeManager } from './FeeManager';

export function useFee(id: string): Fee {
  let fee = Fee.load(id) as Fee;
  if (fee == null) {
    logCritical('Failed to load fee {}.', [id]);
  }

  return fee;
}

export function ensureFee(address: Address, feeManager: Address): Fee {
  let fee = Fee.load(address.toHex()) as Fee;
  if (fee) {
    return fee;
  }

  let contract = IFeeInterface.bind(address);
  let identifierCall = contract.try_identifier();
  if (identifierCall.reverted) {
    logCritical('identifier() reverted for {}', [address.toHex()]);
  }

  fee = new Fee(address.toHex());
  fee.feeManager = ensureFeeManager(feeManager).id;
  fee.identifier = identifierCall.value;
  fee.save();

  return fee;
}
