import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureRelease } from '../../entities/Release';
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
  release.dustToleranceInWeth = toBigDecimal(event.params.nextDustToleranceInWeth);
  release.save();
}

export function handlePricelessAssetBypassed(event: PricelessAssetBypassed): void {}
export function handlePricelessAssetTimelockStarted(event: PricelessAssetTimelockStarted): void {}
