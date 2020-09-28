import { BigDecimal, BigInt, dataSource, log } from '@graphprotocol/graph-ts';
import { ensureAccount, ensureInvestor, useAccount } from '../entities/Account';
import { useAsset, ensureAsset } from '../entities/Asset';
import { ensureContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { ensureInvestment } from '../entities/Investment';
import { trackFundPortfolio } from '../entities/Portfolio';
import { trackFundShares } from '../entities/Shares';
import { ensureTransaction } from '../entities/Transaction';
import {
  AmguPaid,
  FundConfigSet,
  FundStatusUpdated,
  SharesBought,
  SharesRedeemed,
} from '../generated/ComptrollerLibContract';
import {
  AmguPaidEvent,
  Asset,
  FundConfigSetEvent,
  FundStatusUpdatedEvent,
  SharesBoughtEvent,
  SharesRedeemedEvent,
} from '../generated/schema';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

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
  fundConfig.feeManagerConfigData = event.params.feeManagerConfigData.toHex();
  fundConfig.policyManagerConfigData = event.params.policyManagerConfigData.toHex();
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

  fund.status =
    event.params.nextStatus == 0
      ? 'None'
      : event.params.nextStatus == 1
      ? 'Pending'
      : event.params.nextStatus == 2
      ? 'Active'
      : 'Shutdown';
  fund.save();
}

export function handleSharesBought(event: SharesBought): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));

  let investor = ensureInvestor(event.params.buyer, event);
  let investment = ensureInvestment(investor, fund);
  let asset = useAsset(fund.denominationAsset);
  let shares = toBigDecimal(event.params.sharesReceived);

  let addition = new SharesBoughtEvent(genericId(event));
  addition.account = investment.investor;
  addition.investor = investment.investor;
  addition.fund = investment.fund;
  addition.contract = ensureContract(event.address, 'ComptrollerLib', event).id;
  addition.investment = investment.id;
  addition.asset = asset.id;
  addition.quantity = toBigDecimal(event.params.investmentAmount, asset.decimals);
  addition.shares = shares;
  addition.timestamp = event.block.timestamp;
  addition.transaction = ensureTransaction(event).id;
  addition.save();

  investment.shares = investment.shares.plus(shares);
  investment.save();

  trackFundPortfolio(fund, event, addition);
  trackFundShares(fund, event, addition);
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

  let redemption = new SharesRedeemedEvent(genericId(event));
  redemption.account = investment.investor;
  redemption.investor = investment.investor;
  redemption.fund = investment.fund;
  redemption.contract = ensureContract(event.address, 'ComptrollerLib', event).id;
  redemption.investment = investment.id;
  redemption.shares = shares;
  redemption.assets = assets.map<string>((item) => item.id);
  redemption.quantities = quantities;
  redemption.timestamp = event.block.timestamp;
  redemption.transaction = ensureTransaction(event).id;
  redemption.save();

  investment.shares = investment.shares.minus(shares);
  investment.save();

  trackFundPortfolio(fund, event, redemption);
  trackFundShares(fund, event, redemption);
}
