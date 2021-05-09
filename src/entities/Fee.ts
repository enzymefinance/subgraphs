import { Address } from '@graphprotocol/graph-ts';
import { ManagementFeeContract } from '../generated/ManagementFeeContract';
import { Fee } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { ensureFeeManager } from './FeeManager';

export function ensureFee(address: Address): Fee {
  let fee = Fee.load(address.toHex()) as Fee;
  if (fee) {
    return fee;
  }

  // mis-using ManagementFeeContract, because IFeeInterface doesn't have getFeeManager()
  let contract = ManagementFeeContract.bind(address);
  let identifierCall = contract.try_identifier();
  if (identifierCall.reverted) {
    logCritical('identifier() reverted for {}', [address.toHex()]);
  }

  let feeManagerCall = contract.try_getFeeManager();
  if (feeManagerCall.reverted) {
    logCritical('getFeeManager() reverted', []);
  }

  fee = new Fee(address.toHex());
  fee.feeManager = ensureFeeManager(feeManagerCall.value).id;
  fee.identifier = identifierCall.value;
  fee.save();

  return fee;
}
