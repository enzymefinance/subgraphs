import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { logCritical } from '@enzymefinance/subgraph-utils';
import { ERC20Sdk } from '../generated/contracts/ERC20Sdk';
import { ERC20BytesSdk } from '../generated/contracts/ERC20BytesSdk';

export function tokenName(address: Address): string {
  let contract = ERC20Sdk.bind(address);
  let nameCall = contract.try_name();
  if (!nameCall.reverted) {
    return nameCall.value;
  }

  let bytesContract = ERC20BytesSdk.bind(address);
  let nameBytesCall = bytesContract.try_name();
  if (!nameBytesCall.reverted) {
    return nameBytesCall.value.toString();
  }

  log.error('name() call (string or bytes) reverted for {}', [address.toHex()]);
  return 'UNKNOWN';
}

export function tokenSymbol(address: Address): string {
  let contract = ERC20Sdk.bind(address);
  let symbolCall = contract.try_symbol();
  if (!symbolCall.reverted) {
    return symbolCall.value;
  }

  let bytesContract = ERC20BytesSdk.bind(address);
  let symbolBytesCall = bytesContract.try_symbol();
  if (!symbolBytesCall.reverted) {
    return symbolBytesCall.value.toString();
  }

  log.error('symbol() call (string or bytes) reverted for {}', [address.toHex()]);
  return 'UNKNOWN';
}

export function tokenTotalSupply(address: Address): BigInt | null {
  let contract = ERC20Sdk.bind(address);
  let totalSupply = contract.try_totalSupply();
  if (!totalSupply.reverted) {
    return totalSupply.value;
  }

  log.error('totalSupply() call reverted for {}', [address.toHex()]);
  return null;
}

export function tokenTotalSupplyOrThrow(address: Address): BigInt {
  let contract = ERC20Sdk.bind(address);
  let totalSupply = contract.try_totalSupply();
  if (totalSupply.reverted) {
    logCritical('totalSupply() call reverted for {}', [address.toHex()]);
  }

  return totalSupply.value;
}

export function tokenDecimals(address: Address): i32 {
  let contract = ERC20Sdk.bind(address);
  let decimalsCall = contract.try_decimals();
  if (!decimalsCall.reverted) {
    return decimalsCall.value;
  }

  log.error('decimals() call reverted for {}', [address.toHex()]);
  return -1;
}

export function tokenDecimalsOrFallback(address: Address, fallback: i32 = 18): i32 {
  let contract = ERC20Sdk.bind(address);
  let decimalsCall = contract.try_decimals();
  if (!decimalsCall.reverted) {
    return decimalsCall.value;
  }

  log.error('decimals() call reverted for {}', [address.toHex()]);
  return fallback;
}

export function tokenDecimalsOrThrow(address: Address): i32 {
  let contract = ERC20Sdk.bind(address);
  let decimalsCall = contract.try_decimals();
  if (decimalsCall.reverted) {
    logCritical('decimals() call reverted for {}', [address.toHex()]);
  }

  return decimalsCall.value;
}

export function tokenBalance(address: Address, account: Address): BigInt | null {
  let contract = ERC20Sdk.bind(address);
  let balanceOf = contract.try_balanceOf(account);
  if (!balanceOf.reverted) {
    return balanceOf.value;
  }

  log.error('balanceOf() call reverted for {} (account: {})', [address.toHex(), account.toHex()]);
  return null;
}

export function tokenAllowance(address: Address, owner: Address, spender: Address): BigInt | null {
  let contract = ERC20Sdk.bind(address);
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
