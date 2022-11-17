import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureAsset } from '../../entities/Asset';
import { ensureComptroller } from '../../entities/Comptroller';
import { ensureOnlyUntrackDustOrPricelessAssetsPolicy } from '../../entities/OnlyUntrackDustOrPricelessAssetsPolicy';
import { createPricelessAssetBypass, createPricelessAssetTimelock } from '../../entities/PricelessAsset';
import { ensureRelease } from '../../entities/Release';
import { useVault } from '../../entities/Vault';
import {
  DustToleranceInWethSet,
  PricelessAssetBypassed,
  PricelessAssetTimelockStarted,
} from '../../generated/contracts/OnlyUntrackDustOrPricelessAssetsPolicy4Events';
import { ProtocolSdk } from '../../generated/contracts/ProtocolSdk';

export function handleDustToleranceInWethSet(event: DustToleranceInWethSet): void {
  let policy = ProtocolSdk.bind(event.address);
  let releaseAddress = policy.try_getFundDeployer();

  if (releaseAddress.reverted) {
    return;
  }

  let release = ensureRelease(releaseAddress.value, event);
  release.dustToleranceForAssetsInWeth = toBigDecimal(event.params.nextDustToleranceInWeth);
  release.save();
}

export function handlePricelessAssetBypassed(event: PricelessAssetBypassed): void {
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);

  if (comptroller.vault == null) {
    return;
  }

  let vault = useVault(comptroller.vault as string);
  let policy = ensureOnlyUntrackDustOrPricelessAssetsPolicy(event.params.comptrollerProxy, event.address, event);
  let asset = ensureAsset(event.params.asset);

  createPricelessAssetBypass(vault, policy.id, asset, event);
}

export function handlePricelessAssetTimelockStarted(event: PricelessAssetTimelockStarted): void {
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);

  if (comptroller.vault == null) {
    return;
  }

  let vault = useVault(comptroller.vault as string);
  let policy = ensureOnlyUntrackDustOrPricelessAssetsPolicy(event.params.comptrollerProxy, event.address, event);
  let asset = ensureAsset(event.params.asset);

  createPricelessAssetTimelock(vault, policy.id, asset, event);
}
