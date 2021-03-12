import { Address } from '@graphprotocol/graph-ts';
import { IUniswapV2Pair } from '../generated/IUniswapV2Pair';
import { Asset, UniswapV2PoolAssetDetail } from '../generated/schema';
import { getERC20Symbol } from '../utils/getERC20Symbol';

export function checkUniswapV2PoolAssetDetail(derivative: Asset): void {
  if (derivative.symbol != 'UNI-V2') {
    return;
  }

  // TODO: monitor events in the UniswapV2PoolPriceFeed and get data from there

  let uniswapPair = IUniswapV2Pair.bind(Address.fromString(derivative.id));

  let details = new UniswapV2PoolAssetDetail(derivative.id);
  let token0Address = uniswapPair.token0();
  let token1Address = uniswapPair.token1();

  details.token0 = token0Address.toHex();
  details.token1 = token1Address.toHex();
  details.save();

  let symbol0 = getERC20Symbol(token0Address);
  let symbol1 = getERC20Symbol(token1Address);

  let name = 'Uniswap ' + symbol0 + '/' + symbol1 + ' Pool';

  derivative.name = name;
  derivative.derivativeType = 'UniswapPool';
  derivative.uniswapV2PoolAssetDetails = details.id;
  derivative.save();
}
