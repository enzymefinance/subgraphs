import { zeroAddress } from '../constants';

export function getMainnetTokenAddress(symbol: string): string {
  if (symbol == 'CHAI') {
    return '0x06af07097c9eeb7fd685c692751d5c66db49c215';
  }

  if (symbol == 'DAI') {
    return '0x6b175474e89094c44da98b954eedeac495271d0f';
  }

  if (symbol == 'KNC') {
    return '0xdd974d5c2e2928dea5f71b9825b8b646686bd200';
  }

  if (symbol == 'MLN') {
    return '0xec67005c4e498ec7f55e092bd1d35cbc47c91892';
  }

  if (symbol == 'REN') {
    return '0x408e41876cccdc0f92210600ef50372656052a38';
  }

  if (symbol == 'REP') {
    return '0x221657776846890989a759ba2973e427dff5c9bb';
  }

  if (symbol == 'WETH') {
    return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
  }

  if (symbol == 'ZRX') {
    return '0xe41d2489571d322189246dafa5ebde1f4699f498';
  }

  return zeroAddress.toHex();
}
