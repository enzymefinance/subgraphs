import { Adapter } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { Address } from '@graphprotocol/graph-ts';

export function useAdapter(id: string): Adapter {
  let adapter = Adapter.load(id);
  if (adapter == null) {
    logCritical('Failed to load asset {}.', [id]);
  }

  return adapter as Adapter;
}

export function ensureAdapter(address: Address, identifier: string): Adapter {
  let adapter = Adapter.load(address.toHex()) as Adapter;
  if (adapter) {
    return adapter;
  }

  adapter = new Adapter(address.toHex());
  adapter.identifier = identifier;
  adapter.save();

  return adapter;
}
