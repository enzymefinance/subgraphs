import { ProxyDeployed } from '../generated/contracts/DispatcherOwnedBeaconFactoryEvents';
import { SingleAssetDepositQueueLibDataSource } from '../generated/templates';
import { persistentAddresses } from '../generated/addresses';

export function handleProxyDeployed(event: ProxyDeployed): void {
  let libAddress = event.params.proxy;

  if (event.address == persistentAddresses.singleAssetDepositQueueFactoryAddress) {
    SingleAssetDepositQueueLibDataSource.create(libAddress);
  }
}
