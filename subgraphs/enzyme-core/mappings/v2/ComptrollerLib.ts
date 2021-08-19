import { logCritical, toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, dataSource } from '@graphprotocol/graph-ts';
import { ensureInvestor } from '../../entities/Account';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import { ensureComptroller } from '../../entities/Comptroller';
import { ensureInvestment } from '../../entities/Investment';
import { useVault } from '../../entities/Vault';
import {
  MigratedSharesDuePaid,
  OverridePauseSet,
  PreRedeemSharesHookFailed,
  SharesBought,
  SharesRedeemed,
  VaultProxySet,
} from '../../generated/ComptrollerLib2Contract';
import {
  Asset,
  AssetAmount,
  FeeSharesReceivedEvent,
  SharesBoughtEvent,
  SharesRedeemedEvent,
} from '../../generated/schema';
import { VaultLib2Contract } from '../../generated/VaultLib2Contract';

export function handleSharesBought(event: SharesBought): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let investor = ensureInvestor(event.params.buyer, event);
  let investment = ensureInvestment(investor, vault, event);

  let comptrollerProxy = ensureComptroller(Address.fromString(vault.comptroller), event);
  let asset = ensureAsset(Address.fromString(comptrollerProxy.denomination));
  let shares = toBigDecimal(event.params.sharesReceived);
  let amount = toBigDecimal(event.params.investmentAmount, asset.decimals);

  let addition = new SharesBoughtEvent(uniqueEventId(event));
  addition.vault = vault.id;
  addition.investor = investor.id;
  addition.investment = investment.id;
  addition.type = 'SharesBought';
  addition.depositAssetAmount = createAssetAmount(asset, amount, 'deposit', event).id;
  addition.sharesIssued = toBigDecimal(event.params.sharesIssued);
  addition.shares = shares;
  addition.timestamp = event.block.timestamp;
  addition.save();

  let vaultProxy = VaultLib2Contract.bind(Address.fromString(vault.id));
  let balanceCall = vaultProxy.try_balanceOf(Address.fromString(investor.id));
  if (balanceCall.reverted) {
    logCritical('balanceOf() reverted for account {} on vault {}', [investor.id, vault.id]);
  }

  investment.shares = toBigDecimal(balanceCall.value);
  investment.save();

  let totalSupplyCall = vaultProxy.try_totalSupply();
  if (totalSupplyCall.reverted) {
    logCritical('totalSupply() reverted for vault{}', [vault.id]);
  }

  vault.totalSupply = toBigDecimal(totalSupplyCall.value);
  vault.save();
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let investor = ensureInvestor(event.params.redeemer, event);
  let investment = ensureInvestment(investor, vault, event);
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
  redemption.vault = vault.id;
  redemption.investor = investor.id;
  redemption.investment = investment.id;
  redemption.type = 'SharesRedeemed';
  redemption.shares = shares;
  redemption.payoutAssetAmounts = assetAmounts.map<string>((assetAmount) => assetAmount.id);
  redemption.timestamp = event.block.timestamp;
  redemption.save();
}

export function handleMigratedSharesDuePaid(event: MigratedSharesDuePaid): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let investor = ensureInvestor(Address.fromString(vault.owner), event);
  let investment = ensureInvestment(investor, vault, event);
  let shares = toBigDecimal(event.params.sharesDue);

  let sharesDuePaid = new FeeSharesReceivedEvent(uniqueEventId(event));
  sharesDuePaid.vault = vault.id;
  sharesDuePaid.investor = investor.id;
  sharesDuePaid.investment = investment.id;
  sharesDuePaid.type = 'FeeSharesReceived';
  sharesDuePaid.shares = shares;
  sharesDuePaid.timestamp = event.block.timestamp;
  sharesDuePaid.save();
}

export function handleVaultProxySet(event: VaultProxySet): void {}
export function handleOverridePauseSet(event: OverridePauseSet): void {}
export function handlePreRedeemSharesHookFailed(event: PreRedeemSharesHookFailed): void {}
