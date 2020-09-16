import { Address } from '@graphprotocol/graph-ts';
import { Dispatcher } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useDispatcher(id: string): Dispatcher {
  let dispatcher = Dispatcher.load(id);
  if (dispatcher == null) {
    logCritical('Failed to load dispatcher {}.', [id]);
  }

  return dispatcher as Dispatcher;
}

export function ensureDispatcher(address: Address): Dispatcher {
  let dispatcher = Dispatcher.load(address.toHex()) as Dispatcher;
  if (dispatcher) {
    return dispatcher;
  }

  dispatcher = new Dispatcher(address.toHex());
  dispatcher.save();

  return dispatcher;
}
