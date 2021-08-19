import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureAsset } from '../../entities/Asset';
import { ensureMinMaxInvestmentPolicy } from '../../entities/MinMaxInvestmentPolicy';
import { ComptrollerLib3Contract } from '../../generated/ComptrollerLib3Contract';
import { FundSettingsSet } from '../../generated/MinMaxInvestment3Contract';

export function handleFundSettingsSet(event: FundSettingsSet): void {
  let comptroller = ComptrollerLib3Contract.bind(event.params.comptrollerProxy);
  let denominationAsset = ensureAsset(comptroller.getDenominationAsset());
  let minInvestmentAmount = toBigDecimal(event.params.minInvestmentAmount, denominationAsset.decimals);
  let maxInvestmentAmount = toBigDecimal(event.params.maxInvestmentAmount, denominationAsset.decimals);

  let setting = ensureMinMaxInvestmentPolicy(event.params.comptrollerProxy, event.address, event);
  setting.minInvestmentAmount = minInvestmentAmount;
  setting.maxInvestmentAmount = maxInvestmentAmount;
  setting.updatedAt = event.block.timestamp.toI32();
  setting.save();
}
