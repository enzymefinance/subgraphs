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

  if (symbol == 'BZRX') {
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

  if ((symbol = 'sAUD')) {
    return '0xf48e200eaf9906362bb1442fca31e0835773b8b4';
  }

  if ((symbol = 'sBNB')) {
    return '0x617aecb6137b5108d1e7d4918e3725c8cebdb848';
  }

  if ((symbol = 'sBTC')) {
    return '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6';
  }

  if ((symbol = 'sBCH')) {
    return '0x36a2422a863d5b950882190ff5433e513413343a';
  }

  if ((symbol = 'sADA')) {
    return '0xe36e2d3c7c34281fa3bc737950a68571736880a1';
  }

  if ((symbol = 'sCEX')) {
    return '0xeabacd844a196d7faf3ce596edebf9900341b420';
  }

  if ((symbol = 'sLINK')) {
    return '0xbbc455cb4f1b9e4bfc4b73970d360c8f032efee6';
  }

  if ((symbol = 'sDASH')) {
    return '0xfe33ae95a9f0da8a845af33516edc240dcd711d6';
  }

  if ((symbol = 'sDEFI')) {
    return '0xe1afe1fd76fd88f78cbf599ea1846231b8ba3b6b';
  }

  if ((symbol = 'sEOS')) {
    return '0x88c8cf3a212c0369698d13fe98fcb76620389841';
  }

  if ((symbol = 'sETH')) {
    return '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb';
  }

  if ((symbol = 'sETC')) {
    return '0x22602469d704bffb0936c7a7cfcd18f7aa269375';
  }

  if ((symbol = 'sEUR')) {
    return '0xd71ecff9342a5ced620049e616c5035f1db98620';
  }

  if ((symbol = 'sFTSE')) {
    return '0x23348160d7f5aca21195df2b70f28fce2b0be9fc';
  }

  if ((symbol = 'sXAU')) {
    return '0x261efcdd24cea98652b9700800a13dfbca4103ff';
  }

  if ((symbol = 'iBNB')) {
    return '0xafd870f32ce54efdbf677466b612bf8ad164454b';
  }

  if ((symbol = 'iBTC')) {
    return '0xd6014ea05bde904448b743833ddf07c3c7837481';
  }

  if ((symbol = 'iBCH')) {
    return '0xf6e9b246319ea30e8c2fa2d1540aaebf6f9e1b89';
  }

  if ((symbol = 'iADA')) {
    return '0x8a8079c7149b8a1611e5c5d978dca3be16545f83';
  }

  if ((symbol = 'iCEX')) {
    return '0x336213e1ddfc69f4701fc3f86f4ef4a160c1159d';
  }

  if ((symbol = 'iLINK')) {
    return '0x2d7ac061fc3db53c39fe1607fb8cec1b2c162b01';
  }

  if ((symbol = 'iDASH')) {
    return '0xcb98f42221b2c251a4e74a1609722ee09f0cc08e';
  }

  if ((symbol = 'iDEFI')) {
    return '0x14d10003807ac60d07bb0ba82caeac8d2087c157';
  }

  if ((symbol = 'iEOS')) {
    return '0xf4eebdd0704021ef2a6bbe993fdf93030cd784b4';
  }

  if ((symbol = 'iETH')) {
    return '0xa9859874e1743a32409f75bb11549892138bba1e';
  }

  if ((symbol = 'iETC')) {
    return '0xd50c1746d835d2770dda3703b69187bffeb14126';
  }

  if ((symbol = 'iLTC')) {
    return '0x79da1431150c9b82d2e5dfc1c68b33216846851e';
  }

  if ((symbol = 'iXMR')) {
    return '0x4adf728e2df4945082cdd6053869f51278fae196';
  }

  if ((symbol = 'iOIL')) {
    return '0xa5a5df41883cdc00c4ccc6e8097130535399d9a3';
  }

  if ((symbol = 'iXRP')) {
    return '0x27269b3e45a4d3e79a3d6bfee0c8fb13d0d711a6';
  }

  if ((symbol = 'iTRX')) {
    return '0xc5807183a9661a533cb08cbc297594a0b864dc12';
  }

  if ((symbol = 'iXTZ')) {
    return '0x8deef89058090ac5655a99eeb451a4f9183d1678';
  }

  if ((symbol = 'sJPY')) {
    return '0xf6b1c627e95bfc3c1b4c9b825a032ff0fbf3e07d';
  }

  if ((symbol = 'sLTC')) {
    return '0xc14103c2141e842e228fbac594579e798616ce7a';
  }

  if ((symbol = 'sXMR')) {
    return '0x5299d6f7472dcc137d7f3c4bcfbbb514babf341a';
  }

  if ((symbol = 'sNIKKEI')) {
    return '0x757de3ac6b830a931ef178c6634c5c551773155c';
  }

  if ((symbol = 'sOIL')) {
    return '0x6d16cf3ec5f763d4d99cb0b0b110eefd93b11b56';
  }

  if ((symbol = 'sGBP')) {
    return '0x97fe22e7341a0cd8db6f6c021a24dc8f4dad855f';
  }

  if ((symbol = 'sXRP')) {
    return '0xa2b0fde6d710e201d0d608e924a484d1a5fed57c';
  }

  if ((symbol = 'sXAG')) {
    return '0x6a22e5e94388464181578aa7a6b869e00fe27846';
  }

  if ((symbol = 'sCHF')) {
    return '0x0f83287ff768d1c1e17a42f44d644d7f22e8ee1d';
  }

  if ((symbol = 'sTRX')) {
    return '0xf2e08356588ec5cd9e437552da87c0076b4970b0';
  }

  if ((symbol = 'sXTZ')) {
    return '0x2e59005c5c0f0a4d77cca82653d48b46322ee5cd';
  }

  if ((symbol = 'sUSD')) {
    return '0x57ab1ec28d129707052df4df418d58a2d46d5f51';
  }

  return zeroAddress.toHex();
}
