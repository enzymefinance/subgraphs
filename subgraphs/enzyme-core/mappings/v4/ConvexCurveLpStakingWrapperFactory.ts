import { ensureAsset } from '../../entities/Asset';
import {
  CanonicalLibSet,
  ProxyDeployed,
  WrapperDeployed,
} from '../../generated/contracts/ConvexCurveLpStakingWrapperFactory4Events';
import { ConvexCurveLpStakingWrapper } from '../../generated/schema';

export function handleWrapperDeployed(event: WrapperDeployed): void {
  let id = event.params.wrapperProxy.toHex();

  let wrapper = new ConvexCurveLpStakingWrapper(id);
  wrapper.pid = event.params.pid.toI32();
  wrapper.lpToken = ensureAsset(event.params.curveLpToken).id;
  wrapper.timestamp = event.block.timestamp.toI32();
  wrapper.save();
}

export function handleCanonicalLibSet(event: CanonicalLibSet): void {}
export function handleProxyDeployed(event: ProxyDeployed): void {}
