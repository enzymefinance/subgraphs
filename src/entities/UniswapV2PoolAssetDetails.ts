import { Address, log } from '@graphprotocol/graph-ts';
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
  let symbol0Call = contract0.try_symbol();
  let symbol0 = symbol0Call.reverted ? '' : symbol0Call.value;
  if (symbol0Call.reverted) {
    log.warning('symbol() call reverted for {}', [token0Address.toHex()]);
  }

  let contract1 = ERC20Contract.bind(token1Address);
  let symbol1Call = contract1.try_symbol();
  let symbol1 = symbol1Call.reverted ? '' : symbol1Call.value;
  if (symbol1Call.reverted) {
    log.warning('symbol() call reverted for {}', [token1Address.toHex()]);
  }

  let name = 'Uniswap ' + symbol0 + '/' + symbol1 + ' Pool';

  derivative.name = name;
  derivative.derivativeType = 'UniswapPool';
  derivative.uniswapV2PoolAssetDetail = details.id;
  derivative.save();
}
