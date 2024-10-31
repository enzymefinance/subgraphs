import { useArbitraryLoanPosition } from '../../entities/ArbitraryLoanPosition';
import { createArbitraryLoanTotalNominalDeltaOracleModule } from '../../entities/ArbitraryLoanTotalNominalDeltaOracleModule';
import { OracleSetForLoan } from '../../generated/contracts/ArbitraryLoanTotalNominalDeltaOracleModule4Events';

export function handleOracleSetForLoan(event: OracleSetForLoan): void {
  let arbitraryLoanPosition = useArbitraryLoanPosition(event.params.loan.toHex());
  arbitraryLoanPosition.moduleType = 'TotalNominalDeltaOracle';
  createArbitraryLoanTotalNominalDeltaOracleModule(
    event.params.loan,
    event.address,
    event.params.oracle,
    event.params.stalenessThreshold,
  );
  arbitraryLoanPosition.save();
}
