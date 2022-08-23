import { logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, Bytes } from '@graphprotocol/graph-ts';
import {
  useArbitraryLoanFixedInterestModule,
  getArbitraryLoanFixedInterestModuleId,
} from '../../entities/ArbitraryLoanFixedInterestModule';
import { useArbitraryLoanPosition } from '../../entities/ArbitraryLoanPosition';
import { ensureAsset } from '../../entities/Asset';
import {
  BorrowableAmountUpdated,
  TotalBorrowedUpdated,
  TotalRepaidUpdated,
  LoanConfigured,
  LoanClosed,
} from '../../generated/contracts/ArbitraryLoanPositionLib4Events';

export function handleLoanConfigured(event: LoanConfigured): void {
  let arbitraryLoanPosition = useArbitraryLoanPosition(event.address.toHex());

  let asset = ensureAsset(event.params.loanAsset);

  arbitraryLoanPosition.borrower = event.params.borrower;
  arbitraryLoanPosition.loanAsset = asset.id;
  arbitraryLoanPosition.accountingModule = event.params.accountingModule;
  arbitraryLoanPosition.description = event.params.description.toString();

  // if there wasn't configuration event for the ArbitraryLoanFixedInterestModule or ArbitraryLoanTotalNominalDeltaOracleModule the moduleType will be null
  if (arbitraryLoanPosition.moduleType == null) {
    arbitraryLoanPosition.moduleType = 'None';
  }

  arbitraryLoanPosition.save();
}

export function handleLoanClosed(event: LoanClosed): void {
  let arbitraryLoanPosition = useArbitraryLoanPosition(event.address.toHex());

  arbitraryLoanPosition.isClosed = true;

  arbitraryLoanPosition.save();
}

export function handleBorrowableAmountUpdated(event: BorrowableAmountUpdated): void {
  let arbitraryLoanPosition = useArbitraryLoanPosition(event.address.toHex());

  if (arbitraryLoanPosition.loanAsset == null) {
    logCritical('Loan asset is null ArbitraryLoanPosition {}.', [event.address.toHex()]);

    return;
  }

  let loanAsset = ensureAsset(Address.fromString(arbitraryLoanPosition.loanAsset as string));

  arbitraryLoanPosition.borrowableAmount = toBigDecimal(event.params.borrowableAmount, loanAsset.decimals);
  arbitraryLoanPosition.save();
}

export function handleTotalBorrowedUpdated(event: TotalBorrowedUpdated): void {
  let arbitraryLoanPosition = useArbitraryLoanPosition(event.address.toHex());

  if (arbitraryLoanPosition.loanAsset == null) {
    logCritical('Loan asset is null ArbitraryLoanPosition {}.', [event.address.toHex()]);

    return;
  }

  let loanAsset = ensureAsset(Address.fromString(arbitraryLoanPosition.loanAsset as string));

  if (arbitraryLoanPosition.moduleType == 'FixedInterest') {
    let arbitraryLoanFixedInterestModule = useArbitraryLoanFixedInterestModule(
      getArbitraryLoanFixedInterestModuleId(
        event.address,
        Address.fromBytes(arbitraryLoanPosition.accountingModule as Bytes),
      ),
    );

    arbitraryLoanFixedInterestModule.totalInterestCachedTimestamp = event.block.timestamp.toI32();
    arbitraryLoanFixedInterestModule.save();
  }

  arbitraryLoanPosition.totalBorrowed = toBigDecimal(event.params.totalBorrowed, loanAsset.decimals);
  arbitraryLoanPosition.save();
}

export function handleTotalRepaidUpdated(event: TotalRepaidUpdated): void {
  let arbitraryLoanPosition = useArbitraryLoanPosition(event.address.toHex());

  if (arbitraryLoanPosition.loanAsset == null) {
    logCritical('Loan asset is null ArbitraryLoanPosition {}.', [event.address.toHex()]);

    return;
  }

  let loanAsset = ensureAsset(Address.fromString(arbitraryLoanPosition.loanAsset as string));

  arbitraryLoanPosition.totalRepaid = toBigDecimal(event.params.totalRepaid, loanAsset.decimals);
  arbitraryLoanPosition.save();
}
