import { BigDecimal, Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { toBigDecimal, arrayDiff } from '@enzymefinance/subgraph-utils';
import { Vault, Asset, Holding } from '../generated/schema';
import { tokenBalance } from '../utils/tokenCalls';

export function getOrCreateHolding(vault: Vault, asset: Asset, event: ethereum.Event): Holding {
  let id = vault.id + '/' + asset.id;
  let holding = Holding.load(id);

  if (holding == null) {
    holding = new Holding(id);
    holding.asset = asset.id;
    holding.vault = vault.id;
    holding.tracked = false;
    holding.updated = event.block.number.toI32();
    holding.balance = BigDecimal.fromString('0');
    holding.save();
  }

  return holding as Holding;
}

function maintainPortfolio(vault: Vault, holding: Holding): void {
  // Bail out early if the holding entity is already registered in the current portfolio.
  let included = vault.portfolio.includes(holding.id);
  if (holding.tracked && !included) {
    vault.portfolio = vault.portfolio.concat([holding.id]);
  } else if (!holding.tracked && included) {
    vault.portfolio = arrayDiff<string>(vault.portfolio, [holding.id]);
  }

  vault.updated = holding.updated;
  vault.save();
}

export function updateHoldingBalance(vault: Vault, asset: Asset, event: ethereum.Event): Holding {
  let holding = getOrCreateHolding(vault, asset, event);

  // TODO: Is it reasonable to assume that we can default this to `0` if the balance cannot be fetched.
  let balanceOrNull = tokenBalance(Address.fromString(asset.id), Address.fromString(vault.id));
  let currentBalance = !balanceOrNull
    ? BigDecimal.fromString('0')
    : toBigDecimal(balanceOrNull as BigInt, asset.decimals);

  // Update the holding balance.
  holding.balance = currentBalance;
  holding.updated = event.block.number.toI32();
  holding.save();

  // Create a historical snapshot of the holding entity.
  maintainPortfolio(vault, holding);

  return holding;
}

export function updateTrackedAsset(vault: Vault, asset: Asset, event: ethereum.Event, tracked: boolean): void {
  let holding = getOrCreateHolding(vault, asset, event);
  holding.tracked = tracked;
  holding.save();

  // Create a historical snapshot of the holding entity.
  maintainPortfolio(vault, holding);
}
