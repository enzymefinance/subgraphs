import { arrayDiff, arrayUnique, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import { ensureAccount, ensureAuthUser } from '../../entities/Account';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import { ensureComptroller } from '../../entities/Comptroller';
import { trackTrade } from '../../entities/Trade';
import { useVault } from '../../entities/Vault';
import { trackVaultMetric } from '../../entities/VaultMetric';
import {
  AdapterDeregistered,
  AdapterRegistered,
  AuthUserAddedForFund,
  AuthUserRemovedForFund,
  CallOnIntegrationExecutedForFund,
} from '../../generated/contracts/IntegrationManager2Events';
import { Asset, AssetAmount } from '../../generated/schema';

export function handleAdapterRegistered(event: AdapterRegistered): void {}

export function handleAdapterDeregistered(event: AdapterDeregistered): void {}

export function handleAuthUserAddedForFund(event: AuthUserAddedForFund): void {
  let account = ensureAuthUser(event.params.account, event);
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  comptroller.authUsers = arrayUnique<string>(comptroller.authUsers.concat([account.id]));
  comptroller.save();
}

export function handleAuthUserRemovedForFund(event: AuthUserRemovedForFund): void {
  let account = ensureAccount(event.params.account, event);
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  comptroller.authUsers = arrayDiff<string>(comptroller.authUsers, [account.id]);
  comptroller.save();
}

export function handleCallOnIntegrationExecutedForFund(event: CallOnIntegrationExecutedForFund): void {
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  if (comptroller.vault == null) {
    return;
  }

  let vault = useVault(event.params.vaultProxy.toHex());
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  let integrationSelector = event.params.selector.toHexString();

  let incomingAssets = event.params.incomingAssets.map<Asset>((asset) => ensureAsset(asset));
  let outgoingAssets = event.params.outgoingAssets.map<Asset>((asset) => ensureAsset(asset));

  let incomingAssetAmounts: AssetAmount[] = new Array<AssetAmount>();
  let incomingAmounts = event.params.incomingAssetAmounts;
  for (let i = 0; i < incomingAmounts.length; i++) {
    let amount = toBigDecimal(incomingAmounts[i], incomingAssets[i].decimals);
    let assetAmount = createAssetAmount(incomingAssets[i], amount, denominationAsset, 'trade/incoming', event);
    incomingAssetAmounts = incomingAssetAmounts.concat([assetAmount]);
  }

  let outgoingAssetAmounts: AssetAmount[] = new Array<AssetAmount>();
  let outgoingAmounts = event.params.outgoingAssetAmounts;
  for (let i = 0; i < outgoingAmounts.length; i++) {
    let amount = toBigDecimal(outgoingAmounts[i], outgoingAssets[i].decimals);
    let assetAmount = createAssetAmount(outgoingAssets[i], amount, denominationAsset, 'trade/outgoing', event);
    outgoingAssetAmounts = outgoingAssetAmounts.concat([assetAmount]);
  }

  trackTrade(
    vault,
    event.params.adapter,
    integrationSelector,
    incomingAssets,
    outgoingAssets,
    incomingAssetAmounts,
    outgoingAssetAmounts,
    event,
  );

  trackVaultMetric(event.params.vaultProxy, event);
}
