import { ProxyDeployed, ImplementationSet } from '../generated/contracts/SingleAssetDepositQueueFactoryEvents';
import { SingleAssetDepositQueueLibDataSource } from '../generated/templates';

export function handleProxyDeployed(event: ProxyDeployed): void {
  SingleAssetDepositQueueLibDataSource.create(event.params.proxy);
}

export function handleImplementationSet(event: ImplementationSet): void {}
