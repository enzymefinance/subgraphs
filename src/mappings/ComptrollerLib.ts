import { BigDecimal, dataSource } from '@graphprotocol/graph-ts';
import { ensureInvestor, ensureAccount } from '../entities/Account';
import { useAsset } from '../entities/Asset';
import { useFund } from '../entities/Fund';
import { createInvestmentAddition, createInvestmentRedemption, ensureInvestment } from '../entities/Investment';
import {
  AmguPaid,
  CallOnIntegrationExecuted,
  ComptrollerLibContract,
  FundStatusUpdated,
  SharesBought,
  SharesRedeemed,
  FundConfigSet,
} from '../generated/ComptrollerLibContract';
import { Asset, AmguPayment } from '../generated/schema';
import { toBigDecimal } from '../utils/tokenValue';
import { genericId } from '../utils/genericId';
import { ensureTransaction } from '../entities/Transaction';

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
export function handleCallOnIntegrationExecuted(event: CallOnIntegrationExecuted): void {}

export function handleFundConfigSet(event: FundConfigSet): void {}

export function handleFundStatusUpdated(event: FundStatusUpdated): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));

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
