import { ProxyDeployed } from '../generated/contracts/ManualValueOracleFactoryEvents';
import { ManualValueOracleLibDataSource } from '../generated/templates';

export function handleProxyDeployed(event: ProxyDeployed): void {
  ManualValueOracleLibDataSource.create(event.params.proxy);
}
