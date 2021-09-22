import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureRelease } from '../../entities/Release';
import {
  DustToleranceInWethSet,
  OnlyUntrackDustOrPricelessAssetsPolicy4Contract,
  PricelessAssetBypassed,
  PricelessAssetTimelockStarted,
} from '../../generated/OnlyUntrackDustOrPricelessAssetsPolicy4Contract';

export function handleDustToleranceInWethSet(event: DustToleranceInWethSet): void {
  let policy = OnlyUntrackDustOrPricelessAssetsPolicy4Contract.bind(event.address);
  let releaseAddress = policy.try_getFundDeployer();

  if (releaseAddress.reverted) {
    return;
  }

  let release = ensureRelease(releaseAddress.value, event);
  release.dustToleranceInWeth = toBigDecimal(event.params.nextDustToleranceInWeth);
  release.save();
}

export function handlePricelessAssetBypassed(event: PricelessAssetBypassed): void {}
export function handlePricelessAssetTimelockStarted(event: PricelessAssetTimelockStarted): void {}
