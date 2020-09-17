import { BigDecimal, dataSource, log } from '@graphprotocol/graph-ts';
import { ensureAccount, ensureInvestor, useAccount } from '../entities/Account';
import { useAsset, ensureAsset } from '../entities/Asset';
import { ensureContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { createInvestmentAddition, createInvestmentRedemption, ensureInvestment } from '../entities/Investment';
import { ensureTransaction } from '../entities/Transaction';
import {
  AmguPaid,
  FundConfigSet,
  FundStatusUpdated,
  SharesBought,
  SharesRedeemed,
} from '../generated/ComptrollerLibContract';
import { AmguPaidEvent, Asset, FundConfigSetEvent, FundStatusUpdatedEvent } from '../generated/schema';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/tokenValue';

export function handleAmguPaid(event: AmguPaid): void {
  let amguPaid = new AmguPaidEvent(genericId(event));
  amguPaid.amount = toBigDecimal(event.params.ethPaid);
  amguPaid.payer = ensureAccount(event.params.payer, event).id;
  amguPaid.gas = event.params.gasUsed.toI32();
  amguPaid.timestamp = event.block.timestamp;
  amguPaid.transaction = ensureTransaction(event).id;
  amguPaid.save();
}

export function handleFundConfigSet(event: FundConfigSet): void {
  let fundId = dataSource.context().getString('vaultProxy');

  let fundConfig = new FundConfigSetEvent(genericId(event));
  fundConfig.timestamp = event.block.timestamp;
  fundConfig.contract = ensureContract(event.address, 'ComptrollerLib', event).id;
  fundConfig.fund = fundId;
  fundConfig.account = useAccount(event.transaction.from.toHex()).id;
  fundConfig.denominationAsset = ensureAsset(event.params.denominationAsset).id;
  fundConfig.vaultProxy = fundId;
  fundConfig.feeManagerConfig = event.params.feeManagerConfig.toHex();
  fundConfig.policyManagerConfig = event.params.policyManagerConfig.toHex();
  fundConfig.transaction = ensureTransaction(event).id;
  fundConfig.save();
}

export function handleFundStatusUpdated(event: FundStatusUpdated): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));

  let fundStatusUpdate = new FundStatusUpdatedEvent(genericId(event));
  fundStatusUpdate.timestamp = event.block.timestamp;
  fundStatusUpdate.contract = ensureContract(event.address, 'ComptrollerLib', event).id;
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
  let fund = useFund(dataSource.context().getString('vaultProxy'));

  let account = ensureInvestor(event.params.buyer, event);
  let investment = ensureInvestment(account, fund);
  let asset = useAsset(fund.denominationAsset);
  let quantity = toBigDecimal(event.params.investmentAmount, asset.decimals);
  let shares = toBigDecimal(event.params.sharesReceived);

  createInvestmentAddition(investment, asset, quantity, shares, event);
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));

  let account = ensureInvestor(event.params.redeemer, event);
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
