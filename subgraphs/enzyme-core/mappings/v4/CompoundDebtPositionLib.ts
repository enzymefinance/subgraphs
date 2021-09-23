import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, dataSource } from '@graphprotocol/graph-ts';
import { ensureAsset } from '../../entities/Asset';
import { createCompoundDebtPositionChange } from '../../entities/CompoundDebtPosition';
import { ensureComptroller } from '../../entities/Comptroller';
import { useVault } from '../../entities/Vault';
import {
  AssetBorrowed,
  BorrowedAssetRepaid,
  CollateralAssetAdded,
  CollateralAssetRemoved,
} from '../../generated/contracts/CompoundDebtPositionLib4Events';

export function handleAssetBorrowed(event: AssetBorrowed): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let comptroller = ensureComptroller(Address.fromString(vault.comptroller), event);
  let asset = ensureAsset(event.params.asset);
  let amount = toBigDecimal(event.params.amount, asset.decimals);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  createCompoundDebtPositionChange(event.address, asset, amount, denominationAsset, 'AssetBorrowed', event);
}

export function handleBorrowedAssetRepaid(event: BorrowedAssetRepaid): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let comptroller = ensureComptroller(Address.fromString(vault.comptroller), event);
  let asset = ensureAsset(event.params.asset);
  let amount = toBigDecimal(event.params.amount, asset.decimals);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  createCompoundDebtPositionChange(event.address, asset, amount, denominationAsset, 'BorrowedAssetRepaid', event);
}

export function handleCollateralAssetAdded(event: CollateralAssetAdded): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let comptroller = ensureComptroller(Address.fromString(vault.comptroller), event);
  let asset = ensureAsset(event.params.asset);
  let amount = toBigDecimal(event.params.amount, asset.decimals);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  createCompoundDebtPositionChange(event.address, asset, amount, denominationAsset, 'CollateralAssetAdded', event);
}

export function handleCollateralAssetRemoved(event: CollateralAssetRemoved): void {
  let vault = useVault(dataSource.context().getString('vaultProxy'));
  let comptroller = ensureComptroller(Address.fromString(vault.comptroller), event);
  let asset = ensureAsset(event.params.asset);
  let amount = toBigDecimal(event.params.amount, asset.decimals);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  createCompoundDebtPositionChange(event.address, asset, amount, denominationAsset, 'CollateralAssetRemoved', event);
}
