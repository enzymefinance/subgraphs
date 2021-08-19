import { logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { ERC20Contract } from '../generated/ERC20Contract';
import { Account, Comptroller, Release, Vault } from '../generated/schema';

export function createVault(
  address: Address,
  name: string,
  inception: BigInt,
  release: Release,
  comptroller: Comptroller,
  owner: Account,
  creator: Account,
): Vault {
  let vault = new Vault(address.toHex());
  vault.name = name;
  vault.inception = inception;
  vault.release = release.id;
  vault.comptroller = comptroller.id;
  vault.owner = owner.id;
  vault.creator = creator.id;
  vault.assetManagers = new Array<string>();
  vault.trackedAssets = new Array<string>();
  vault.investmentCount = 0;
  vault.freelyTransferableShares = false;
  vault.totalSupply = BigDecimal.fromString('0');
  vault.investmentCount = 0;
  vault.save();

  return vault;
}

export function useVault(id: string): Vault {
  let vault = Vault.load(id) as Vault;
  if (vault == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return vault;
}

export function trackVaultTotalSupply(vault: Vault): void {
  let vaultProxy = ERC20Contract.bind(Address.fromString(vault.id));

  let totalSupplyCall = vaultProxy.try_totalSupply();
  if (totalSupplyCall.reverted) {
    logCritical('totalSupply() reverted for vault{}', [vault.id]);
  }

  vault.totalSupply = toBigDecimal(totalSupplyCall.value);
  vault.save();
}
