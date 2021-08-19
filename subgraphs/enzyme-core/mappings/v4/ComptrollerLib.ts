import { Address, dataSource } from '@graphprotocol/graph-ts';
import { toBigDecimal, uniqueEventId, ZERO_ADDRESS } from '../../../../utils';
import { ensureInvestor } from '../../entities/Account';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import { ensureComptroller } from '../../entities/Comptroller';
import { ensureGasRelayer } from '../../entities/GasRelayer';
import { ensureInvestment, trackInvestmentBalance } from '../../entities/Investment';
import { trackVaultTotalSupply, useVault } from '../../entities/Vault';
import {
  AutoProtocolFeeSharesBuybackSet,
  BuyBackMaxProtocolFeeSharesFailed,
  DeactivateFeeManagerFailed,
  GasRelayPaymasterSet,
  MigratedSharesDuePaid,
  PayProtocolFeeDuringDestructFailed,
  PreRedeemSharesHookFailed,
  RedeemSharesInKindCalcGavFailed,
  SharesBought,
  SharesRedeemed,
  VaultProxySet,
} from '../../generated/ComptrollerLib4Contract';
import {
  Asset,
  AssetAmount,
  FeeSharesReceivedEvent,
  SharesBoughtEvent,
  SharesRedeemedEvent,
} from '../../generated/schema';

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
  addition.timestamp = event.block.timestamp.toI32();
  addition.save();

  trackVaultTotalSupply(vault);
  trackInvestmentBalance(vault, investment);
}

export function handleSharesRedeemed(event: SharesRedeemed): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let investor = ensureInvestor(event.params.redeemer, event);
  let investment = ensureInvestment(investor, vault, event);
  let shares = toBigDecimal(event.params.sharesAmount);
  let assets = event.params.receivedAssets.map<Asset>((id) => ensureAsset(id));
  let qtys = event.params.receivedAssetAmounts;

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
  redemption.timestamp = event.block.timestamp.toI32();
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
  sharesDuePaid.timestamp = event.block.timestamp.toI32();
  sharesDuePaid.save();
}

export function handleAutoProtocolFeeSharesBuybackSet(event: AutoProtocolFeeSharesBuybackSet): void {
  let comptroller = ensureComptroller(event.address, event);
  comptroller.autoProtocolFeeSharesBuyback = event.params.autoProtocolFeeSharesBuyback;
  comptroller.save();
}

export function handleGasRelayPaymasterSet(event: GasRelayPaymasterSet): void {
  let comptroller = ensureComptroller(event.address, event);
  if (event.params.gasRelayPaymaster.notEqual(ZERO_ADDRESS)) {
    let gasRelayer = ensureGasRelayer(event.params.gasRelayPaymaster);
    comptroller.gasRelayer = gasRelayer.id;
  } else {
    comptroller.gasRelayer = null;
  }
  comptroller.save();
}

export function handleBuyBackMaxProtocolFeeSharesFailed(event: BuyBackMaxProtocolFeeSharesFailed): void {}
export function handleDeactivateFeeManagerFailed(event: DeactivateFeeManagerFailed): void {}
export function handlePayProtocolFeeDuringDestructFailed(event: PayProtocolFeeDuringDestructFailed): void {}
export function handlePreRedeemSharesHookFailed(event: PreRedeemSharesHookFailed): void {}
export function handleRedeemSharesInKindCalcGavFailed(event: RedeemSharesInKindCalcGavFailed): void {}
export function handleVaultProxySet(event: VaultProxySet): void {}
