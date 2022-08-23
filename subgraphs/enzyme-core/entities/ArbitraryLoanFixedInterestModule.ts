import { logCritical, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import { ArbitraryLoanFixedInterestModule } from '../generated/schema';

export function useArbitraryLoanFixedInterestModule(id: string): ArbitraryLoanFixedInterestModule {
  let arbitraryLoanFixedInterestModule = ArbitraryLoanFixedInterestModule.load(id);
  if (arbitraryLoanFixedInterestModule == null) {
    logCritical('Failed to load ArbitraryLoanFixedInterestModule {}.', [id]);
  }

  return arbitraryLoanFixedInterestModule as ArbitraryLoanFixedInterestModule;
}

export function getArbitraryLoanFixedInterestModuleId(
  externalPositionAddress: Address,
  acccountingModuleAddress: Address,
): string {
  return externalPositionAddress.toHex() + acccountingModuleAddress.toHex();
}

export function createArbitraryLoanFixedInterestModule(
  externalPositionAddress: Address,
  acccountingModuleAddress: Address,
  scaledPerSecondRatePreMaturity: BigInt,
  scaledPerSecondRatePostMaturity: BigInt,
  maturity: BigInt,
  repaymentTrackingType: number,
  faceValueIsPrincipalOnly: boolean,
): ArbitraryLoanFixedInterestModule {
  let arbitraryLoanFixedInterestModule = new ArbitraryLoanFixedInterestModule(
    getArbitraryLoanFixedInterestModuleId(externalPositionAddress, acccountingModuleAddress),
  );

  let repaymentTrackingTypeName =
    repaymentTrackingType == 0 ? 'None' : repaymentTrackingType == 1 ? 'PrincipalFirst' : 'InterestFirst';

  arbitraryLoanFixedInterestModule.externalPosition = externalPositionAddress.toHex();
  arbitraryLoanFixedInterestModule.scaledPerSecondRatePreMaturity = scaledPerSecondRatePreMaturity;
  arbitraryLoanFixedInterestModule.scaledPerSecondRatePostMaturity = scaledPerSecondRatePostMaturity;
  arbitraryLoanFixedInterestModule.maturity = maturity.toI32();
  arbitraryLoanFixedInterestModule.repaymentTrackingType = repaymentTrackingTypeName;
  arbitraryLoanFixedInterestModule.faceValueIsPrincipalOnly = faceValueIsPrincipalOnly;
  arbitraryLoanFixedInterestModule.totalPrincipalRepaid = ZERO_BD;
  arbitraryLoanFixedInterestModule.totalInterestCachedTimestamp = 0;
  arbitraryLoanFixedInterestModule.totalInterestCached = ZERO_BD;

  arbitraryLoanFixedInterestModule.save();

  return arbitraryLoanFixedInterestModule;
}
