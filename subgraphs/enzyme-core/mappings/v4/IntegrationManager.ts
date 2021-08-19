import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import { ensureComptroller } from '../../entities/Comptroller';
import { trackTrade } from '../../entities/Trade';
import { useVault } from '../../entities/Vault';
import { CallOnIntegrationExecutedForFund } from '../../generated/IntegrationManager4Contract';
import { Asset, AssetAmount } from '../../generated/schema';

export function handleCallOnIntegrationExecutedForFund(event: CallOnIntegrationExecutedForFund): void {
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  if (comptroller.vault == null) {
    return;
  }

  let vault = useVault(comptroller.vault);

  let adapter = event.params.adapter.toHex();
  let integrationSelector = event.params.selector.toHexString();

  let incomingAssets = event.params.incomingAssets.map<Asset>((asset) => ensureAsset(asset));
  let outgoingAssets = event.params.spendAssets.map<Asset>((asset) => ensureAsset(asset));

  let incomingAssetAmounts: AssetAmount[] = new Array<AssetAmount>();
  let incomingAmounts = event.params.incomingAssetAmounts;
  for (let i = 0; i < incomingAmounts.length; i++) {
    let amount = toBigDecimal(incomingAmounts[i], incomingAssets[i].decimals);
    let assetAmount = createAssetAmount(incomingAssets[i], amount, 'trade/incoming', event);
    incomingAssetAmounts = incomingAssetAmounts.concat([assetAmount]);
  }

  let outgoingAssetAmounts: AssetAmount[] = new Array<AssetAmount>();
  let outgoingAmounts = event.params.spendAssetAmounts;
  for (let i = 0; i < outgoingAmounts.length; i++) {
    let amount = toBigDecimal(outgoingAmounts[i], outgoingAssets[i].decimals);
    let assetAmount = createAssetAmount(outgoingAssets[i], amount, 'trade/outgoing', event);
    outgoingAssetAmounts = outgoingAssetAmounts.concat([assetAmount]);
  }

  trackTrade(
    vault,
    adapter,
    integrationSelector,
    incomingAssets,
    outgoingAssets,
    incomingAssetAmounts,
    outgoingAssetAmounts,
    event,
  );
}
