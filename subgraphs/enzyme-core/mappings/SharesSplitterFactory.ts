import { ensureAccount } from '../entities/Account';
import { createSharesSplitter } from '../entities/SharesSplitter';
import { ProxyDeployed } from '../generated/contracts/SharesSplitterFactoryEvents';
import { SharesSplitterLibDataSource } from '../generated/templates';

export function handleProxyDeployed(event: ProxyDeployed): void {
  let sharesSplitterAddress = event.params.proxy;
  let creator = ensureAccount(event.params.caller, event);

  createSharesSplitter(sharesSplitterAddress, creator, event);

  SharesSplitterLibDataSource.create(sharesSplitterAddress);
}
