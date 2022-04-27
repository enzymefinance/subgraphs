import { arrayUnique, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import { ensureComptroller } from '../../entities/Comptroller';
import { trackTrade } from '../../entities/Trade';
import { useVault } from '../../entities/Vault';
import {
  CallOnIntegrationExecutedForFund,
  ValidatedVaultProxySetForFund,
} from '../../generated/contracts/IntegrationManager4Events';
import { Asset, AssetAmount } from '../../generated/schema';
import { release4Addresses } from '../../generated/addresses';
import { claimRewardsSelector } from '../../utils/integrationSelectors';

export function handleCallOnIntegrationExecutedForFund(event: CallOnIntegrationExecutedForFund): void {
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  if (comptroller.vault == null) {
    return;
  }

  let vault = useVault(comptroller.vault as string);
  let integrationSelector = event.params.selector.toHexString();

  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));
  let incomingAssets = event.params.incomingAssets.map<Asset>((asset) => ensureAsset(asset));
  let outgoingAssets = event.params.spendAssets.map<Asset>((asset) => ensureAsset(asset));

  let incomingAssetAmounts: AssetAmount[] = new Array<AssetAmount>();
  let incomingAmounts = event.params.incomingAssetAmounts;
  for (let i = 0; i < incomingAmounts.length; i++) {
    let amount = toBigDecimal(incomingAmounts[i], incomingAssets[i].decimals);
    let assetAmount = createAssetAmount(incomingAssets[i], amount, denominationAsset, 'trade/incoming', event);
    incomingAssetAmounts = incomingAssetAmounts.concat([assetAmount]);
  }

  let outgoingAssetAmounts: AssetAmount[] = new Array<AssetAmount>();
  let outgoingAmounts = event.params.spendAssetAmounts;
  for (let i = 0; i < outgoingAmounts.length; i++) {
    let amount = toBigDecimal(outgoingAmounts[i], outgoingAssets[i].decimals);
    let assetAmount = createAssetAmount(outgoingAssets[i], amount, denominationAsset, 'trade/outgoing', event);
    outgoingAssetAmounts = outgoingAssetAmounts.concat([assetAmount]);
  }

  // Claim rewards doesn't emit incoming assets. In order to be able to display information, on the activty page, about claimed asset we decode the call action args.
  if (
    release4Addresses.curveLiquidityAdapterAddress.equals(event.params.adapter) &&
    integrationSelector == claimRewardsSelector
  ) {
    let decoded = ethereum.decode('(address)', event.params.integrationData);

    if (decoded == null) {
      return;
    }

    let tuple = decoded.toTuple();

    let rewardAssetAddress = tuple[0].toAddress();

    let rewardAsset = ensureAsset(rewardAssetAddress);

    incomingAssets = arrayUnique<Asset>(incomingAssets.concat([rewardAsset]));
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
}

export function handleValidatedVaultProxySetForFund(event: ValidatedVaultProxySetForFund): void {}
