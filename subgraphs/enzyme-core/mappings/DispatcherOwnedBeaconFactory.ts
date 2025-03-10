import { ProxyDeployed, ImplementationSet } from '../generated/contracts/DispatcherOwnedBeaconFactoryEvents';
import { SingleAssetDepositQueueLibDataSource } from '../generated/templates';
import { persistentAddresses } from '../generated/addresses';

export function handleProxyDeployed(event: ProxyDeployed): void {
  if (event.address == persistentAddresses.singleAssetDepositQueueFactoryAddress) {
    SingleAssetDepositQueueLibDataSource.create(event.params.proxy);
  }
}

export function handleImplementationSet(event: ImplementationSet): void {}
