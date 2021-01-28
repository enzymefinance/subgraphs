import { DataSourceContext } from '@graphprotocol/graph-ts';
import { useFund } from '../entities/Fund';
import { ensureSharesRequestor } from '../entities/SharesRequestor';
import { ensureTransaction } from '../entities/Transaction';
import { SharesRequestorProxyDeployed } from '../generated/AuthUserExecutedSharesRequestorFactoryContract';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { SharesRequestorProxyDeployedEvent } from '../generated/schema';
import { AuthUserExecutedSharesRequestorLibDataSource } from '../generated/templates';
import { genericId } from '../utils/genericId';

export function handleSharesRequestorProxyDeployed(event: SharesRequestorProxyDeployed): void {
  let deployed = new SharesRequestorProxyDeployedEvent(genericId(event));
  deployed.timestamp = event.block.timestamp;
  deployed.comptrollerProxy = event.params.comptrollerProxy.toHex();
  deployed.sharesRequestorProxy = event.params.sharesRequestorProxy.toHex();
  deployed.transaction = ensureTransaction(event).id;
  deployed.save();

  let comptrollerProxy = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultProxy = comptrollerProxy.getVaultProxy();

  let fund = useFund(vaultProxy.toHex());
  fund.sharesRequestor = ensureSharesRequestor(event.params.sharesRequestorProxy.toHex(), fund, event).id;
  fund.save();

  let sharesRequestorContext = new DataSourceContext();
  sharesRequestorContext.setString('vaultProxy', vaultProxy.toHex());

  AuthUserExecutedSharesRequestorLibDataSource.createWithContext(
    event.params.sharesRequestorProxy,
    sharesRequestorContext,
  );
}
