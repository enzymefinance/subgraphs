import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import {
  Asset,
  UniswapV3LiquidityPosition,
  UniswapV3LiquidityPositionChange,
  Vault,
  AssetAmount,
  ExternalPositionType,
  UniswapV3Nft,
} from '../generated/schema';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';

export function useUniswapV3LiquidityPosition(id: string): UniswapV3LiquidityPosition {
  let ulp = UniswapV3LiquidityPosition.load(id);
  if (ulp == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return ulp as UniswapV3LiquidityPosition;
}

export function createUniswapV3LiquidityPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): UniswapV3LiquidityPosition {
  let aaveDebtPosition = new UniswapV3LiquidityPosition(externalPositionAddress.toHex());
  aaveDebtPosition.vault = useVault(vaultAddress.toHex()).id;
  aaveDebtPosition.active = true;
  aaveDebtPosition.type = type.id;
  aaveDebtPosition.save();

  return aaveDebtPosition;
}

export function createUniswapV3LiquidityPositionChange(
  externalPositionAddress: Address,
  nft: UniswapV3Nft | null,
  assetAmounts: AssetAmount[] | null,
  liquidity: BigInt | null,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): UniswapV3LiquidityPositionChange {
  let change = new UniswapV3LiquidityPositionChange(uniqueEventId(event));
  change.uniswapV3LiquidityPositionChangeType = changeType;
  change.externalPosition = externalPositionAddress.toHex();
  change.nft = nft != null ? nft.id : null;
  change.assetAmounts = assetAmounts != null ? assetAmounts.map<string>((assetAmount) => assetAmount.id) : null;
  change.liquidity = liquidity;
  change.vault = vault.id;
  change.activityCounter = getActivityCounter();
  change.activityCategories = ['Vault'];
  change.activityType = 'Trade';
  change.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();

  return change;
}

export function trackUniswapV3LiquidityPosition(): void {
  // Nothing to do here: Uniswap V3 nft parameters are unchanged, so we don't need to track them.
  // Anything that does change (i.e. nft liquidity) is subject to fluctiations, so we cannot track it.
}
