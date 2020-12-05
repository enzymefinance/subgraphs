import { BigDecimal } from '@graphprotocol/graph-ts';
import { ensureAccount, useAccount } from '../entities/Account';
import { useAsset } from '../entities/Asset';
import { trackCalculationState } from '../entities/CalculationState';
import { ensureContract, useContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { ensureIntegrationAdapter, useIntegrationAdapter } from '../entities/IntegrationAdapter';
import { useIntegrationManager } from '../entities/IntegrationManager';
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
  TrackedAssetsLimitSet,
} from '../generated/IntegrationManagerContract';
import {
  AdapterDeregisteredEvent,
  AdapterRegisteredEvent,
  Asset,
  AuthUserAddedForFundEvent,
  AuthUserRemovedForFundEvent,
  CallOnIntegrationExecutedForFundEvent,
  TrackedAssetsLimitSetEvent,
} from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleAdapterRegistered(event: AdapterRegistered): void {
  let adapter = ensureIntegrationAdapter(event.params.adapter, event.address);

  let registration = new AdapterRegisteredEvent(genericId(event));
  registration.contract = ensureContract(event.address, 'IntegrationManager').id;
  registration.timestamp = event.block.timestamp;
  registration.transaction = ensureTransaction(event).id;
  registration.integrationAdapter = adapter.id;
  registration.identifier = event.params.identifier.toHex();
  registration.save();
}

export function handleAdapterDeregistered(event: AdapterDeregistered): void {
  let deregistration = new AdapterDeregisteredEvent(genericId(event));
  deregistration.contract = useContract(event.address.toHex()).id;
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.integrationAdapter = useIntegrationAdapter(event.params.adapter.toHex()).id;
  deregistration.identifier = event.params.identifier.toHex();
  deregistration.save();
}

export function handleAuthUserAddedForFund(event: AuthUserAddedForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useFund(comptroller.getVaultProxy().toHex());
  let account = ensureAccount(event.params.account, event);

  let userAdded = new AuthUserAddedForFundEvent(genericId(event));
  userAdded.fund = fund.id;
  userAdded.contract = useContract(event.address.toHex()).id;
  userAdded.timestamp = event.block.timestamp;
  userAdded.transaction = ensureTransaction(event).id;
  userAdded.account = account.id;
  userAdded.save();

  fund.authUsers = arrayUnique<string>(fund.authUsers.concat([account.id]));
  fund.save();
}

export function handleAuthUserRemovedForFund(event: AuthUserRemovedForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useFund(comptroller.getVaultProxy().toHex());
  let account = ensureAccount(event.params.account, event);

  let userRemoved = new AuthUserRemovedForFundEvent(genericId(event));
  userRemoved.fund = fund.id;
  userRemoved.contract = useContract(event.address.toHex()).id;
  userRemoved.timestamp = event.block.timestamp;
  userRemoved.transaction = ensureTransaction(event).id;
  userRemoved.account = account.id;
  userRemoved.save();

  fund.authUsers = arrayDiff<string>(fund.authUsers, [account.id]);
  fund.save();
}

export function handleCallOnIntegrationExecutedForFund(event: CallOnIntegrationExecutedForFund): void {
  let fund = useFund(event.params.vaultProxy.toHex());

  let adapter = useIntegrationAdapter(event.params.adapter.toHex());
  let integrationSelector = event.params.selector.toHexString();

  let incomingAssets = event.params.incomingAssets.map<Asset>((asset) => useAsset(asset.toHex()));
  let incomingAssetAmounts: BigDecimal[] = new Array<BigDecimal>();
  for (let i = 0; i < event.params.incomingAssetAmounts.length; i++) {
    let entry = event.params.incomingAssetAmounts;
    let amount = toBigDecimal(entry[i], incomingAssets[i].decimals);
    incomingAssetAmounts = incomingAssetAmounts.concat([amount]);
  }

  let outgoingAssets = event.params.outgoingAssets.map<Asset>((asset) => useAsset(asset.toHex()));
  let outgoingAssetAmounts: BigDecimal[] = new Array<BigDecimal>();
  for (let i = 0; i < event.params.outgoingAssetAmounts.length; i++) {
    let entry = event.params.outgoingAssetAmounts;
    let amount = toBigDecimal(entry[i], outgoingAssets[i].decimals);
    outgoingAssetAmounts = outgoingAssetAmounts.concat([amount]);
  }

  let execution = new CallOnIntegrationExecutedForFundEvent(genericId(event));
  execution.contract = event.address.toHex();
  execution.fund = fund.id;
  execution.account = useAccount(event.params.caller.toHex()).id;
  execution.adapter = adapter.id;
  execution.selector = integrationSelector;
  execution.integrationData = event.params.integrationData.toHexString();
  execution.incomingAssets = incomingAssets.map<string>((asset) => asset.id);
  execution.incomingAssetAmounts = incomingAssetAmounts;
  execution.outgoingAssets = outgoingAssets.map<string>((asset) => asset.id);
  execution.outgoingAssetAmounts = outgoingAssetAmounts;
  execution.timestamp = event.block.timestamp;
  execution.transaction = ensureTransaction(event).id;
  execution.save();

  trackTrade(
    fund,
    adapter,
    integrationSelector,
    incomingAssets,
    incomingAssetAmounts,
    outgoingAssets,
    outgoingAssetAmounts,
    event,
  );

  trackPortfolioState(fund, event, execution);
  trackCalculationState(fund, event, execution);
}

export function handleTrackedAssetsLimitSet(event: TrackedAssetsLimitSet): void {
  let trackedAssetsLimit = new TrackedAssetsLimitSetEvent(genericId(event));
  trackedAssetsLimit.contract = useContract(event.address.toHex()).id;
  trackedAssetsLimit.timestamp = event.block.timestamp;
  trackedAssetsLimit.transaction = ensureTransaction(event).id;
  trackedAssetsLimit.nextTrackedAssetsLimit = event.params.nextTrackedAssetsLimit;
  trackedAssetsLimit.save();

  let integrationManager = useIntegrationManager(event.address.toHex());
  integrationManager.trackedAssetsLimit = event.params.nextTrackedAssetsLimit;
  integrationManager.save();
}
