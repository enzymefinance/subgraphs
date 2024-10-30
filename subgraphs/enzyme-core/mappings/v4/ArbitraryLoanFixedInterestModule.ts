import { logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import {
  createArbitraryLoanFixedInterestModule,
  arbitraryLoanFixedInterestModuleId,
  useArbitraryLoanFixedInterestModule,
} from '../../entities/ArbitraryLoanFixedInterestModule';
import { useArbitraryLoanPosition } from '../../entities/ArbitraryLoanPosition';
import { ensureAsset } from '../../entities/Asset';
import {
  ConfigSetForLoan,
  TotalPrincipalRepaidUpdatedForLoan,
  TotalInterestUpdatedForLoan,
} from '../../generated/contracts/ArbitraryLoanFixedInterestModule4Events';

export function handleConfigSetForLoan(event: ConfigSetForLoan): void {
  let arbitraryLoanPosition = useArbitraryLoanPosition(event.params.loan.toHex());
  arbitraryLoanPosition.moduleType = 'FixedInterest';
  arbitraryLoanPosition.save();

  createArbitraryLoanFixedInterestModule(
    event.params.loan,
    event.address,
    event.params.scaledPerSecondRatePreMaturity,
    event.params.scaledPerSecondRatePostMaturity,
    event.params.maturity,
    event.params.repaymentTrackingType,
    event.params.faceValueIsPrincipalOnly,
  );
}

export function handleTotalPrincipalRepaidUpdatedForLoan(event: TotalPrincipalRepaidUpdatedForLoan): void {
  let arbitraryLoanPosition = useArbitraryLoanPosition(event.params.loan.toHex());

  let moduleId = arbitraryLoanFixedInterestModuleId(event.params.loan, event.address);
  let arbitraryLoanFixedInterestModule = useArbitraryLoanFixedInterestModule(moduleId);

  let loanAsset = ensureAsset(Address.fromString(arbitraryLoanPosition.loanAsset));

  arbitraryLoanFixedInterestModule.totalPrincipalRepaid = toBigDecimal(
    event.params.totalPrincipalRepaid,
    loanAsset.decimals,
  );

  arbitraryLoanFixedInterestModule.save();
}

export function handleTotalInterestUpdatedForLoan(event: TotalInterestUpdatedForLoan): void {
  let moduleId = arbitraryLoanFixedInterestModuleId(event.params.loan, event.address);
  let arbitraryLoanFixedInterestModule = useArbitraryLoanFixedInterestModule(moduleId);

  let arbitraryLoanPosition = useArbitraryLoanPosition(event.params.loan.toHex());
  let loanAsset = ensureAsset(Address.fromString(arbitraryLoanPosition.loanAsset));

  arbitraryLoanFixedInterestModule.totalInterestCached = toBigDecimal(event.params.totalInterest, loanAsset.decimals);
  arbitraryLoanFixedInterestModule.totalInterestCachedTimestamp = event.block.timestamp.toI32();
  arbitraryLoanFixedInterestModule.save();
}
