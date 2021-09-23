import { DataSourceContext } from '@graphprotocol/graph-ts';
import { CanonicalLibSet, ProxyDeployed } from '../../generated/contracts/GasRelayPaymasterFactory4Events';
import { GasRelayPaymasterLib4DataSource } from '../../generated/templates';

export function handleProxyDeployed(event: ProxyDeployed): void {
  let comptrollerContext = new DataSourceContext();
  comptrollerContext.setString('comptrollerProxy', event.params.caller.toHex());

  GasRelayPaymasterLib4DataSource.createWithContext(event.params.proxy, comptrollerContext);
}

export function handleCanonicalLibSet(event: CanonicalLibSet): void {}
