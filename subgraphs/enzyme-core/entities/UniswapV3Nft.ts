import { logCritical } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { UniswapV3Sdk } from '../generated/contracts/UniswapV3Sdk';
import { UniswapV3Nft } from '../generated/schema';
import { ensureAsset } from './Asset';

export function useUniswapV3Nft(tokenId: BigInt): UniswapV3Nft {
  let nft = UniswapV3Nft.load(tokenId.toString());
  if (nft == null) {
    logCritical('Failed to load UniswapV3Nft entity with ID {}.', [tokenId.toString()]);
  }

  return nft as UniswapV3Nft;
}

export function createUniswapV3Nft(
  tokenId: BigInt,
  externalPositionAddress: Address,
  nonFungiblePositionManagerAddress: Address,
): UniswapV3Nft {
  let nonFungiblePositionManager = UniswapV3Sdk.bind(nonFungiblePositionManagerAddress);
  let positions = nonFungiblePositionManager.positions(tokenId);

  // value0     uint96 nonce,
  // value1     address operator,
  // value2     address token0,
  // value3     address token1,
  // value4     uint24 fee,
  // value5     int24 tickLower,
  // value6     int24 tickUpper,
  // value7     uint128 liquidity,
  // value8     uint256 feeGrowthInside0LastX128,
  // value9     uint256 feeGrowthInside1LastX128,
  // value10    uint128 tokensOwed0,
  // value11    uint128 tokensOwed1

  let uniswapV3Factory = UniswapV3Sdk.bind(nonFungiblePositionManager.factory());
  let poolAddress = uniswapV3Factory.getPool(positions.value2, positions.value3, positions.value4);

  let token0 = ensureAsset(positions.value2);
  let token1 = ensureAsset(positions.value3);

  let nft = new UniswapV3Nft(tokenId.toString());
  nft.externalPosition = externalPositionAddress.toHex();

  nft.token0 = token0.id;
  nft.token1 = token1.id;
  nft.fee = BigInt.fromI32(positions.value4).toBigDecimal().div(BigDecimal.fromString('1000000'));
  nft.tickLower = positions.value5;
  nft.tickUpper = positions.value6;
  nft.liquidity = positions.value7;
  nft.poolAddress = poolAddress;
  nft.save();

  return nft;
}

export function trackUniswapV3Nft(tokenId: BigInt, nonFungiblePositionManagerAddress: Address): UniswapV3Nft {
  let nonFungiblePositionManager = UniswapV3Sdk.bind(nonFungiblePositionManagerAddress);
  let positions = nonFungiblePositionManager.positions(tokenId);

  let nft = useUniswapV3Nft(tokenId);
  nft.liquidity = positions.value7;
  nft.save();

  return nft;
}
