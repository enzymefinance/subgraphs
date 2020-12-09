import { Address } from '@graphprotocol/graph-ts';
import { ERC20Contract } from '../generated/ERC20Contract';
import { IUniswapV2Pair } from '../generated/IUniswapV2Pair';
import { Asset, UniswapV2PoolAssetDetail } from '../generated/schema';

export function checkUniswapV2PoolAssetDetail(derivative: Asset): void {
  if (derivative.symbol != 'UNI-V2') {
    return;
  }

  let uniswapPair = IUniswapV2Pair.bind(Address.fromString(derivative.id));

  let details = new UniswapV2PoolAssetDetail(derivative.id);
  let token0Address = uniswapPair.token0();
  let token1Address = uniswapPair.token1();

  details.token0 = token0Address.toHex();
  details.token1 = token1Address.toHex();
  details.save();

  let contract0 = ERC20Contract.bind(token0Address);
  let contract1 = ERC20Contract.bind(token1Address);

  let symbol0 = contract0.symbol();
  let symbol1 = contract1.symbol();

  let name = 'Uniswap ' + symbol0 + '/' + symbol1 + ' Pool';

  derivative.name = name;
  derivative.derivativeType = 'UniswapPool';
  derivative.uniswapV2PoolAssetDetail = details.id;
  derivative.save();
}
