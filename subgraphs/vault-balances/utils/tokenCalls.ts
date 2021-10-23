import { ZERO_BI } from '@enzymefinance/subgraph-utils';
import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { ERC20Sdk } from '../generated/contracts/ERC20Sdk';

export function tokenDecimals(address: Address, fallback: i32 = 18): i32 {
  let contract = ERC20Sdk.bind(address);
  let decimalsCall = contract.try_decimals();
  if (!decimalsCall.reverted) {
    return decimalsCall.value;
  }

  log.error('decimals() call reverted for {}', [address.toHex()]);
  return fallback;
}

export function tokenBalance(address: Address, account: Address, fallback: BigInt = ZERO_BI): BigInt {
  let contract = ERC20Sdk.bind(address);
  let balanceOf = contract.try_balanceOf(account);
  if (!balanceOf.reverted) {
    return balanceOf.value;
  }

  // TODO: Is it reasonable to assume that we can default this to `0` if the balance cannot be fetched.
  log.error('balanceOf() call reverted for {} (account: {})', [address.toHex(), account.toHex()]);
  return fallback;
}

export function supportsBalanceOfCall(address: Address): boolean {
  let contract = ERC20Sdk.bind(address);
  let vitalik = Address.fromString('0xab5801a7d398351b8be11c439e05c5b3259aec9b');
  if (contract.try_balanceOf(vitalik).reverted) {
    log.error('cannot fetch balances for asset {}', [address.toHex()]);
    return false;
  }

  return true;
}
