import { BigDecimal } from '@graphprotocol/graph-ts';
import { useAccount } from '../entities/Account';
import { useAsset } from '../entities/Asset';
import { trackFundCalculations } from '../entities/Calculations';
import { ensureContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { ensureIntegrationAdapter, useIntegrationAdapter } from '../entities/IntegrationAdapter';
import { trackFundPortfolio } from '../entities/Portfolio';
import { ensureTransaction } from '../entities/Transaction';
import {
  AdapterDeregistered,
  AdapterRegistered,
  CallOnIntegrationExecutedForFund,
} from '../generated/IntegrationManagerContract';
import {
  AdapterDeregisteredEvent,
  AdapterRegisteredEvent,
  CallOnIntegrationExecutedForFundEvent,
  Trade,
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

  let execution = new CallOnIntegrationExecutedForFundEvent(genericId(event));
  execution.contract = event.address.toHex();
  execution.fund = fund.id;
  execution.account = useAccount(event.params.caller.toHex()).id;
  execution.adapter = event.params.adapter.toHex();
  execution.incomingAssets = event.params.incomingAssets.map<string>((asset) => useAsset(asset.toHex()).id);
  execution.incomingAssetAmounts = event.params.incomingAssetAmounts.map<BigDecimal>((amount) => toBigDecimal(amount));
  execution.outgoingAssets = event.params.outgoingAssets.map<string>((asset) => useAsset(asset.toHex()).id);
  execution.outgoingAssetAmounts = event.params.outgoingAssetAmounts.map<BigDecimal>((amount) => toBigDecimal(amount));
  execution.timestamp = event.block.timestamp;
  execution.transaction = ensureTransaction(event).id;
  execution.save();

  let trade = new Trade(genericId(event));
  trade.fund = fund.id;
  trade.adapter = useIntegrationAdapter(event.params.adapter.toHex()).id;
  trade.incomingAssets = event.params.incomingAssets.map<string>((asset) => useAsset(asset.toHex()).id);
  trade.incomingAssetAmounts = event.params.incomingAssetAmounts.map<BigDecimal>((amount) => toBigDecimal(amount));
  trade.outgoingAssets = event.params.outgoingAssets.map<string>((asset) => useAsset(asset.toHex()).id);
  trade.outgoingAssetAmounts = event.params.outgoingAssetAmounts.map<BigDecimal>((amount) => toBigDecimal(amount));
  trade.timestamp = event.block.timestamp;
  trade.transaction = ensureTransaction(event).id;
  trade.save();

  trackFundPortfolio(fund, event, execution);
  trackFundCalculations(fund, event, execution);
}
