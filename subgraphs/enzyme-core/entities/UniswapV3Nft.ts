import { logCritical, ZERO_BI } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { ExternalSdk } from '../generated/contracts/ExternalSdk';
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
  let nonFungiblePositionManager = ExternalSdk.bind(nonFungiblePositionManagerAddress);
  let positions = nonFungiblePositionManager.positions(tokenId);
  let tokenURI = nonFungiblePositionManager.tokenURI(tokenId);

  let uniswapV3Factory = ExternalSdk.bind(nonFungiblePositionManager.factory());
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
  nft.tokenURI = tokenURI;
  nft.save();

  return nft;
}

export function trackUniswapV3Nft(tokenId: BigInt, nonFungiblePositionManagerAddress: Address): UniswapV3Nft {
  let nonFungiblePositionManager = ExternalSdk.bind(nonFungiblePositionManagerAddress);
  let positions = nonFungiblePositionManager.try_positions(tokenId);

  let nft = useUniswapV3Nft(tokenId);

  if (positions.reverted == false) {
    nft.liquidity = positions.value.value7;
  } else {
    nft.liquidity = ZERO_BI;
  }
  nft.save();

  return nft;
}
