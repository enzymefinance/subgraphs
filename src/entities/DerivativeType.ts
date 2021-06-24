import { Address, log } from '@graphprotocol/graph-ts';
import { releaseAddressesA, releaseAddressesB } from '../addresses';
import { AavePriceFeedContract } from '../generated/AavePriceFeedContract';
import { AlphaHomoraV1PriceFeedContract } from '../generated/AlphaHomoraV1PriceFeedContract';
import { CompoundPriceFeedContract } from '../generated/CompoundPriceFeedContract';
import { IdlePriceFeedContract } from '../generated/IdlePriceFeedContract';
import { Asset } from '../generated/schema';
import { StakehoundEthPriceFeedContract } from '../generated/StakehoundEthPriceFeedContract';
import { SynthetixPriceFeedContract } from '../generated/SynthetixPriceFeedContract';
import { YearnVaultV2PriceFeedContract } from '../generated/YearnVaultV2PriceFeedContract';
import { checkCurvePoolAssetDetail } from './CurvePoolAssetDetail';
import { checkUniswapV2PoolAssetDetail } from './UniswapV2PoolAssetDetail';

export function checkDerivativeType(derivative: Asset, derivativePriceFeedAddress: Address): void {
  // simple derivative types
  checkAaveDerivativeType(derivative, derivativePriceFeedAddress);
  checkAlphaDerivativeType(derivative, derivativePriceFeedAddress);
  checkCompoundDerivativeType(derivative, derivativePriceFeedAddress);
  checkIdleDerivativeType(derivative, derivativePriceFeedAddress);
  checkStakehoundDerivativeType(derivative, derivativePriceFeedAddress);
  checkSynthetixDerivativeType(derivative, derivativePriceFeedAddress);
  checkYearnVaultV2DerivativeType(derivative, derivativePriceFeedAddress);

  // more complex derivative types
  checkCurvePoolAssetDetail(derivative, derivativePriceFeedAddress);
  checkUniswapV2PoolAssetDetail(derivative, derivativePriceFeedAddress);
}

function checkAaveDerivativeType(derivative: Asset, derivativePriceFeedAddress: Address): void {
  let address = Address.fromString(derivative.id);

  if (
    derivativePriceFeedAddress.notEqual(releaseAddressesA.aavePriceFeedAddress) &&
    derivativePriceFeedAddress.notEqual(releaseAddressesB.aavePriceFeedAddress)
  ) {
    return;
  }

  let priceFeedContract = AavePriceFeedContract.bind(derivativePriceFeedAddress);
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

function checkAlphaDerivativeType(derivative: Asset, derivativePriceFeedAddress: Address): void {
  let address = Address.fromString(derivative.id);

  if (
    derivativePriceFeedAddress.notEqual(releaseAddressesA.alphaHomoraV1PriceFeedAddress) &&
    derivativePriceFeedAddress.notEqual(releaseAddressesB.alphaHomoraV1PriceFeedAddress)
  ) {
    return;
  }

  let priceFeedContract = AlphaHomoraV1PriceFeedContract.bind(derivativePriceFeedAddress);
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

function checkCompoundDerivativeType(derivative: Asset, derivativePriceFeedAddress: Address): void {
  let address = Address.fromString(derivative.id);

  if (
    derivativePriceFeedAddress.notEqual(releaseAddressesA.compoundPriceFeedAddress) &&
    derivativePriceFeedAddress.notEqual(releaseAddressesB.compoundPriceFeedAddress)
  ) {
    return;
  }

  let priceFeedContract = CompoundPriceFeedContract.bind(derivativePriceFeedAddress);
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

function checkIdleDerivativeType(derivative: Asset, derivativePriceFeedAddress: Address): void {
  let address = Address.fromString(derivative.id);

  if (
    derivativePriceFeedAddress.notEqual(releaseAddressesA.idlePriceFeedAddress) &&
    derivativePriceFeedAddress.notEqual(releaseAddressesB.idlePriceFeedAddress)
  ) {
    return;
  }

  let priceFeedContract = IdlePriceFeedContract.bind(derivativePriceFeedAddress);
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

function checkStakehoundDerivativeType(derivative: Asset, derivativePriceFeedAddress: Address): void {
  let address = Address.fromString(derivative.id);

  if (
    derivativePriceFeedAddress.notEqual(releaseAddressesA.stakehoundEthPriceFeedAddress) &&
    derivativePriceFeedAddress.notEqual(releaseAddressesB.stakehoundEthPriceFeedAddress)
  ) {
    return;
  }

  let priceFeedContract = StakehoundEthPriceFeedContract.bind(derivativePriceFeedAddress);
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

function checkSynthetixDerivativeType(derivative: Asset, derivativePriceFeedAddress: Address): void {
  let address = Address.fromString(derivative.id);

  if (
    derivativePriceFeedAddress.notEqual(releaseAddressesA.synthetixPriceFeedAddress) &&
    derivativePriceFeedAddress.notEqual(releaseAddressesB.synthetixPriceFeedAddress)
  ) {
    return;
  }

  let priceFeedContract = SynthetixPriceFeedContract.bind(derivativePriceFeedAddress);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  derivative.derivativeType = 'Synthetix';
  derivative.save();
}

function checkYearnVaultV2DerivativeType(derivative: Asset, derivativePriceFeedAddress: Address): void {
  let address = Address.fromString(derivative.id);

  if (
    derivativePriceFeedAddress.notEqual(releaseAddressesA.yearnVaultV2PriceFeedAddress) &&
    derivativePriceFeedAddress.notEqual(releaseAddressesB.yearnVaultV2PriceFeedAddress)
  ) {
    return;
  }

  let priceFeedContract = YearnVaultV2PriceFeedContract.bind(derivativePriceFeedAddress);
  let isSupported = priceFeedContract.try_isSupportedAsset(address);

  if (isSupported.reverted || isSupported.value == false) {
    return;
  }

  let underlying = priceFeedContract.try_getUnderlyingForDerivative(address);

  if (underlying.reverted) {
    log.warning('Reverted getUnderlyingForDerivative for asset {}', [derivative.id]);
    return;
  }

  derivative.derivativeType = 'Yearn';
  derivative.underlyingAsset = underlying.value.toHex();
  derivative.save();
}
