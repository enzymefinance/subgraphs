import { BigDecimal, dataSource } from '@graphprotocol/graph-ts';
import { ensureInvestor, useAccount } from '../entities/Account';
import { useAsset } from '../entities/Asset';
import { calculationStateId, trackCalculationState } from '../entities/CalculationState';
import { ensureContract, useContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { useInvestment } from '../entities/Investment';
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
  let investment = useInvestment(investor, fund);
  let asset = useAsset(fund.denominationAsset);
  let shares = toBigDecimal(event.params.sharesReceived);

  let addition = new SharesBoughtEvent(genericId(event));
  addition.account = investment.investor;
  addition.investor = investment.investor;
  addition.fund = investment.fund;
  addition.type = 'SharesBought';
  addition.contract = ensureContract(event.address, 'ComptrollerLib').id;
  addition.investmentState = investmentState.id;
  addition.asset = asset.id;
  addition.investmentAmount = toBigDecimal(event.params.investmentAmount, asset.decimals);
  addition.sharesIssued = toBigDecimal(event.params.sharesIssued);
  addition.shares = shares;
  addition.timestamp = event.block.timestamp;
  addition.transaction = ensureTransaction(event).id;
  addition.calculations = calculationStateId(fund, event);
  addition.fundState = fund.state;
  addition.save();

  trackPortfolioState(fund, event, addition);
  trackShareState(fund, event, addition);
  trackCalculationState(fund, event, addition);
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));
  let investor = ensureInvestor(event.params.redeemer, event);
  let investmentState = trackInvestmentState(investor, fund, event);
  let investment = useInvestment(investor, fund);
  let shares = toBigDecimal(event.params.sharesQuantity);
  let assets = event.params.receivedAssets.map<Asset>((id) => useAsset(id.toHex()));
  let qtys = event.params.receivedAssetQuantities;

  let quantities: BigDecimal[] = new Array<BigDecimal>();
  for (let i: i32 = 0; i < assets.length; i++) {
    quantities = quantities.concat([toBigDecimal(qtys[i], assets[i].decimals)]);
  }

  let redemption = new SharesRedeemedEvent(genericId(event));
  redemption.account = investor.id;
  redemption.investor = investor.id;
  redemption.fund = investment.fund;
  redemption.type = 'SharesRedeemed';
  redemption.contract = ensureContract(event.address, 'ComptrollerLib').id;
  redemption.investmentState = investmentState.id;
  redemption.shares = shares;
  redemption.payoutAssets = assets.map<string>((item) => item.id);
  redemption.payoutQuantities = quantities;
  redemption.timestamp = event.block.timestamp;
  redemption.transaction = ensureTransaction(event).id;
  redemption.calculations = calculationStateId(fund, event);
  redemption.fundState = fund.state;
  redemption.save();

  trackPortfolioState(fund, event, redemption);
  trackShareState(fund, event, redemption);
  trackCalculationState(fund, event, redemption);
}

export function handleVaultProxySet(event: VaultProxySet): void {
  let vaultProxySet = new VaultProxySetEvent(genericId(event));
  vaultProxySet.fund = event.params.vaultProxy.toHex();
  vaultProxySet.account = useAccount(event.transaction.from.toHex()).id;
  vaultProxySet.contract = ensureContract(event.address, 'ComptrollerLib').id;
  vaultProxySet.timestamp = event.block.timestamp;
  vaultProxySet.transaction = ensureTransaction(event).id;
  vaultProxySet.vaultProxy = event.params.vaultProxy.toHex();
  vaultProxySet.save();
}

export function handleOverridePauseSet(event: OverridePauseSet): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));
  let account = ensureInvestor(event.transaction.from, event);

  let overridePauseSet = new OverridePauseSetEvent(genericId(event));
  overridePauseSet.fund = fund.id;
  overridePauseSet.account = account.id;
  overridePauseSet.contract = useContract(event.address.toHex()).id;
  overridePauseSet.timestamp = event.block.timestamp;
  overridePauseSet.transaction = ensureTransaction(event).id;
  overridePauseSet.overridePause = event.params.overridePause;
  overridePauseSet.save();
}

export function handleMigratedSharesDuePaid(event: MigratedSharesDuePaid): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));
  let account = ensureInvestor(event.transaction.from, event);

  let paid = new MigratedSharesDuePaidEvent(genericId(event));
  paid.fund = fund.id;
  paid.account = account.id;
  paid.contract = useContract(event.address.toHex()).id;
  paid.timestamp = event.block.timestamp;
  paid.transaction = ensureTransaction(event).id;
  paid.sharesDue = toBigDecimal(event.params.sharesDue);
  paid.save();
}

export function handlePreRedeemSharesHookFailed(event: PreRedeemSharesHookFailed): void {
  let fund = useFund(dataSource.context().getString('vaultProxy'));
  let account = ensureInvestor(event.transaction.from, event);

  let hookFailed = new PreRedeemSharesHookFailedEvent(genericId(event));
  hookFailed.fund = fund.id;
  hookFailed.account = account.id;
  hookFailed.contract = useContract(event.address.toHex()).id;
  hookFailed.timestamp = event.block.timestamp;
  hookFailed.sharesQuantity = toBigDecimal(event.params.sharesQuantity);
  hookFailed.redeemer = ensureInvestor(event.params.redeemer, event).id;
  hookFailed.failureReturnData = event.params.failureReturnData.toHexString();
  hookFailed.transaction = ensureTransaction(event).id;
  hookFailed.save();
}
