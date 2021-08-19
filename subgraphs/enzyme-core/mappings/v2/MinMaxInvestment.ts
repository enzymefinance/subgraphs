import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureAsset } from '../../entities/Asset';
import { ensureMinMaxInvestmentPolicy } from '../../entities/MinMaxInvestmentPolicy';
import { ComptrollerLib2Contract } from '../../generated/ComptrollerLib2Contract';
import { FundSettingsSet } from '../../generated/MinMaxInvestment2Contract';

export function handleFundSettingsSet(event: FundSettingsSet): void {
  let comptroller = ComptrollerLib2Contract.bind(event.params.comptrollerProxy);
  let denominationAsset = ensureAsset(comptroller.getDenominationAsset());
  let minInvestmentAmount = toBigDecimal(event.params.minInvestmentAmount, denominationAsset.decimals);
  let maxInvestmentAmount = toBigDecimal(event.params.maxInvestmentAmount, denominationAsset.decimals);

  let setting = ensureMinMaxInvestmentPolicy(event.params.comptrollerProxy, event.address, event);
  setting.minInvestmentAmount = minInvestmentAmount;
  setting.maxInvestmentAmount = maxInvestmentAmount;
  setting.updatedAt = event.block.timestamp.toI32();
  setting.save();
}
