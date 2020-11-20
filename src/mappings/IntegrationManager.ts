import { BigDecimal } from '@graphprotocol/graph-ts';
import { useAccount } from '../entities/Account';
import { useAsset } from '../entities/Asset';
import { trackCalculationState } from '../entities/CalculationState';
import { ensureContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { ensureIntegrationAdapter, useIntegrationAdapter } from '../entities/IntegrationAdapter';
import { trackPortfolioState } from '../entities/PortfolioState';
import { trackTrade } from '../entities/Trade';
import { ensureTransaction } from '../entities/Transaction';
import {
  AdapterDeregistered,
  AdapterRegistered,
  CallOnIntegrationExecutedForFund,
} from '../generated/IntegrationManagerContract';
import {
  AdapterDeregisteredEvent,
  AdapterRegisteredEvent,
  Asset,
  CallOnIntegrationExecutedForFundEvent,
} from '../generated/schema';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleAdapterRegistered(event: AdapterRegistered): void {
  let registration = new AdapterRegisteredEvent(genericId(event));
  registration.contract = ensureContract(event.params.adapter, 'IntegrationManager').id;
  registration.timestamp = event.block.timestamp;
  registration.transaction = ensureTransaction(event).id;
  registration.integrationAdapter = ensureIntegrationAdapter(event.params.adapter).id;
  registration.identifier = event.params.identifier.toHex();
  registration.save();
}

export function handleAdapterDeregistered(event: AdapterDeregistered): void {
  let deregistration = new AdapterDeregisteredEvent(genericId(event));
  deregistration.contract = ensureContract(event.params.adapter, 'IntegrationManager').id;
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.integrationAdapter = useIntegrationAdapter(event.params.adapter.toHex()).id;
  deregistration.identifier = event.params.identifier.toHex();
  deregistration.save();
}

export function handleCallOnIntegrationExecutedForFund(event: CallOnIntegrationExecutedForFund): void {
  let fund = useFund(event.params.vaultProxy.toHex());

  let adapter = useIntegrationAdapter(event.params.adapter.toHex());
  let integrationSelector = event.params.selector.toHexString();

  let incomingAssets = event.params.incomingAssets.map<Asset>((asset) => useAsset(asset.toHex()));
  let incomingAssetAmounts: BigDecimal[] = [];
  for (let i = 0; i < event.params.incomingAssetAmounts.length; i++) {
    let entry = event.params.incomingAssetAmounts;
    let amount = toBigDecimal(entry[i], incomingAssets[i].decimals);
    incomingAssetAmounts = incomingAssetAmounts.concat([amount]);
  }

  let outgoingAssets = event.params.outgoingAssets.map<Asset>((asset) => useAsset(asset.toHex()));
  let outgoingAssetAmounts: BigDecimal[] = [];
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
