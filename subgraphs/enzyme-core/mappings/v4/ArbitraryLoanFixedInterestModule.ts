import { logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import {
  createArbitraryLoanFixedInterestModule,
  getArbitraryLoanFixedInterestModuleId,
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

  createArbitraryLoanFixedInterestModule(
    event.params.loan,
    event.address,
    event.params.scaledPerSecondRatePreMaturity,
    event.params.scaledPerSecondRatePostMaturity,
    event.params.maturity,
    event.params.repaymentTrackingType,
    event.params.faceValueIsPrincipalOnly,
  );

  arbitraryLoanPosition.save();
}

export function handleTotalPrincipalRepaidUpdatedForLoan(event: TotalPrincipalRepaidUpdatedForLoan): void {
  let arbitraryLoanPosition = useArbitraryLoanPosition(event.params.loan.toHex());

  let arbitraryLoanFixedInterestModule = useArbitraryLoanFixedInterestModule(
    getArbitraryLoanFixedInterestModuleId(event.params.loan, event.address),
  );

  if (arbitraryLoanPosition.loanAsset == null) {
    logCritical('Loan asset is null ArbitraryLoanPosition {}.', [event.params.loan.toHex()]);

    return;
  }

  let loanAsset = ensureAsset(Address.fromString(arbitraryLoanPosition.loanAsset as string));

  arbitraryLoanFixedInterestModule.totalPrincipalRepaid = toBigDecimal(
    event.params.totalPrincipalRepaid,
    loanAsset.decimals,
  );

  arbitraryLoanFixedInterestModule.save();
}

export function handleTotalInterestUpdatedForLoan(event: TotalInterestUpdatedForLoan): void {
  let arbitraryLoanFixedInterestModule = useArbitraryLoanFixedInterestModule(
    getArbitraryLoanFixedInterestModuleId(event.params.loan, event.address),
  );

  let arbitraryLoanPosition = useArbitraryLoanPosition(event.params.loan.toHex());
  if (arbitraryLoanPosition.loanAsset == null) {
    logCritical('Loan asset is null ArbitraryLoanPosition {}.', [event.params.loan.toHex()]);

    return;
  }

  let loanAsset = ensureAsset(Address.fromString(arbitraryLoanPosition.loanAsset as string));

  arbitraryLoanFixedInterestModule.totalInterestCached = toBigDecimal(event.params.totalInterest, loanAsset.decimals);
  arbitraryLoanFixedInterestModule.totalInterestCachedTimestamp = event.block.timestamp.toI32();

  arbitraryLoanFixedInterestModule.save();
}
