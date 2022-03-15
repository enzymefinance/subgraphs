import { logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { NonfungiblePositionManagerSdk } from '../generated/contracts/NonfungiblePositionManagerSdk';
import { UniswapV3Nft } from '../generated/schema';
import { ensureAsset } from './Asset';

export function createUniswapV3Nft(
  tokenId: BigInt,
  externalPositionAddress: Address,
  nonFungiblePositionManagerAddress: Address,
): UniswapV3Nft {
  let nonfungiblePositionManager = NonfungiblePositionManagerSdk.bind(nonFungiblePositionManagerAddress);
  let positions = nonfungiblePositionManager.positions(tokenId);

  // function positions(uint256 tokenId)
  // external
  // view
  // returns (
  //     uint96 nonce,
  //     address operator,
  //     address token0,
  //     address token1,
  //     uint24 fee,
  //     int24 tickLower,
  //     int24 tickUpper,
  //     uint128 liquidity,
  //     uint256 feeGrowthInside0LastX128,
  //     uint256 feeGrowthInside1LastX128,
  //     uint128 tokensOwed0,
  //     uint128 tokensOwed1
  // );

  let token0 = ensureAsset(positions.value2);
  let token1 = ensureAsset(positions.value3);

  let nft = new UniswapV3Nft(tokenId.toString());
  nft.externalPosition = externalPositionAddress.toHex();

  nft.token0 = token0.id;
  nft.token1 = token1.id;
  nft.fee = BigInt.fromI32(positions.value4).toBigDecimal().div(BigDecimal.fromString('1000000'));
  nft.tickLower = positions.value5;
  nft.tickUpper = positions.value6;
  nft.save();

  return nft;
}

export function useUniswapV3Nft(tokenId: BigInt): UniswapV3Nft {
  let nft = UniswapV3Nft.load(tokenId.toString());
  if (nft == null) {
    logCritical('Failed to load vault {}.', [tokenId.toString()]);
  }

  return nft as UniswapV3Nft;
}
