import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { release2Addresses, release3Addresses, release4Addresses } from '../generated/addresses';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import { Asset, Comptroller, Vault, VaultMetric } from '../generated/schema';
import { tokenTotalSupplyOrThrow } from '../utils/tokenCalls';
import { ensureAsset } from './Asset';
import { ensureComptroller } from './Comptroller';
import { getVaultMetricCounter } from './Counter';
import { useVault } from './Vault';

export function trackVaultMetric(vaultAddress: Address, event: ethereum.Event): void {
  let id = vaultAddress.toHex() + '/' + event.block.number.toString();
  let metric = VaultMetric.load(id);

  if (metric != null) {
    return;
  }

  let vault = useVault(vaultAddress.toHex());
  let comptroller = ensureComptroller(Address.fromString(vault.comptroller), event);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  let quantities = getVaultQuantities(vault, comptroller, denominationAsset, event);

  metric = new VaultMetric(id);
  metric.counter = getVaultMetricCounter();
  metric.timestamp = event.block.timestamp.toI32();
  metric.blockNumber = event.block.number.toI32();

  metric.vault = vaultAddress;
  metric.comptroller = Address.fromString(vault.comptroller);
  metric.release = Address.fromString(vault.release);

  metric.denominationAsset = Address.fromString(denominationAsset.id);
  metric.denominationAssetDecimals = denominationAsset.decimals;

  metric.totalSupply = quantities.totalSupply;
  metric.totalSupplyResolver = quantities.totalSupplyResolver;

  metric.grossShareValue = quantities.grossShareValue;
  metric.grossShareValueResolver = quantities.grossShareValueResolver;
  metric.grossShareValueReverted = quantities.grossShareValueReverted;

  metric.netShareValue = quantities.netShareValue;
  metric.netShareValueResolver = quantities.netShareValueResolver;
  metric.netShareValueReverted = quantities.netShareValueReverted;

  metric.netAssetValue = quantities.netAssetValue;
  metric.netAssetValueCalculatable = quantities.netAssetValueCalculatable;

  metric.grossAssetValue = quantities.grossAssetValue;
  metric.grossAssetValueCalculatable = quantities.grossAssetValueCalculatable;
  metric.save();
}

export class VaultQuantities {
  totalSupply: BigDecimal;
  totalSupplyResolver: string;
  grossShareValue: BigDecimal;
  grossShareValueResolver: string;
  grossShareValueReverted: boolean;
  netShareValue: BigDecimal;
  netShareValueResolver: string;
  netShareValueReverted: boolean;
  netAssetValue: BigDecimal;
  netAssetValueCalculatable: boolean;
  grossAssetValue: BigDecimal;
  grossAssetValueCalculatable: boolean;
}

export function getVaultQuantities(
  vault: Vault,
  comptroller: Comptroller,
  denominationAsset: Asset,
  event: ethereum.Event,
): VaultQuantities {
  let totalSupply = toBigDecimal(tokenTotalSupplyOrThrow(Address.fromString(vault.id)));
  vault.totalSupply = totalSupply;
  vault.save();

  let releaseId = vault.release;

  let quantities: VaultQuantities = {
    totalSupply: totalSupply,
    totalSupplyResolver: '2.0',
    grossShareValue: BigDecimal.fromString('0'),
    grossShareValueResolver: '',
    grossShareValueReverted: true,
    netShareValue: BigDecimal.fromString('0'),
    netShareValueResolver: '',
    netShareValueReverted: true,
    netAssetValue: BigDecimal.fromString('0'),
    netAssetValueCalculatable: false,
    grossAssetValue: BigDecimal.fromString('0'),
    grossAssetValueCalculatable: false,
  };

  // release 2
  if (releaseId == release2Addresses.fundDeployerAddress.toHex()) {
    let fundActionsWrapperContract = ProtocolSdk.bind(release2Addresses.fundActionsWrapperAddress);
    let netShareValueCall = fundActionsWrapperContract.try_calcNetShareValueForFund(Address.fromString(comptroller.id));

    if (!netShareValueCall.reverted && netShareValueCall.value.value1) {
      quantities.netShareValue = toBigDecimal(netShareValueCall.value.value0, 18);
      quantities.netShareValueReverted = false;
      quantities.netShareValueResolver = '2.0';

      quantities.netAssetValue = quantities.netShareValue.times(totalSupply);
      quantities.netAssetValueCalculatable = true;
    }

    let comptrollerContract = ProtocolSdk.bind(Address.fromString(comptroller.id));
    let grossShareValueCall = comptrollerContract.try_calcGrossShareValue(false);

    if (!grossShareValueCall.reverted && grossShareValueCall.value.value1) {
      quantities.grossShareValue = toBigDecimal(grossShareValueCall.value.value0, 18);
      quantities.grossShareValueReverted = false;
      quantities.grossShareValueResolver = '2.0';

      quantities.grossAssetValue = quantities.grossShareValue.times(totalSupply);
      quantities.grossAssetValueCalculatable = true;
    }

    return quantities;
  }

  // release 3
  if (releaseId == release3Addresses.fundDeployerAddress.toHex()) {
    let fundActionsWrapperContract = ProtocolSdk.bind(release3Addresses.fundActionsWrapperAddress);
    let netShareValueCall = fundActionsWrapperContract.try_calcNetShareValueForFund(Address.fromString(comptroller.id));

    if (!netShareValueCall.reverted && netShareValueCall.value.value1) {
      quantities.netShareValue = toBigDecimal(netShareValueCall.value.value0, 18);
      quantities.netShareValueReverted = false;
      quantities.netShareValueResolver = '3.0';

      quantities.netAssetValue = quantities.netShareValue.times(totalSupply);
      quantities.netAssetValueCalculatable = true;
    }

    let comptrollerContract = ProtocolSdk.bind(Address.fromString(comptroller.id));
    let grossShareValueCall = comptrollerContract.try_calcGrossShareValue(false);

    if (!grossShareValueCall.reverted && grossShareValueCall.value.value1) {
      quantities.grossShareValue = toBigDecimal(grossShareValueCall.value.value0, 18);
      quantities.grossShareValueReverted = false;
      quantities.grossShareValueResolver = '3.0';

      quantities.grossAssetValue = quantities.grossShareValue.times(totalSupply);
      quantities.grossAssetValueCalculatable = true;
    }

    return quantities;
  }

  // release 4
  if (releaseId == release4Addresses.fundDeployerAddress.toHex()) {
    let fundActionsWrapperContract = ProtocolSdk.bind(release3Addresses.fundActionsWrapperAddress);
    let netShareValueCall = fundActionsWrapperContract.try_calcNetShareValueForFund1(
      Address.fromString(comptroller.id),
    );

    if (!netShareValueCall.reverted) {
      quantities.netShareValue = toBigDecimal(netShareValueCall.value, 18);
      quantities.netShareValueReverted = false;
      quantities.netShareValueResolver = '4.0';

      quantities.netAssetValue = quantities.netShareValue.times(totalSupply);
      quantities.netAssetValueCalculatable = true;
    }

    let comptrollerContract = ProtocolSdk.bind(Address.fromString(comptroller.id));
    let grossShareValueCall = comptrollerContract.try_calcGrossShareValue1(false);

    if (!grossShareValueCall.reverted) {
      quantities.grossShareValue = toBigDecimal(grossShareValueCall.value, 18);
      quantities.grossShareValueReverted = false;
      quantities.grossShareValueResolver = '4.0';

      quantities.grossAssetValue = quantities.grossShareValue.times(totalSupply);
      quantities.grossAssetValueCalculatable = true;
    }

    return quantities;
  }

  return quantities;
}
