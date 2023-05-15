import {
  ProxyDeployed,
  ImplementationSet,
} from '../generated/contracts/GatedRedemptionQueueSharesWrapperFactoryEvents';
import { GatedRedemptionQueueSharesWrapperLibDataSource } from '../generated/templates';

export function handleProxyDeployed(event: ProxyDeployed): void {
  GatedRedemptionQueueSharesWrapperLibDataSource.create(event.params.proxy);
}

export function handleImplementationSet(event: ImplementationSet): void {}
