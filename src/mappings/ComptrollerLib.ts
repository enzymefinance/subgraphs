import { BigDecimal, dataSource } from '@graphprotocol/graph-ts';
import { ensureAccount, ensureInvestor, useAccount } from '../entities/Account';
import { useAsset, ensureAsset } from '../entities/Asset';
import { ensureContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { createInvestmentAddition, createInvestmentRedemption, ensureInvestment } from '../entities/Investment';
import { ensureTransaction } from '../entities/Transaction';
import {
  AmguPaid,
  CallOnIntegrationExecuted,
  ComptrollerLibContract,
  FundConfigSet,
  FundStatusUpdated,
  SharesBought,
  SharesRedeemed,
} from '../generated/ComptrollerLibContract';
import {
  AmguPayment,
  Asset,
  CallOnIntegrationExecution,
  FundConfigSetting,
  FundStatusUpdate,
} from '../generated/schema';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/tokenValue';

export function handleAmguPaid(event: AmguPaid): void {
  let id = genericId(event);
  let amguPaid = new AmguPayment(id);
  amguPaid.amount = toBigDecimal(event.params.ethPaid);
  amguPaid.payer = ensureAccount(event.params.payer).id;
  amguPaid.gas = event.params.gasUsed.toI32();
  amguPaid.timestamp = event.block.timestamp;
  amguPaid.transaction = ensureTransaction(event).id;
  amguPaid.save();
}

export function handleCallOnIntegrationExecuted(event: CallOnIntegrationExecuted): void {
  let id = genericId(event);
  let fund = useFund(dataSource.context().getString('vaultProxy'));
  let incomingAssets = event.params.incomingAssets.map<Asset>((id) => useAsset(id.toHex()));
  let outgoingAssets = event.params.outgoingAssets.map<Asset>((id) => useAsset(id.toHex()));

  let callOnIntegration = new CallOnIntegrationExecution(id);
  callOnIntegration.contract = ensureContract(event.address, 'ComptrollerLib', event.block.timestamp).id;
  callOnIntegration.fund = fund.id;
  callOnIntegration.account = useAccount(event.transaction.from.toHex()).id;
  callOnIntegration.adapter = event.params.adapter.toHex();
  callOnIntegration.incomingAssets = incomingAssets.map<string>((asset) => asset.id);
  callOnIntegration.incomingAssetAmounts = event.params.incomingAssetAmounts;
  callOnIntegration.outgoingAssets = outgoingAssets.map<string>((asset) => asset.id);
  callOnIntegration.outgoingAssetAmounts = event.params.outgoingAssetAmounts;
  callOnIntegration.transaction = ensureTransaction(event).id;
  callOnIntegration.save();
}

export function handleFundConfigSet(event: FundConfigSet): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));

  let id = genericId(event);
  let fundConfig = new FundConfigSetting(id);
  fundConfig.timestamp = event.block.timestamp;
  fundConfig.contract = ensureContract(event.address, 'ComptrollerLib', event.block.timestamp).id;
  fundConfig.fund = fund.id;
  fundConfig.account = useAccount(event.transaction.from.toHex()).id;
  fundConfig.denominationAsset = ensureAsset(event.params.denominationAsset).id;
  fundConfig.vaultProxy = fund.id;
  fundConfig.feeManagerConfig = event.params.feeManagerConfig.toHex();
  fundConfig.policyManagerConfig = event.params.policyManagerConfig.toHex();
  fundConfig.transaction = ensureTransaction(event).id;
  fundConfig.save();
}

export function handleFundStatusUpdated(event: FundStatusUpdated): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));

  let id = genericId(event);
  let fundStatusUpdate = new FundStatusUpdate(id);
  fundStatusUpdate.timestamp = event.block.timestamp;
  fundStatusUpdate.contract = ensureContract(event.address, 'ComptrollerLib', event.block.timestamp).id;
  fundStatusUpdate.fund = fund.id;
  fundStatusUpdate.account = useAccount(event.transaction.from.toHex()).id;
  fundStatusUpdate.prevStatus = event.params.prevStatus;
  fundStatusUpdate.nextStatus = event.params.nextStatus;
  fundStatusUpdate.transaction = ensureTransaction(event).id;
  fundStatusUpdate.save();

  fund.status = event.params.nextStatus == 0 ? 'None' : event.params.nextStatus == 1 ? 'Active' : 'Inactive';
  fund.save();
}

export function handleSharesBought(event: SharesBought): void {
  let comptrollerProxy = ComptrollerLibContract.bind(event.address);
  let denominationAsset = comptrollerProxy.getDenominationAsset();

  let fund = useFund(dataSource.context().getString('vaultProxy'));

  let account = ensureInvestor(event.params.buyer);
  let investment = ensureInvestment(account, fund);
  let asset = useAsset(denominationAsset.toHex());
  let quantity = toBigDecimal(event.params.investmentAmount, asset.decimals);
  let shares = toBigDecimal(event.params.sharesReceived);

  createInvestmentAddition(investment, asset, quantity, shares, event);
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));

  let account = ensureInvestor(event.params.redeemer);
  let investment = ensureInvestment(account, fund);
  let shares = toBigDecimal(event.params.sharesQuantity);
  let assets = event.params.receivedAssets.map<Asset>((id) => useAsset(id.toHex()));
  let qtys = event.params.receivedAssetQuantities;

  let quantities: BigDecimal[] = [];
  for (let i: i32 = 0; i < assets.length; i++) {
    quantities.push(toBigDecimal(qtys[i], assets[i].decimals));
  }

  createInvestmentRedemption(investment, assets, quantities, shares, event);
}
