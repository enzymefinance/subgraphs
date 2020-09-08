import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Contract } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useContract(id: string): Contract {
  let contract = Contract.load(id);
  if (contract == null) {
    logCritical('Failed to load contract {}.', [id]);
  }

  return contract as Contract;
}

export function ensureContract(address: Address, name: string, timestamp: BigInt): Contract {
  let contract = Contract.load(address.toHex()) as Contract;
  if (contract) {
    return contract;
  }

  contract = new Contract(address.toHex());
  contract.name = name;
  contract.timestamp = timestamp;
  contract.save();

  return contract;
}
