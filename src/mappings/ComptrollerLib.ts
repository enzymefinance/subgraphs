import { Address, dataSource } from '@graphprotocol/graph-ts';
import { ensureAccount, ensureInvestor } from '../entities/Account';
import { ensureAsset } from '../entities/Asset';
import { createAssetAmount } from '../entities/AssetAmount';
import { ensureComptrollerProxy } from '../entities/ComptrollerProxy';
import { useFund } from '../entities/Fund';
import { ensureInvestment } from '../entities/Investment';
import { trackInvestmentState } from '../entities/InvestmentState';
import { trackPortfolioState } from '../entities/PortfolioState';
import { trackShareState } from '../entities/ShareState';
import { ensureTransaction } from '../entities/Transaction';
import {
  MigratedSharesDuePaid,
  OverridePauseSet,
  PreRedeemSharesHookFailed,
  SharesBought,
  SharesRedeemed,
  VaultProxySet,
} from '../generated/ComptrollerLibContract';
import {
  Asset,
  AssetAmount,
  MigratedSharesDuePaidEvent,
  OverridePauseSetEvent,
  PreRedeemSharesHookFailedEvent,
  SharesBoughtEvent,
  SharesRedeemedEvent,
  VaultProxySetEvent,
} from '../generated/schema';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleSharesBought(event: SharesBought): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));
  let investor = ensureInvestor(event.params.buyer, event);
  let investmentState = trackInvestmentState(investor, fund, event);
  let investment = ensureInvestment(investor, fund, investmentState.id, event);
  let comptrollerProxy = ensureComptrollerProxy(Address.fromString(fund.accessor), event);
  let asset = ensureAsset(Address.fromString(comptrollerProxy.denominationAsset));
  let shares = toBigDecimal(event.params.sharesReceived);

  let addition = new SharesBoughtEvent(genericId(event));
  addition.investor = investment.investor;
  addition.fund = investment.fund;
  addition.type = 'SharesBought';
  addition.investmentState = investmentState.id;
  addition.asset = asset.id;
  addition.investmentAmount = toBigDecimal(event.params.investmentAmount, asset.decimals);
  addition.sharesIssued = toBigDecimal(event.params.sharesIssued);
  addition.shares = shares;
  addition.timestamp = event.block.timestamp;
  addition.transaction = ensureTransaction(event).id;
  addition.fundState = fund.state;
  addition.save();

  trackPortfolioState(fund, event, addition);
  trackShareState(fund, event, addition);
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));
  let investor = ensureInvestor(event.params.redeemer, event);
  let investmentState = trackInvestmentState(investor, fund, event);
  let investment = ensureInvestment(investor, fund, investmentState.id, event);
  let shares = toBigDecimal(event.params.sharesQuantity);
  let assets = event.params.receivedAssets.map<Asset>((id) => ensureAsset(id));
  let qtys = event.params.receivedAssetQuantities;

  let assetAmounts: AssetAmount[] = new Array<AssetAmount>();
  for (let i: i32 = 0; i < assets.length; i++) {
    let amount = toBigDecimal(qtys[i], assets[i].decimals);
    let assetAmount = createAssetAmount(assets[i], amount, 'redemption', event);
    assetAmounts = assetAmounts.concat([assetAmount]);
  }

  let redemption = new SharesRedeemedEvent(genericId(event));
  redemption.investor = investor.id;
  redemption.fund = investment.fund;
  redemption.type = 'SharesRedeemed';
  redemption.investmentState = investmentState.id;
  redemption.shares = shares;
  redemption.payoutAssetAmounts = assetAmounts.map<string>((assetAmount) => assetAmount.id);
  redemption.timestamp = event.block.timestamp;
  redemption.transaction = ensureTransaction(event).id;
  redemption.fundState = fund.state;
  redemption.save();

  trackPortfolioState(fund, event, redemption);
  trackShareState(fund, event, redemption);
}

export function handleVaultProxySet(event: VaultProxySet): void {
  let vaultProxySet = new VaultProxySetEvent(genericId(event));
  vaultProxySet.fund = event.params.vaultProxy.toHex();
  vaultProxySet.timestamp = event.block.timestamp;
  vaultProxySet.transaction = ensureTransaction(event).id;
  vaultProxySet.vaultProxy = event.params.vaultProxy.toHex();
  vaultProxySet.save();
}

export function handleOverridePauseSet(event: OverridePauseSet): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));

  let overridePauseSet = new OverridePauseSetEvent(genericId(event));
  overridePauseSet.fund = fund.id;
  overridePauseSet.timestamp = event.block.timestamp;
  overridePauseSet.transaction = ensureTransaction(event).id;
  overridePauseSet.overridePause = event.params.overridePause;
  overridePauseSet.save();
}

export function handleMigratedSharesDuePaid(event: MigratedSharesDuePaid): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));

  let manager = ensureInvestor(Address.fromString(fund.manager), event);
  let investmentState = trackInvestmentState(manager, fund, event);

  let paid = new MigratedSharesDuePaidEvent(genericId(event));
  paid.fund = fund.id;
  paid.type = 'MigratedSharesDuePaid';
  paid.timestamp = event.block.timestamp;
  paid.transaction = ensureTransaction(event).id;
  paid.investor = manager.id;
  paid.investmentState = investmentState.id;
  paid.shares = toBigDecimal(event.params.sharesDue);
  paid.comptrollerProxy = event.address.toHex();
  paid.fundState = fund.state;
  paid.save();

  trackShareState(fund, event, paid);

  let vaultAsInvestor = ensureInvestor(Address.fromString(fund.id), event);
  trackInvestmentState(vaultAsInvestor, fund, event);
}

export function handlePreRedeemSharesHookFailed(event: PreRedeemSharesHookFailed): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));

  let hookFailed = new PreRedeemSharesHookFailedEvent(genericId(event));
  hookFailed.fund = fund.id;
  hookFailed.timestamp = event.block.timestamp;
  hookFailed.sharesQuantity = toBigDecimal(event.params.sharesQuantity);
  hookFailed.redeemer = ensureAccount(event.params.redeemer, event).id;
  hookFailed.failureReturnData = event.params.failureReturnData.toHexString();
  hookFailed.transaction = ensureTransaction(event).id;
  hookFailed.save();
}
