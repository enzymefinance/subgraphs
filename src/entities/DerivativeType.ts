import { Address, log } from '@graphprotocol/graph-ts';
import {
  aavePriceFeed,
  alphaHomoraV1PriceFeed,
  chaiPriceFeed,
  compoundPriceFeed,
  synthetixPriceFeed,
} from '../addresses';
import { AavePriceFeedContract } from '../generated/AavePriceFeedContract';
import { AlphaHomoraV1PriceFeedContract } from '../generated/AlphaHomoraV1PriceFeedContract';
import { ChaiPriceFeedContract } from '../generated/ChaiPriceFeedContract';
import { CompoundPriceFeedContract } from '../generated/CompoundPriceFeedContract';
import { Asset } from '../generated/schema';
import { SynthetixPriceFeedContract } from '../generated/SynthetixPriceFeedContract';
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
  let address = Address.fromString(derivative.id);

  let priceFeedContract = AavePriceFeedContract.bind(aavePriceFeed);
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

  let priceFeedContract = AlphaHomoraV1PriceFeedContract.bind(alphaHomoraV1PriceFeed);
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

  let priceFeedContract = ChaiPriceFeedContract.bind(chaiPriceFeed);
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

  let priceFeedContract = CompoundPriceFeedContract.bind(compoundPriceFeed);
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

function checkSynthetixDerivativeType(derivative: Asset): void {
  let address = Address.fromString(derivative.id);

  let priceFeedContract = SynthetixPriceFeedContract.bind(synthetixPriceFeed);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  derivative.derivativeType = 'Synthetix';
  derivative.save();
}
