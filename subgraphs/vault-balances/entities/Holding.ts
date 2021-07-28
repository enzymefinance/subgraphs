import { BigDecimal, Address, BigInt } from '@graphprotocol/graph-ts';
import { tokenBalance, toBigDecimal } from '../../../utils';
import { Vault, Asset, Holding } from '../generated/schema';

export function updateHolding(vault: Vault, asset: Asset, timestamp: BigInt): Holding {
  let id = vault.id + '/' + asset.id;
  let holding = Holding.load(id) as Holding;

  if (holding == null) {
    holding = new Holding(id);
    holding.asset = asset.id;
    holding.vault = vault.id;
    holding.tracked = false;
    holding.external = false;
    holding.balance = BigDecimal.fromString('0');
  }

  let vaultAddress = Address.fromString(vault.id);
  let assetAddress = Address.fromString(asset.id);

  // TODO: Is it reasonable to assume that we can default this to `0` if the balance cannot be fetched.
  let balanceOrNull = tokenBalance(assetAddress, vaultAddress);
  let currentBalance =
    balanceOrNull == null ? BigDecimal.fromString('0') : toBigDecimal(balanceOrNull as BigInt, asset.decimals);
  let previousBalance = holding.balance;

  // Update the vault balance.
  holding.balance = currentBalance;
  holding.updated = timestamp;
  holding.save();

  // Update the total value locked (in the entire network) of this asset.
  asset.total = asset.total.minus(previousBalance).plus(currentBalance);
  asset.save();

  return holding;
}
