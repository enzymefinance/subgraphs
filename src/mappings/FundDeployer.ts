import { DataSourceContext } from '@graphprotocol/graph-ts';
import { ensureAccount, ensureManager } from '../entities/Account';
import { useAsset } from '../entities/Asset';
import { ensureContract } from '../entities/Contract';
import { createFund } from '../entities/Fund';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { ComptrollerLibSet, ComptrollerProxyDeployed, NewFundCreated } from '../generated/FundDeployerContract';
import { ComptrollerLibSetEvent, ComptrollerProxyDeployedEvent, NewFundCreatedEvent } from '../generated/schema';
import { ComptrollerLibDataSource, VaultLibDataSource } from '../generated/templates';
import { genericId } from '../utils/genericId';

export function handleNewFundCreated(event: NewFundCreated): void {
  let fundCreation = new NewFundCreatedEvent(genericId(event));
  fundCreation.timestamp = event.block.timestamp;
  fundCreation.fund = event.params.vaultProxy.toHex();
  fundCreation.account = ensureManager(event.params.fundOwner, event).id;
  fundCreation.contract = ensureContract(event.address, 'FundDeployer').id;
  fundCreation.comptrollerProxy = event.params.comptrollerProxy.toHex();
  fundCreation.vaultProxy = event.params.vaultProxy.toHex();
  fundCreation.fundOwner = ensureManager(event.params.fundOwner, event).id;
  fundCreation.fundName = event.params.fundName;
  fundCreation.creator = ensureAccount(event.params.creator, event).id;
  fundCreation.denominationAsset = useAsset(event.params.denominationAsset.toHex()).id;
  fundCreation.sharesActionTimelock = event.params.sharesActionTimelock;
  fundCreation.allowedBuySharesCallers = event.params.allowedBuySharesCallers.map<string>((caller) => caller.toHex());
  fundCreation.feeManagerConfigData = event.params.feeManagerConfigData.toHex();
  fundCreation.policyManagerConfigData = event.params.policyManagerConfigData.toHex();
  fundCreation.transaction = ensureTransaction(event).id;
  fundCreation.save();

  createFund(event);

  let comptrollerContext = new DataSourceContext();
  comptrollerContext.setString('vaultProxy', event.params.vaultProxy.toHex());

  VaultLibDataSource.create(event.params.vaultProxy);
  ComptrollerLibDataSource.createWithContext(event.params.comptrollerProxy, comptrollerContext);
}

export function handleComptrollerLibSet(event: ComptrollerLibSet): void {
  let comptrollerLib = new ComptrollerLibSetEvent(genericId(event));
  comptrollerLib.timestamp = event.block.timestamp;
  comptrollerLib.contract = ensureContract(event.address, 'FundDeployer').id;
  comptrollerLib.comptrollerLib = event.params.comptrollerLib.toHex();
  comptrollerLib.transaction = ensureTransaction(event).id;
  comptrollerLib.save();
}

export function handleComptrollerProxyDeployed(event: ComptrollerProxyDeployed): void {
  let comptrollerProxy = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultProxy = comptrollerProxy.getVaultProxy();

  let comptrollerProxyDeployment = new ComptrollerProxyDeployedEvent(genericId(event));
  comptrollerProxyDeployment.timestamp = event.block.timestamp;
  comptrollerProxyDeployment.fund = vaultProxy.toHex();
  comptrollerProxyDeployment.account = ensureManager(event.transaction.from, event).id;
  comptrollerProxyDeployment.contract = ensureContract(event.address, 'FundDeployer').id;
  comptrollerProxyDeployment.comptrollerProxy = event.params.comptrollerProxy.toHex();
  comptrollerProxyDeployment.transaction = ensureTransaction(event).id;
  comptrollerProxyDeployment.denominationAsset = useAsset(event.params.denominationAsset.toHex()).id;
  comptrollerProxyDeployment.sharesActionTimelock = event.params.sharesActionTimelock;
  comptrollerProxyDeployment.allowedBuySharesCallers = event.params.allowedBuySharesCallers.map<string>((caller) =>
    caller.toHex(),
  );
  comptrollerProxyDeployment.feeManagerConfigData = event.params.feeManagerConfigData.toHexString();
  comptrollerProxyDeployment.policyManagerConfigData = event.params.policyManagerConfigData.toHexString();
  comptrollerProxyDeployment.forMigration = event.params.forMigration;
  comptrollerProxyDeployment.save();
}
