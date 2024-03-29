import { toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, dataSource } from '@graphprotocol/graph-ts';
import { ensureDepositor } from '../../entities/Account';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import { ensureComptroller } from '../../entities/Comptroller';
import { getActivityCounter } from '../../entities/Counter';
import { ensureDeposit } from '../../entities/Deposit';
import { useVault } from '../../entities/Vault';
import {
  MigratedSharesDuePaid,
  OverridePauseSet,
  PreRedeemSharesHookFailed,
  SharesBought,
  SharesRedeemed,
  VaultProxySet,
} from '../../generated/contracts/ComptrollerLib3Events';
import {
  Asset,
  AssetAmount,
  FeeSharesReceivedEvent,
  SharesBoughtEvent,
  SharesRedeemedEvent,
} from '../../generated/schema';

export function handleSharesBought(event: SharesBought): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let depositor = ensureDepositor(event.params.buyer, event);
  let deposit = ensureDeposit(depositor, vault, event);

  let comptrollerProxy = ensureComptroller(Address.fromString(vault.comptroller), event);
  let asset = ensureAsset(Address.fromString(comptrollerProxy.denomination));
  let denominationAsset = asset;
  let shares = toBigDecimal(event.params.sharesReceived);
  let amount = toBigDecimal(event.params.investmentAmount, asset.decimals);

  let addition = new SharesBoughtEvent(uniqueEventId(event));
  addition.vault = vault.id;
  addition.depositor = depositor.id;
  addition.deposit = deposit.id;
  addition.sharesChangeType = 'SharesBought';
  addition.depositAssetAmount = createAssetAmount(asset, amount, denominationAsset, 'deposit', event).id;
  addition.sharesIssued = toBigDecimal(event.params.sharesIssued);
  addition.shares = shares;
  addition.timestamp = event.block.timestamp.toI32();
  addition.activityCounter = getActivityCounter();
  addition.activityCategories = ['Vault', 'Depositor'];
  addition.activityType = 'DepositorShares';
  addition.save();
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let depositor = ensureDepositor(event.params.redeemer, event);
  let deposit = ensureDeposit(depositor, vault, event);

  let comptrollerProxy = ensureComptroller(Address.fromString(vault.comptroller), event);
  let shares = toBigDecimal(event.params.sharesQuantity);
  let assets = event.params.receivedAssets.map<Asset>((id) => ensureAsset(id));
  let qtys = event.params.receivedAssetQuantities;
  let denominationAsset = ensureAsset(Address.fromString(comptrollerProxy.denomination));

  let assetAmounts: AssetAmount[] = new Array<AssetAmount>();
  for (let i: i32 = 0; i < assets.length; i++) {
    let amount = toBigDecimal(qtys[i], assets[i].decimals);
    let assetAmount = createAssetAmount(assets[i], amount, denominationAsset, 'withdraw', event);
    assetAmounts = assetAmounts.concat([assetAmount]);
  }

  let redemption = new SharesRedeemedEvent(uniqueEventId(event));
  redemption.vault = vault.id;
  redemption.depositor = depositor.id;
  redemption.deposit = deposit.id;
  redemption.sharesChangeType = 'SharesRedeemed';
  redemption.shares = shares;
  redemption.payoutAssetAmounts = assetAmounts.map<string>((assetAmount) => assetAmount.id);
  redemption.timestamp = event.block.timestamp.toI32();
  redemption.activityCounter = getActivityCounter();
  redemption.activityCategories = ['Vault', 'Depositor'];
  redemption.activityType = 'DepositorShares';
  redemption.save();
}

export function handleMigratedSharesDuePaid(event: MigratedSharesDuePaid): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let depositor = ensureDepositor(Address.fromString(vault.owner), event);
  let deposit = ensureDeposit(depositor, vault, event);
  let shares = toBigDecimal(event.params.sharesDue);

  let sharesDuePaid = new FeeSharesReceivedEvent(uniqueEventId(event));
  sharesDuePaid.vault = vault.id;
  sharesDuePaid.depositor = depositor.id;
  sharesDuePaid.deposit = deposit.id;
  sharesDuePaid.sharesChangeType = 'FeeSharesReceived';
  sharesDuePaid.shares = shares;
  sharesDuePaid.timestamp = event.block.timestamp.toI32();
  sharesDuePaid.activityCounter = getActivityCounter();
  sharesDuePaid.activityCategories = ['Vault', 'Depositor'];
  sharesDuePaid.activityType = 'DepositorShares';
  sharesDuePaid.save();
}

export function handleVaultProxySet(event: VaultProxySet): void {}
export function handleOverridePauseSet(event: OverridePauseSet): void {}
export function handlePreRedeemSharesHookFailed(event: PreRedeemSharesHookFailed): void {}
