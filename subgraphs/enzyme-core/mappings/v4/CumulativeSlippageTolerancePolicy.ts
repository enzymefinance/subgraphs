import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureCumulativeSlippageTolerancePolicy } from '../../entities/CumulativeSlippageTolerancePolicy';
import {
  CumulativeSlippageUpdatedForFund,
  FundSettingsSet,
  PricelessAssetBypassed,
  PricelessAssetTimelockStarted,
} from '../../generated/CumulativeSlippageTolerancePolicy4Contract';

export function handleCumulativeSlippageUpdatedForFund(event: CumulativeSlippageUpdatedForFund): void {
  let policy = ensureCumulativeSlippageTolerancePolicy(event.params.comptrollerProxy, event.address, event);
  policy.cumulativeSlippage = toBigDecimal(event.params.nextCumulativeSlippage, 4);
  policy.lastSlippageTimestamp = event.block.timestamp.toI32();
  policy.save();
}

export function handleFundSettingsSet(event: FundSettingsSet): void {
  let policy = ensureCumulativeSlippageTolerancePolicy(event.params.comptrollerProxy, event.address, event);
  policy.tolerance = toBigDecimal(event.params.tolerance, 4);
  policy.save();
}

export function handlePricelessAssetBypassed(event: PricelessAssetBypassed): void {}
export function handlePricelessAssetTimelockStarted(event: PricelessAssetTimelockStarted): void {}
