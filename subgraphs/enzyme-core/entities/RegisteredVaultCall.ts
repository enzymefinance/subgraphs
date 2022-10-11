import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { RegisteredVaultCall } from '../generated/schema';

export function getRegisteredVaultCallId(contract: Address, selector: Bytes, dataHash: Bytes): string {
  return contract.toHex() + '/' + selector.toHex() + '/' + dataHash.toHex();
}

export function ensureRegisteredVaultCall(
  contract: Address,
  selector: Bytes,
  dataHash: Bytes,
  event: ethereum.Event,
): RegisteredVaultCall {
  let id = getRegisteredVaultCallId(contract, selector, dataHash);

  let vaultCall = RegisteredVaultCall.load(id);

  if (vaultCall != null) {
    return vaultCall;
  }

  vaultCall = new RegisteredVaultCall(id);
  vaultCall.contract = contract;
  vaultCall.selector = selector;
  vaultCall.dataHash = dataHash;
  vaultCall.registered = true;
  vaultCall.registeredTimestamp = event.block.timestamp.toI32();
  vaultCall.save();

  return vaultCall;
}
