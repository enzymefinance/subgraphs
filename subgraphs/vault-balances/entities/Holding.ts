import { BigDecimal, Address, BigInt } from '@graphprotocol/graph-ts';
import { tokenBalance, toBigDecimal, arrayDiff } from '@enzymefinance/subgraph-utils';
import { Vault, Asset, Holding } from '../generated/schema';

function getOrCreateHolding(vault: Vault, asset: Asset, timestamp: BigInt): Holding {
  let id = vault.id + '/' + asset.id;
  let holding = Holding.load(id);

  if (holding == null) {
    holding = new Holding(id);
    holding.asset = asset.id;
    holding.vault = vault.id;
    holding.tracked = false;
    holding.external = false;
    holding.portfolio = false;
    holding.updated = timestamp;
    holding.balance = BigDecimal.fromString('0');
    holding.save();
  }

  return holding as Holding;
}

function maintainPortfolio(vault: Vault, holding: Holding): void {
  // Bail out early if the holding entity is already registered in the current portfolio.
  let included = vault.portfolio.includes(holding.id);
  if (holding.portfolio && !included) {
    vault.portfolio = vault.portfolio.concat([holding.id]);
  } else if (!holding.portfolio && included) {
    vault.portfolio = arrayDiff<string>(vault.portfolio, [holding.id]);
  }

  vault.updated = holding.updated;
  vault.save();
}

export function updateHoldingBalance(vault: Vault, asset: Asset, timestamp: BigInt): Holding {
  let holding = getOrCreateHolding(vault, asset, timestamp);

  // TODO: Is it reasonable to assume that we can default this to `0` if the balance cannot be fetched.
  let balanceOrNull = tokenBalance(Address.fromString(asset.id), Address.fromString(vault.id));
  let currentBalance =
    balanceOrNull == null ? BigDecimal.fromString('0') : toBigDecimal(balanceOrNull as BigInt, asset.decimals);
  let previousBalance = holding.balance;

  // Update the holding balance.
  holding.balance = currentBalance;
  holding.updated = timestamp;
  holding.save();

  // Update the total value locked (in the entire network) of this asset.
  asset.total = asset.total.minus(previousBalance).plus(currentBalance);
  asset.save();

  // Create a historical snapshot of the holding entity.
  maintainPortfolio(vault, holding);

  return holding;
}

export function updateTrackedAsset(vault: Vault, asset: Asset, timestamp: BigInt, tracked: boolean): void {
  let holding = getOrCreateHolding(vault, asset, timestamp);
  holding.tracked = tracked;
  holding.portfolio = holding.tracked || holding.external;
  holding.save();

  // Create a historical snapshot of the holding entity.
  maintainPortfolio(vault, holding);
}

export function updateExternalPosition(vault: Vault, asset: Asset, timestamp: BigInt, external: boolean): void {
  let holding = getOrCreateHolding(vault, asset, timestamp);
  holding.external = external;
  holding.portfolio = holding.tracked || holding.external;
  holding.save();

  // Create a historical snapshot of the holding entity.
  maintainPortfolio(vault, holding);
}
