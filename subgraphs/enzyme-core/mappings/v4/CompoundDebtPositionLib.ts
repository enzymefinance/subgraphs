import { createCompoundDebtPositionChange } from '../../entities/CompoundDebtPosition';
import {
  AssetBorrowed,
  BorrowedAssetRepaid,
  CollateralAssetAdded,
  CollateralAssetRemoved,
} from '../../generated/CompoundDebtPositionLib4Contract';

export function handleAssetBorrowed(event: AssetBorrowed): void {
  createCompoundDebtPositionChange(event.address, event.params.asset, event.params.amount, 'AssetBorrowed', event);
}

export function handleBorrowedAssetRepaid(event: BorrowedAssetRepaid): void {
  createCompoundDebtPositionChange(
    event.address,
    event.params.asset,
    event.params.amount,
    'BorrowedAssetRepaid',
    event,
  );
}

export function handleCollateralAssetAdded(event: CollateralAssetAdded): void {
  createCompoundDebtPositionChange(
    event.address,
    event.params.asset,
    event.params.amount,
    'CollateralAssetAdded',
    event,
  );
}

export function handleCollateralAssetRemoved(event: CollateralAssetRemoved): void {
  createCompoundDebtPositionChange(
    event.address,
    event.params.asset,
    event.params.amount,
    'CollateralAssetRemoved',
    event,
  );
}
