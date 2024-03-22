import { ProxyDeployed } from '../generated/contracts/SharesSplitterFactoryEvents';
import { SingleAssetRedemptionQueueLibDataSource } from '../generated/templates';

export function handleProxyDeployed(event: ProxyDeployed): void {
  let singleAssetRedemptionQueueAddress = event.params.proxy;

  SingleAssetRedemptionQueueLibDataSource.create(singleAssetRedemptionQueueAddress);
}
