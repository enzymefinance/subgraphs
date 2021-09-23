import { logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { release2Addresses, release3Addresses, release4Addresses } from '../generated/addresses';
import { ComptrollerLib2Contract } from '../generated/ComptrollerLib2Contract';
import { ComptrollerLib3Contract } from '../generated/ComptrollerLib3Contract';
import { ComptrollerLib4Contract } from '../generated/ComptrollerLib4Contract';
import { ERC20Contract } from '../generated/ERC20Contract';
import { FundActionsWrapper2Contract } from '../generated/FundActionsWrapper2Contract';
import { FundActionsWrapper3Contract } from '../generated/FundActionsWrapper3Contract';
import { MetricCounter, VaultMetric } from '../generated/schema';
import { UnpermissionedActionsWrapper4Contract } from '../generated/UnpermissionedActionsWrapper4Contract';
import { ensureAsset } from './Asset';
import { ensureComptroller } from './Comptroller';
import { useVault } from './Vault';

export function getVaultMetricCounter(): i32 {
  let counter = MetricCounter.load('metricId');

  if (counter == null) {
    counter = new MetricCounter('metricId');
    counter.vaultMetricCounter = 1;
    counter.depositMetricCounter = 0;
    counter.save();

    return counter.vaultMetricCounter;
  }

  counter.vaultMetricCounter = counter.vaultMetricCounter + 1;
  counter.save();

  return counter.vaultMetricCounter;
}

export function trackVaultMetric(vaultAddress: Address, event: ethereum.Event): void {
  let id = vaultAddress.toHex() + '/' + event.block.number.toString();

  let metric = VaultMetric.load(id);

  if (metric != null) {
    return;
  }

  let quantities = getVaultQuantities(vaultAddress, event);

  metric = new VaultMetric(id);
  metric.counter = getVaultMetricCounter();
  metric.timestamp = event.block.timestamp.toI32();
  metric.vault = vaultAddress;
  metric.gav = quantities.gav;
  metric.gavReverted = quantities.gavReverted;
  metric.nav = quantities.nav;
  metric.navReverted = quantities.navReverted;
  metric.totalSupply = quantities.totalSupply;
  metric.sharePrice = quantities.sharePrice;
  metric.denominationAsset = quantities.denominationAsset;
  metric.save();
}

export class VaultQuantities {
  gav: BigDecimal;
  gavReverted: boolean;
  nav: BigDecimal;
  navReverted: boolean;
  totalSupply: BigDecimal;
  sharePrice: BigDecimal;
  denominationAsset: Address;
}

export function getVaultQuantities(vaultAddress: Address, event: ethereum.Event): VaultQuantities {
  let vaultContract = ERC20Contract.bind(vaultAddress);

  let totalSupplyCall = vaultContract.try_totalSupply();
  if (totalSupplyCall.reverted) {
    logCritical('totalSupply() reverted for vault{}', [vaultAddress.toHex()]);
  }

  let totalSupply = toBigDecimal(totalSupplyCall.value);

  let vault = useVault(vaultAddress.toHex());
  vault.totalSupply = totalSupply;
  vault.save();

  let releaseId = vault.release;
  let comptroller = ensureComptroller(Address.fromString(vault.comptroller), event);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  let quantities: VaultQuantities = {
    gav: BigDecimal.fromString('0'),
    gavReverted: false,
    nav: BigDecimal.fromString('0'),
    navReverted: false,
    totalSupply: totalSupply,
    sharePrice: BigDecimal.fromString('0'),
    denominationAsset: Address.fromString(denominationAsset.id),
  };

  // release 2
  if (releaseId == release2Addresses.fundDeployerAddress.toHex()) {
    let comptrollerContract = ComptrollerLib2Contract.bind(Address.fromString(comptroller.id));
    let gavCall = comptrollerContract.try_calcGav(false);

    if (!gavCall.reverted && gavCall.value.value1) {
      quantities.gav = toBigDecimal(gavCall.value.value0, denominationAsset.decimals);
    } else {
      quantities.gavReverted = true;
    }

    let fundActionsWrapper = FundActionsWrapper2Contract.bind(release2Addresses.fundActionsWrapperAddress);
    let netSharePriceCall = fundActionsWrapper.try_calcNetShareValueForFund(Address.fromString(comptroller.id));
    if (!netSharePriceCall.reverted && netSharePriceCall.value.value1) {
      quantities.sharePrice = toBigDecimal(netSharePriceCall.value.value0, 18);
    }
    if (!netSharePriceCall.reverted && netSharePriceCall.value.value1) {
      quantities.nav = quantities.sharePrice.times(totalSupply);
    } else {
      quantities.navReverted = true;
    }

    return quantities;
  }

  // release 3
  if (releaseId == release3Addresses.fundDeployerAddress.toHex()) {
    let comptrollerContract = ComptrollerLib3Contract.bind(Address.fromString(comptroller.id));
    let gavCall = comptrollerContract.try_calcGav(false);

    if (!gavCall.reverted && gavCall.value.value1) {
      quantities.gav = toBigDecimal(gavCall.value.value0, denominationAsset.decimals);
    } else {
      quantities.gavReverted = true;
    }

    let fundActionsWrapper = FundActionsWrapper3Contract.bind(release3Addresses.fundActionsWrapperAddress);
    let netSharePriceCall = fundActionsWrapper.try_calcNetShareValueForFund(Address.fromString(comptroller.id));

    if (!netSharePriceCall.reverted && netSharePriceCall.value.value1) {
      quantities.sharePrice = toBigDecimal(netSharePriceCall.value.value0, 18);
    }

    if (!netSharePriceCall.reverted && netSharePriceCall.value.value1) {
      quantities.nav = quantities.sharePrice.times(totalSupply);
    } else {
      quantities.navReverted = true;
    }

    return quantities;
  }

  // release 4
  if (releaseId == release4Addresses.fundDeployerAddress.toHex()) {
    let comptrollerContract = ComptrollerLib4Contract.bind(Address.fromString(comptroller.id));
    let gavCall = comptrollerContract.try_calcGav(false);

    if (!gavCall.reverted) {
      quantities.gav = toBigDecimal(gavCall.value, denominationAsset.decimals);
    } else {
      quantities.gavReverted = true;
    }

    let fundActionsWrapper = UnpermissionedActionsWrapper4Contract.bind(
      release4Addresses.unpermissionedActionsWrapperAddress,
    );
    let netSharePriceCall = fundActionsWrapper.try_calcNetShareValueForFund(Address.fromString(comptroller.id));

    if (!netSharePriceCall.reverted) {
      quantities.sharePrice = toBigDecimal(netSharePriceCall.value, 18);
      quantities.nav = quantities.sharePrice.times(totalSupply);
    } else {
      quantities.navReverted = true;
    }

    return quantities;
  }

  return quantities;
}
