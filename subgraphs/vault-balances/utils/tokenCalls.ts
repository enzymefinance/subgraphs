import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { logCritical } from '@enzymefinance/subgraph-utils';
import { ERC20Sdk } from '../generated/contracts/ERC20Sdk';

export function tokenDecimals(address: Address): i32 {
  let contract = ERC20Sdk.bind(address);
  let decimalsCall = contract.try_decimals();
  if (!decimalsCall.reverted) {
    return decimalsCall.value;
  }

  log.error('decimals() call reverted for {}', [address.toHex()]);
  return -1;
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
