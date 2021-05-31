import { ensureAccount } from '../entities/Account';
import { ensureAsset } from '../entities/Asset';
import { createAssetAmount } from '../entities/AssetAmount';
import { ensureComptrollerProxy } from '../entities/ComptrollerProxy';
import { useFund } from '../entities/Fund';
import { ensureIntegrationAdapter } from '../entities/IntegrationAdapter';
import { trackPortfolioState } from '../entities/PortfolioState';
import { trackTrade } from '../entities/Trade';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import {
  AdapterDeregistered,
  AdapterRegistered,
  AuthUserAddedForFund,
  AuthUserRemovedForFund,
  CallOnIntegrationExecutedForFund,
} from '../generated/IntegrationManagerContract';
import {
  AdapterDeregisteredEvent,
  AdapterRegisteredEvent,
  Asset,
  AssetAmount,
  AuthUserAddedForFundEvent,
  AuthUserRemovedForFundEvent,
  CallOnIntegrationExecutedForFundEvent,
} from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleAdapterRegistered(event: AdapterRegistered): void {
  let adapter = ensureIntegrationAdapter(event.params.adapter);

  let registration = new AdapterRegisteredEvent(genericId(event));
  registration.timestamp = event.block.timestamp;
  registration.transaction = ensureTransaction(event).id;
  registration.integrationAdapter = adapter.id;
  registration.identifier = event.params.identifier.toHex();
  registration.save();
}

export function handleAdapterDeregistered(event: AdapterDeregistered): void {
  let deregistration = new AdapterDeregisteredEvent(genericId(event));
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.integrationAdapter = ensureIntegrationAdapter(event.params.adapter).id;
  deregistration.identifier = event.params.identifier.toHex();
  deregistration.save();
}

export function handleAuthUserAddedForFund(event: AuthUserAddedForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useFund(comptroller.getVaultProxy().toHex());
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  let account = ensureAccount(event.params.account, event);
  account.authUser = true;
  account.save();

  let userAdded = new AuthUserAddedForFundEvent(genericId(event));
  userAdded.fund = fund.id;
  userAdded.comptrollerProxy = comptrollerProxy.id;
  userAdded.user = account.id;
  userAdded.timestamp = event.block.timestamp;
  userAdded.transaction = ensureTransaction(event).id;
  userAdded.save();

  comptrollerProxy.authUsers = arrayUnique<string>(comptrollerProxy.authUsers.concat([account.id]));
  comptrollerProxy.save();
}

export function handleAuthUserRemovedForFund(event: AuthUserRemovedForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useFund(comptroller.getVaultProxy().toHex());
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  let account = ensureAccount(event.params.account, event);

  let userRemoved = new AuthUserRemovedForFundEvent(genericId(event));
  userRemoved.fund = fund.id;
  userRemoved.comptrollerProxy = comptrollerProxy.id;
  userRemoved.user = account.id;
  userRemoved.timestamp = event.block.timestamp;
  userRemoved.transaction = ensureTransaction(event).id;
  userRemoved.save();

  comptrollerProxy.authUsers = arrayDiff<string>(comptrollerProxy.authUsers, [account.id]);
  comptrollerProxy.save();
}

export function handleCallOnIntegrationExecutedForFund(event: CallOnIntegrationExecutedForFund): void {
  let fund = useFund(event.params.vaultProxy.toHex());

  let adapter = ensureIntegrationAdapter(event.params.adapter);
  let integrationSelector = event.params.selector.toHexString();

  // TODO: fix this (asset amounts and assets don't have to be the same lenght, e.g. approveAssetsTrade)
  // - store assets and amounts separately
  // -

  let incomingAssets = event.params.incomingAssets.map<Asset>((asset) => ensureAsset(asset));
  let incomingAssetAmounts: AssetAmount[] = new Array<AssetAmount>();
  let incomingAmounts = event.params.incomingAssetAmounts;
  for (let i = 0; i < incomingAmounts.length; i++) {
    let amount = toBigDecimal(incomingAmounts[i], incomingAssets[i].decimals);
    let assetAmount = createAssetAmount(incomingAssets[i], amount, 'trade/incoming', event);
    incomingAssetAmounts = incomingAssetAmounts.concat([assetAmount]);
  }

  let outgoingAssets = event.params.outgoingAssets.map<Asset>((asset) => ensureAsset(asset));
  let outgoingAssetAmounts: AssetAmount[] = new Array<AssetAmount>();
  let outgoingAmounts = event.params.outgoingAssetAmounts;
  for (let i = 0; i < outgoingAmounts.length; i++) {
    let amount = toBigDecimal(outgoingAmounts[i], outgoingAssets[i].decimals);
    let assetAmount = createAssetAmount(outgoingAssets[i], amount, 'trade/outgoing', event);
    outgoingAssetAmounts = outgoingAssetAmounts.concat([assetAmount]);
  }

  let execution = new CallOnIntegrationExecutedForFundEvent(genericId(event));
  execution.fund = fund.id;
  execution.adapter = adapter.id;
  execution.selector = integrationSelector;
  execution.integrationData = event.params.integrationData.toHexString();
  execution.incomingAssets = incomingAssets.map<string>((asset) => asset.id);
  execution.outgoingAssets = outgoingAssets.map<string>((asset) => asset.id);
  execution.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
  execution.outgoingAssetAmounts = outgoingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
  execution.timestamp = event.block.timestamp;
  execution.transaction = ensureTransaction(event).id;
  execution.save();

  trackTrade(
    fund,
    adapter,
    integrationSelector,
    incomingAssets,
    outgoingAssets,
    incomingAssetAmounts,
    outgoingAssetAmounts,
    event,
  );
  trackPortfolioState(fund, event, execution);
}
