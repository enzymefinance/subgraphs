import { Address, dataSource } from '@graphprotocol/graph-ts';
import { uniqueEventId } from '../../../utils/utils/id';
import { toBigDecimal } from '../../../utils/utils/math';
import { ensureAccount, ensureInvestor } from '../entities/Account';
import { ensureAsset } from '../entities/Asset';
import { createAssetAmount } from '../entities/AssetAmount';
import { calculationStateId, trackCalculationState } from '../entities/CalculationState';
import { ensureComptrollerProxy } from '../entities/ComptrollerProxy';
import { ensureInvestment } from '../entities/Investment';
import { trackInvestmentState } from '../entities/InvestmentState';
import { trackPortfolioState } from '../entities/PortfolioState';
import { trackShareState } from '../entities/ShareState';
import { ensureTransaction } from '../entities/Transaction';
import { useVault } from '../entities/Vault';
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

export function handleSharesBought(event: SharesBought): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let investor = ensureInvestor(event.params.buyer, event);
  let investmentState = trackInvestmentState(investor, vault, event);
  let investment = ensureInvestment(investor, vault, investmentState.id, event);
  let comptrollerProxy = ensureComptrollerProxy(Address.fromString(vault.accessor), event);
  let asset = ensureAsset(Address.fromString(comptrollerProxy.denominationAsset));
  let shares = toBigDecimal(event.params.sharesReceived);
  let amount = toBigDecimal(event.params.investmentAmount, asset.decimals);

  let addition = new SharesBoughtEvent(uniqueEventId(event));
  addition.investor = investment.investor;
  addition.vault = investment.vault;
  addition.type = 'SharesBought';
  addition.investmentState = investmentState.id;
  addition.depositAssetAmount = createAssetAmount(asset, amount, 'deposit', event).id;
  addition.sharesIssued = toBigDecimal(event.params.sharesIssued);
  addition.shares = shares;
  addition.timestamp = event.block.timestamp;
  addition.transaction = ensureTransaction(event).id;
  addition.calculations = calculationStateId(vault, event);
  addition.vaultState = vault.state;
  addition.save();

  trackPortfolioState(vault, event, addition);
  trackShareState(vault, event, addition);
  trackCalculationState(vault, event, addition);
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let investor = ensureInvestor(event.params.redeemer, event);
  let investmentState = trackInvestmentState(investor, vault, event);
  let investment = ensureInvestment(investor, vault, investmentState.id, event);
  let shares = toBigDecimal(event.params.sharesQuantity);
  let assets = event.params.receivedAssets.map<Asset>((id) => ensureAsset(id));
  let qtys = event.params.receivedAssetQuantities;

  let assetAmounts: AssetAmount[] = new Array<AssetAmount>();
  for (let i: i32 = 0; i < assets.length; i++) {
    let amount = toBigDecimal(qtys[i], assets[i].decimals);
    let assetAmount = createAssetAmount(assets[i], amount, 'withdraw', event);
    assetAmounts = assetAmounts.concat([assetAmount]);
  }

  let redemption = new SharesRedeemedEvent(uniqueEventId(event));
  redemption.investor = investor.id;
  redemption.vault = investment.vault;
  redemption.type = 'SharesRedeemed';
  redemption.investmentState = investmentState.id;
  redemption.shares = shares;
  redemption.withdrawAssetAmounts = assetAmounts.map<string>((assetAmount) => assetAmount.id);
  redemption.timestamp = event.block.timestamp;
  redemption.transaction = ensureTransaction(event).id;
  redemption.calculations = calculationStateId(vault, event);
  redemption.vaultState = vault.state;
  redemption.save();

  trackPortfolioState(vault, event, redemption);
  trackShareState(vault, event, redemption);
  trackCalculationState(vault, event, redemption);
}

export function handleVaultProxySet(event: VaultProxySet): void {
  let vaultProxySet = new VaultProxySetEvent(uniqueEventId(event));
  vaultProxySet.vault = event.params.vaultProxy.toHex();
  vaultProxySet.timestamp = event.block.timestamp;
  vaultProxySet.transaction = ensureTransaction(event).id;
  vaultProxySet.vaultProxy = event.params.vaultProxy.toHex();
  vaultProxySet.save();
}

export function handleOverridePauseSet(event: OverridePauseSet): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));

  let overridePauseSet = new OverridePauseSetEvent(uniqueEventId(event));
  overridePauseSet.vault = vault.id;
  overridePauseSet.timestamp = event.block.timestamp;
  overridePauseSet.transaction = ensureTransaction(event).id;
  overridePauseSet.overridePause = event.params.overridePause;
  overridePauseSet.save();
}

export function handleMigratedSharesDuePaid(event: MigratedSharesDuePaid): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));

  let paid = new MigratedSharesDuePaidEvent(uniqueEventId(event));
  paid.vault = vault.id;
  paid.timestamp = event.block.timestamp;
  paid.transaction = ensureTransaction(event).id;
  paid.sharesDue = toBigDecimal(event.params.sharesDue);
  paid.save();
}

export function handlePreRedeemSharesHookFailed(event: PreRedeemSharesHookFailed): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));

  let hookFailed = new PreRedeemSharesHookFailedEvent(uniqueEventId(event));
  hookFailed.vault = vault.id;
  hookFailed.timestamp = event.block.timestamp;
  hookFailed.sharesQuantity = toBigDecimal(event.params.sharesQuantity);
  hookFailed.redeemer = ensureAccount(event.params.redeemer, event).id;
  hookFailed.failureReturnData = event.params.failureReturnData.toHexString();
  hookFailed.transaction = ensureTransaction(event).id;
  hookFailed.save();
}
