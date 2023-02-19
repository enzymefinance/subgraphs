import { logCritical, toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  AssetAmount,
  NotionalV2Position,
  NotionalV2PositionChange,
  ExternalPositionType,
  Vault,
  Asset,
} from '../generated/schema';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import { useVault } from './Vault';
import { getActivityCounter } from './Counter';
import { ensureAsset } from './Asset';
import { createAssetAmount } from './AssetAmount';

export function useNotionalV2Position(id: string): NotionalV2Position {
  let nv2p = NotionalV2Position.load(id);
  if (nv2p == null) {
    logCritical('Failed to load NotionalV2Position {}.', [id]);
  }

  return nv2p as NotionalV2Position;
}

export function createNotionalV2Position(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): NotionalV2Position {
  let notionalV2Position = new NotionalV2Position(externalPositionAddress.toHex());
  notionalV2Position.vault = useVault(vaultAddress.toHex()).id;
  notionalV2Position.active = true;
  notionalV2Position.type = type.id;
  notionalV2Position.lendAssets = null;
  notionalV2Position.borrowedAssets = null;
  notionalV2Position.save();

  return notionalV2Position;
}

export function createNotionalV2PositionChange(
  notionalV2PositionAddress: Address,
  changeType: string,
  incomingAsset: Asset | null,
  incomingAssetAmount: AssetAmount | null,
  outgoingAsset: Asset | null,
  outgoingAssetAmount: AssetAmount | null,
  fCashAmount: string | null,
  maturity: string | null,
  vault: Vault,
  event: ethereum.Event,
): NotionalV2PositionChange {
  let change = new NotionalV2PositionChange(uniqueEventId(event));
  change.externalPosition = notionalV2PositionAddress.toHex();
  change.notionalV2PositionChangeType = changeType;
  change.incomingAsset = incomingAsset != null ? incomingAsset.id : null;
  change.incomingAssetAmount = incomingAssetAmount != null ? incomingAssetAmount : null;
  change.outgoingAsset = outgoingAsset != null ? outgoingAsset.id : null;
  change.outgoingAssetAmount = outgoingAssetAmount != null ? outgoingAssetAmount : null;
  change.fCashAmount = fCashAmount != null ? fCashAmount : null;
  change.maturity = maturity != null ? maturity : null;
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

export function trackNotionalV2Position(id: string, denominationAsset: Asset, event: ethereum.Event): void {
  let nv2pContract = ProtocolSdk.bind(Address.fromString(id));

  let nv2p = useNotionalV2Position(id);

  let lendAssets = nv2pContract.getManagedAssets();

  if (lendAssets.value0.length === 0) {
    nv2p.lendAssets = null;
  } else {
    let addresses = lendAssets.value0;
    let amounts = lendAssets.value1;
    let assetAmounts: AssetAmount[] = new Array<AssetAmount>();

    for (let i = 0; i < addresses.length; i++) {
      let asset = ensureAsset(addresses[i]);
      let amount = toBigDecimal(amounts[i], asset.decimals);
      let assetAmount = createAssetAmount(asset, amount, denominationAsset, 'nv2p', event);
      assetAmounts = assetAmounts.concat([assetAmount]);
    }

    nv2p.lendAssets = assetAmounts;
  }

  let borrowedAssets = nv2pContract.getDebtAssets();

  if (borrowedAssets.value0.length === 0) {
    nv2p.borrowedAssets = null;
  } else {
    let addresses = borrowedAssets.value0;
    let amounts = borrowedAssets.value1;
    let assetAmounts: AssetAmount[] = new Array<AssetAmount>();

    for (let i = 0; i < addresses.length; i++) {
      let asset = ensureAsset(addresses[i]);
      let amount = toBigDecimal(amounts[i], asset.decimals);
      let assetAmount = createAssetAmount(asset, amount, denominationAsset, 'nv2p', event);
      assetAmounts = assetAmounts.concat([assetAmount]);
    }

    nv2p.borrowedAssets = assetAmounts;
  }

  nv2p.save();
}
