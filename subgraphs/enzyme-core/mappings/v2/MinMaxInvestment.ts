import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureAsset } from '../../entities/Asset';
import { ensureMinMaxDepositPolicy } from '../../entities/MinMaxDepositPolicy';
import { ComptrollerLib2Contract } from '../../generated/ComptrollerLib2Contract';
import { FundSettingsSet } from '../../generated/MinMaxInvestment2Contract';

export function handleFundSettingsSet(event: FundSettingsSet): void {
  let comptroller = ComptrollerLib2Contract.bind(event.params.comptrollerProxy);
  let denominationAsset = ensureAsset(comptroller.getDenominationAsset());
  let minDepositAmount = toBigDecimal(event.params.minInvestmentAmount, denominationAsset.decimals);
  let maxDepositAmount = toBigDecimal(event.params.maxInvestmentAmount, denominationAsset.decimals);

  let setting = ensureMinMaxDepositPolicy(event.params.comptrollerProxy, event.address, event);
  setting.minDepositAmount = minDepositAmount;
  setting.maxDepositAmount = maxDepositAmount;
  setting.updatedAt = event.block.timestamp.toI32();
  setting.save();
}
