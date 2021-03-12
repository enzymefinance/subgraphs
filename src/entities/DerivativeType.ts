import { Address, log } from '@graphprotocol/graph-ts';
import { wethTokenAddress } from '../addresses';
import { ICERC20 } from '../generated/ICERC20';
import { Asset } from '../generated/schema';
import { checkUniswapV2PoolAssetDetail } from './UniswapV2PoolAssetDetail';

export function checkDerivativeType(derivative: Asset): void {
  checkAaveDerivativeType(derivative);
  checkAlphaDerivativeType(derivative);
  checkChaiDerivativeType(derivative);
  checkCompoundDerivativeType(derivative);
  checkSynthetixDerivativeType(derivative);
  checkUniswapV2PoolAssetDetail(derivative);
}

function checkAaveDerivativeType(derivative: Asset): void {
  if (!derivative.name.startsWith('Aave interest bearing')) {
    return;
  }

  // TODO: get underlying token
  // - either through a contract call (need to store ABI)
  // - or through observing events on the AavePriceFeed

  derivative.derivativeType = 'Aave';
  // derivative.underlyingAsset = details.id;
  derivative.save();
}

function checkAlphaDerivativeType(derivative: Asset): void {
  if (derivative.name != 'Interest Bearing ETH') {
    return;
  }

  derivative.derivativeType = 'Alpha';
  derivative.underlyingAsset = wethTokenAddress.toHex();
  derivative.save();
}

function checkChaiDerivativeType(derivative: Asset): void {
  if (derivative.symbol != 'CHAI') {
    return;
  }

  derivative.derivativeType = 'Chai';
  // TODO: add DAI
  // derivative.underlyingAsset = dai;
  derivative.save();
}

function checkCompoundDerivativeType(derivative: Asset): void {
  if (!derivative.name.startsWith('Compound ')) {
    return;
  }

  let address = Address.fromString(derivative.id);

  // for Mainnet / Kovan
  // let cTokenIsCTokenContract = CTokenIsCTokenContract.bind(address);
  // let isCTokenCall = cTokenIsCTokenContract.try_isCToken();
  // if (isCTokenCall.reverted || isCTokenCall.value == false) {
  //   return;
  // }

  let compound = ICERC20.bind(address);
  let result = compound.try_underlying();
  let underlying: string = '';
  if (result.reverted) {
    // cETH doesn't have `underlying()` implemented
    if (derivative.name == 'Compound Ether') {
      underlying = wethTokenAddress.toHex();
    } else {
      log.warning('Reverted underlying() for asset {} - and asset is not Compound Ether', [derivative.id]);
      return;
    }
  } else {
    underlying = result.value.toHex();
  }

  derivative.derivativeType = 'Compound';
  derivative.underlyingAsset = underlying;
  derivative.save();
}

function checkSynthetixDerivativeType(derivative: Asset): void {
  // TODO: find better identifier of Synth assets
  // TODO: observe SynthAdded event in the SynthetixPriceFeed

  if (!derivative.name.startsWith('Synth ')) {
    return;
  }

  derivative.derivativeType = 'Synthetix';
  derivative.save();
}
