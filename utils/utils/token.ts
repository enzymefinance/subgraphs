import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { ERC20Contract } from './contracts/ERC20Contract';
import { ERC20NameBytesContract } from './contracts/ERC20NameBytesContract';
import { ERC20SymbolBytesContract } from './contracts/ERC20SymbolBytesContract';

export function tokenName(address: Address): string {
  let contract = ERC20Contract.bind(address);
  let nameCall = contract.try_name();
  if (!nameCall.reverted) {
    return nameCall.value;
  }

  let bytesContract = ERC20NameBytesContract.bind(address);
  let nameBytesCall = bytesContract.try_name();
  if (!nameBytesCall.reverted) {
    return nameBytesCall.value.toString();
  }

  log.error('name() call (string or bytes) reverted for {}', [address.toHex()]);
  return 'UNKNOWN';
}

export function tokenSymbol(address: Address): string {
  let contract = ERC20Contract.bind(address);
  let symbolCall = contract.try_symbol();
  if (!symbolCall.reverted) {
    return symbolCall.value;
  }

  let bytesContract = ERC20SymbolBytesContract.bind(address);
  let symbolBytesCall = bytesContract.try_symbol();
  if (!symbolBytesCall.reverted) {
    return symbolBytesCall.value.toString();
  }

  log.error('symbol() call (string or bytes) reverted for {}', [address.toHex()]);
  return 'UNKNOWN';
}

export function tokenDecimals(address: Address): i32 {
  let contract = ERC20Contract.bind(address);
  let decimalsCall = contract.try_decimals();
  if (!decimalsCall.reverted) {
    return decimalsCall.value;
  }

  log.error('decimals() call reverted for {}', [address.toHex()]);
  return -1;
}

export function tokenBalance(address: Address, account: Address): BigInt | null {
  let contract = ERC20Contract.bind(address);
  let balanceOf = contract.try_balanceOf(account);
  if (!balanceOf.reverted) {
    return balanceOf.value;
  }

  log.error('balanceOf() call reverted for {} (account: {})', [address.toHex(), account.toHex()]);
  return null;
}

export function tokenAllowance(address: Address, owner: Address, spender: Address): BigInt | null {
  let contract = ERC20Contract.bind(address);
  let allownace = contract.try_allowance(owner, spender);
  if (!allownace.reverted) {
    return allownace.value;
  }

  log.error('allowance() call reverted for {} (owner: {}, spender: {})', [
    address.toHex(),
    owner.toHex(),
    spender.toHex(),
  ]);
  return null;
}
