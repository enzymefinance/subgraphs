import { arrayUnique, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureAsset } from '../../entities/Asset';
import { createAssetBalance } from '../../entities/AssetBalance';
import { ensureMinAssetBalancesPostRedemptionPolicy } from '../../entities/MinAssetBalancesPostRedemptionPolicy';
import { MinAssetBalanceAddedForFund } from '../../generated/contracts/MinAssetBalancesPostRedemptionPolicy4Events';

export function handleMinAssetBalanceAddedForFund(event: MinAssetBalanceAddedForFund): void {
  let asset = ensureAsset(event.params.asset);
  let amount = toBigDecimal(event.params.minBalance, asset.decimals);

  let assetBalance = createAssetBalance(asset, amount, 'MinAssetBalance', event);

  let setting = ensureMinAssetBalancesPostRedemptionPolicy(event.params.comptrollerProxy, event.address, event);
  setting.assetBalances = arrayUnique(setting.assetBalances.concat([assetBalance.id]));
  setting.updatedAt = event.block.timestamp.toI32();
  setting.save();
}
