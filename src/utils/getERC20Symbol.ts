import { Address, log } from '@graphprotocol/graph-ts';
import { ERC20Contract } from '../generated/ERC20Contract';
import { ERC20SymbolBytesContract } from '../generated/ERC20SymbolBytesContract';

export function getERC20Symbol(address: Address): string {
  let contract = ERC20Contract.bind(address);

  let symbolCall = contract.try_symbol();
  let symbol = 'Unknown';

  // standard ERC20 implementation
  if (!symbolCall.reverted) {
    return symbolCall.value;
  }

  // non-standard ERC20 implementation
  let bytesContract = ERC20SymbolBytesContract.bind(address);

  let symbolBytesCall = bytesContract.try_symbol();
  if (!symbolBytesCall.reverted) {
    return symbolBytesCall.value.toString();
  }

  // warning if both calls fail
  log.warning('symbol() call (string or bytes) reverted for {}', [address.toHex()]);
  return symbol;
}
