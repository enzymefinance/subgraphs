import { logCritical } from '@enzymefinance/subgraph-utils';
import { BigDecimal, Entity, ethereum } from '@graphprotocol/graph-ts';
import { Asset, HoldingState, Vault } from '../generated/schema';

function holdingStateId(asset: Asset, vault: Vault, event: ethereum.Event): string {
  return vault.id + '/' + event.block.timestamp.toString() + '/holding/' + asset.id;
}

export function createHoldingState(
  asset: Asset,
  amount: BigDecimal,
  fund: Vault,
  event: ethereum.Event,
  cause: Entity,
): HoldingState {
  let holding = new HoldingState(holdingStateId(asset, fund, event));
  holding.timestamp = event.block.timestamp;
  holding.vault = fund.id;
  holding.asset = asset.id;
  // holding.price = asset.price;
  holding.amount = amount;
  holding.events = [cause.getString('id')];
  holding.save();

  return holding;
}

export function useHoldingState(id: string): HoldingState {
  let holdings = HoldingState.load(id) as HoldingState;
  if (holdings == null) {
    logCritical('Failed to load fund holdings {}.', [id]);
  }

  return holdings;
}

export function findHoldingState(holdings: HoldingState[], asset: Asset): HoldingState | null {
  for (let i: i32 = 0; i < holdings.length; i++) {
    if (holdings[i].asset == asset.id) {
      return holdings[i];
    }
  }

  return null;
}
