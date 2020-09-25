import { Address } from '@graphprotocol/graph-ts';
import { IFeeInterface } from '../generated/IFeeInterface';
import { Fee } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useFee(id: string): Fee {
  let fee = Fee.load(id) as Fee;
  if (fee == null) {
    logCritical('Failed to load fee {}.', [id]);
  }

  return fee;
}

export function ensureFee(address: Address): Fee {
  let fee = Fee.load(address.toHex()) as Fee;
  if (fee) {
    return fee;
  }

  let contract = IFeeInterface.bind(address);
  let identifier = contract.identifier();

  fee = new Fee(address.toHex());
  fee.identifier = identifier;
  fee.funds = [];
  fee.save();

  return fee;
}
