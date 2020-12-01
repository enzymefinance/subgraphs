import { Address } from '@graphprotocol/graph-ts';
import { IUniswapV2Pair } from '../generated/IUniswapV2Pair';
import { Asset, UniswapV2PoolAssetDetail } from '../generated/schema';

export function checkUniswapV2PoolAssetDetail(derivative: Asset): void {
  if (derivative.symbol != 'UNI-V2') {
    return;
  }

  let uniswapPair = IUniswapV2Pair.bind(Address.fromString(derivative.id));

  let details = new UniswapV2PoolAssetDetail(derivative.id);
  details.token0 = uniswapPair.token0().toHex();
  details.token1 = uniswapPair.token1().toHex();
  details.save();

  derivative.derivativeType = 'UniswapV2Pool';
  derivative.uniswapV2PoolAssetDetail = details.id;
  derivative.save();
}
