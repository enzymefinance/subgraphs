import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Fee } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useFee(id: string): Fee {
  let fee = Fee.load(id);
  if (fee == null) {
    logCritical('Failed to load fee {}.', [id]);
  }

  return fee as Fee;
}

export function ensureFee(address: Address, identifier: string, timestamp: BigInt): Fee {
  let fee = Fee.load(address.toHex()) as Fee;
  if (fee) {
    return fee;
  }

  fee = new Fee(address.toHex());
  fee.identifier = identifier;
  fee.timestamp = timestamp;
  fee.funds = [];
  fee.save();

  return fee;
}
