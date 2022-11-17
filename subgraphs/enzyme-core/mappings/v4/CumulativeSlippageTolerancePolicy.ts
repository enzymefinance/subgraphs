import { createPricelessAssetBypass, createPricelessAssetTimelock } from '../../entities/PricelessAsset';
import { ensureCumulativeSlippageTolerancePolicy } from '../../entities/CumulativeSlippageTolerancePolicy';
import {
  CumulativeSlippageUpdatedForFund,
  FundSettingsSet,
  PricelessAssetBypassed,
  PricelessAssetTimelockStarted,
} from '../../generated/contracts/CumulativeSlippageTolerancePolicy4Events';
import { ensureComptroller } from '../../entities/Comptroller';
import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { useVault } from '../../entities/Vault';
import { ensureAsset } from '../../entities/Asset';

export function handleCumulativeSlippageUpdatedForFund(event: CumulativeSlippageUpdatedForFund): void {
  let policy = ensureCumulativeSlippageTolerancePolicy(event.params.comptrollerProxy, event.address, event);
  policy.cumulativeSlippage = toBigDecimal(event.params.nextCumulativeSlippage);
  policy.lastSlippageTimestamp = event.block.timestamp.toI32();
  policy.save();
}

export function handleFundSettingsSet(event: FundSettingsSet): void {
  let policy = ensureCumulativeSlippageTolerancePolicy(event.params.comptrollerProxy, event.address, event);
  policy.tolerance = toBigDecimal(event.params.tolerance);
  policy.save();
}

export function handlePricelessAssetBypassed(event: PricelessAssetBypassed): void {
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);

  if (comptroller.vault == null) {
    return;
  }

  let vault = useVault(comptroller.vault as string);
  let policy = ensureCumulativeSlippageTolerancePolicy(event.params.comptrollerProxy, event.address, event);
  let asset = ensureAsset(event.params.asset);

  createPricelessAssetBypass(vault, policy.id, asset, event);
}

export function handlePricelessAssetTimelockStarted(event: PricelessAssetTimelockStarted): void {
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);

  if (comptroller.vault == null) {
    return;
  }

  let vault = useVault(comptroller.vault as string);
  let policy = ensureCumulativeSlippageTolerancePolicy(event.params.comptrollerProxy, event.address, event);
  let asset = ensureAsset(event.params.asset);

  createPricelessAssetTimelock(vault, policy.id, asset, event);
}
