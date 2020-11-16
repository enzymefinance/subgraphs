import { zeroAddress } from '../constants';

export function getMainnetTokenAddress(symbol: string): string {
  if (symbol == 'ANT') {
    return '0xa117000000f279d81a1d3cc75430faa017fa5a2e';
  }

  if (symbol == 'BAL') {
    return '0xba100000625a3754423978a60c9317c58a424e3d';
  }

  if (symbol == 'BAT') {
    return '0x0d8775f648430679a709e98d2b0cb6250d2887ef';
  }

  if (symbol == 'BNB') {
    return '0xb8c77482e45f1f44de1745f52c74426c631bdd52';
  }

  if (symbol == 'BNT') {
    return '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c';
  }

  if (symbol == 'BUSD') {
    return '0x4fabb145d64652a948d72533023f6e7a623c7c53';
  }

  if (symbol == 'BUSD') {
    return '0x56d811088235f11c8920698a204a5010a788f4b3';
  }

  if (symbol == 'CHAI') {
    return '0x06af07097c9eeb7fd685c692751d5c66db49c215';
  }

  if (symbol == 'COMP') {
    return '0xc00e94cb662c3520282e6f5717214004a7f26888';
  }

  if (symbol == 'CRV') {
    return '0xd533a949740bb3306d119cc777fa900ba034cd52';
  }

  if (symbol == 'DAI') {
    return '0x6b175474e89094c44da98b954eedeac495271d0f';
  }

  if (symbol == 'ENJ') {
    return '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c';
  }

  if (symbol == 'KNC') {
    return '0xdd974d5c2e2928dea5f71b9825b8b646686bd200';
  }

  if (symbol == 'LINK') {
    return '0x514910771af9ca656af840dff83e8264ecf986ca';
  }

  if (symbol == 'MANA') {
    return '0x0f5d2fb29fb7d3cfee444a200298f468908cc942';
  }

  if (symbol == 'MKR') {
    return '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2';
  }

  if (symbol == 'MLN') {
    return '0xec67005c4e498ec7f55e092bd1d35cbc47c91892';
  }

  if (symbol == 'NMR') {
    return '0x1776e1f26f98b1a5df9cd347953a26dd3cb46671';
  }

  if (symbol == 'REN') {
    return '0x408e41876cccdc0f92210600ef50372656052a38';
  }

  if (symbol == 'REP') {
    return '0x221657776846890989a759ba2973e427dff5c9bb';
  }

  if (symbol == 'RLC') {
    return '0x607f4c5bb672230e8672085532f7e901544a7375';
  }

  if (symbol == 'SNX') {
    return '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f';
  }

  if (symbol == 'UNI') {
    return '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984';
  }

  if (symbol == 'USDC') {
    return '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
  }

  if (symbol == 'USDT') {
    return '0xdac17f958d2ee523a2206206994597c13d831ec7';
  }

  if (symbol == 'WBTC') {
    return '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
  }

  if (symbol == 'WETH') {
    return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
  }

  if (symbol == 'wNXM') {
    return '0x0d438f3b5175bebc262bf23753c1e53d03432bde';
  }

  if (symbol == 'UMA') {
    return '0x04fa0d235c4abf4bcf4787af4cf447de572ef828';
  }

  if (symbol == 'YFI') {
    return '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e';
  }

  if (symbol == 'ZRX') {
    return '0xe41d2489571d322189246dafa5ebde1f4699f498';
  }

  return zeroAddress.toHex();
}
