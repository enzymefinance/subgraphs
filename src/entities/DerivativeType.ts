import { Address, log } from '@graphprotocol/graph-ts';
import {
  aavePriceFeedAddress,
  alphaHomoraV1PriceFeedAddress,
  chaiPriceFeedAddress,
  compoundPriceFeedAddress,
  idlePriceFeedAddress,
  stakehoundEthPriceFeedAddress,
  synthetixPriceFeedAddress,
} from '../addresses';
import { AavePriceFeedContract } from '../generated/AavePriceFeedContract';
import { AlphaHomoraV1PriceFeedContract } from '../generated/AlphaHomoraV1PriceFeedContract';
import { ChaiPriceFeedContract } from '../generated/ChaiPriceFeedContract';
import { CompoundPriceFeedContract } from '../generated/CompoundPriceFeedContract';
import { IdlePriceFeedContract } from '../generated/IdlePriceFeedContract';
import { Asset } from '../generated/schema';
import { StakehoundEthPriceFeedContract } from '../generated/StakehoundEthPriceFeedContract';
import { SynthetixPriceFeedContract } from '../generated/SynthetixPriceFeedContract';
import { checkCurvePoolAssetDetail } from './CurvePoolAssetDetail';
import { checkUniswapV2PoolAssetDetail } from './UniswapV2PoolAssetDetail';

export function checkDerivativeType(derivative: Asset): void {
  // simple derivative types
  checkAaveDerivativeType(derivative);
  checkAlphaDerivativeType(derivative);
  checkChaiDerivativeType(derivative);
  checkCompoundDerivativeType(derivative);
  checkIdleDerivativeType(derivative);
  checkStakehoundDerivativeType(derivative);
  checkSynthetixDerivativeType(derivative);

  // more complex derivative types
  checkCurvePoolAssetDetail(derivative);
  checkUniswapV2PoolAssetDetail(derivative);
}

function checkAaveDerivativeType(derivative: Asset): void {
  let address = Address.fromString(derivative.id);

  let priceFeedContract = AavePriceFeedContract.bind(aavePriceFeedAddress);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  let underlying = priceFeedContract.try_getUnderlyingForDerivative(address);

  if (underlying.reverted) {
    log.warning('Reverted getUnderlyingForDerivative for asset {}', [derivative.id]);
    return;
  }

  derivative.derivativeType = 'Aave';
  derivative.underlyingAsset = underlying.value.toHex();
  derivative.save();
}

function checkAlphaDerivativeType(derivative: Asset): void {
  let address = Address.fromString(derivative.id);

  let priceFeedContract = AlphaHomoraV1PriceFeedContract.bind(alphaHomoraV1PriceFeedAddress);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  let underlying = priceFeedContract.try_getWethToken();

  if (underlying.reverted) {
    log.warning('Reverted getWethToken for asset {}', [derivative.id]);
    return;
  }

  derivative.derivativeType = 'Alpha';
  derivative.underlyingAsset = underlying.value.toHex();
  derivative.save();
}

function checkChaiDerivativeType(derivative: Asset): void {
  let address = Address.fromString(derivative.id);

  let priceFeedContract = ChaiPriceFeedContract.bind(chaiPriceFeedAddress);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  let underlying = priceFeedContract.try_getDai();

  if (underlying.reverted) {
    log.warning('Reverted getDai for asset {}', [derivative.id]);
    return;
  }

  derivative.derivativeType = 'Chai';
  derivative.underlyingAsset = underlying.value.toHex();
  derivative.save();
}

function checkCompoundDerivativeType(derivative: Asset): void {
  let address = Address.fromString(derivative.id);

  let priceFeedContract = CompoundPriceFeedContract.bind(compoundPriceFeedAddress);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  let underlying = priceFeedContract.try_getTokenFromCToken(address);

  if (underlying.reverted) {
    log.warning('Reverted getTokenFromCToken for asset {}', [derivative.id]);
    return;
  }

  derivative.derivativeType = 'Compound';
  derivative.underlyingAsset = underlying.value.toHex();
  derivative.save();
}

function checkIdleDerivativeType(derivative: Asset): void {
  let address = Address.fromString(derivative.id);

  let priceFeedContract = IdlePriceFeedContract.bind(idlePriceFeedAddress);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  let underlying = priceFeedContract.try_getUnderlyingForDerivative(address);

  if (underlying.reverted) {
    log.warning('Reverted getUnderlyingForDerivative for asset {}', [derivative.id]);
    return;
  }

  derivative.derivativeType = 'Idle';
  derivative.underlyingAsset = underlying.value.toHex();
  derivative.save();
}

function checkStakehoundDerivativeType(derivative: Asset): void {
  let address = Address.fromString(derivative.id);

  let priceFeedContract = StakehoundEthPriceFeedContract.bind(stakehoundEthPriceFeedAddress);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  let underlying = priceFeedContract.try_getUnderlying();

  if (underlying.reverted) {
    log.warning('Reverted getUnderlying for asset {}', [derivative.id]);
    return;
  }

  derivative.derivativeType = 'Stakehound';
  derivative.underlyingAsset = underlying.value.toHex();
  derivative.save();
}

function checkSynthetixDerivativeType(derivative: Asset): void {
  let address = Address.fromString(derivative.id);

  let priceFeedContract = SynthetixPriceFeedContract.bind(synthetixPriceFeedAddress);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  derivative.derivativeType = 'Synthetix';
  derivative.save();
}
