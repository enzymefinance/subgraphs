import { logCritical, uniqueEventId, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, ethereum, BigDecimal, Bytes } from '@graphprotocol/graph-ts';
import {
  ArbitraryLoanPosition,
  ArbitraryLoanPositionChange,
  Vault,
  AssetAmount,
  ExternalPositionType,
  Asset,
} from '../generated/schema';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';

export function useArbitraryLoanPosition(id: string): ArbitraryLoanPosition {
  let arbitraryLoanPosition = ArbitraryLoanPosition.load(id);
  if (arbitraryLoanPosition == null) {
    logCritical('Failed to load ArbitraryLoanPosition {}.', [id]);
  }

  return arbitraryLoanPosition as ArbitraryLoanPosition;
}

export function createArbitraryLoanPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): ArbitraryLoanPosition {
  let arbitraryLoanPosition = new ArbitraryLoanPosition(externalPositionAddress.toHex());
  arbitraryLoanPosition.vault = useVault(vaultAddress.toHex()).id;
  arbitraryLoanPosition.active = true;
  arbitraryLoanPosition.type = type.id;
  arbitraryLoanPosition.loanAsset = null;
  arbitraryLoanPosition.borrower = null;
  arbitraryLoanPosition.accountingModule = null;
  arbitraryLoanPosition.description = '';
  arbitraryLoanPosition.moduleType = null;
  arbitraryLoanPosition.borrowableAmount = ZERO_BD;
  arbitraryLoanPosition.totalBorrowed = ZERO_BD;
  arbitraryLoanPosition.totalRepaid = ZERO_BD;
  arbitraryLoanPosition.isClosed = false;

  arbitraryLoanPosition.save();

  return arbitraryLoanPosition;
}

export function createArbitraryLoanPositionChange(
  arbitraryLoanPositionAddress: Address,
  assetAmounts: AssetAmount[] | null,
  assets: Asset[] | null,
  borrower: Address | null,
  accountingModule: Address | null,
  accountingModuleConfigData: Bytes | null,
  description: string | null,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): ArbitraryLoanPositionChange {
  let change = new ArbitraryLoanPositionChange(uniqueEventId(event));
  change.arbitraryLoanPositionChangeType = changeType;
  change.externalPosition = arbitraryLoanPositionAddress.toHex();
  change.assetAmounts = assetAmounts != null ? assetAmounts.map<string>((assetAmount) => assetAmount.id) : null;
  change.assets = assets != null ? assets.map<string>((asset) => asset.id) : null;
  change.borrower = borrower;
  change.accountingModule = accountingModule;
  change.accountingModuleConfigData = accountingModuleConfigData;
  change.description = description;
  change.vault = vault.id;
  change.timestamp = event.block.timestamp.toI32();
  change.activityCounter = getActivityCounter();
  change.activityCategories = ['Vault'];
  change.activityType = 'Trade';

  change.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();

  return change;
}
