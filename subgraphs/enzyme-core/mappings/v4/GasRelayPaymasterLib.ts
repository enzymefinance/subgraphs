import { toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, dataSource } from '@graphprotocol/graph-ts';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import { ensureComptroller } from '../../entities/Comptroller';
import { getActivityCounter } from '../../entities/Counter';
import { ensureGasRelayer, trackGasRelayerBalance } from '../../entities/GasRelayer';
import { useVault } from '../../entities/Vault';
import { wethTokenAddress, wrappedNativeTokenAddress } from '../../generated/addresses';
import { Deposited, TransactionRelayed, Withdrawn } from '../../generated/contracts/GasRelayPaymasterLib4Events';
import { GasRelayerDeposited, GasRelayerTransaction, GasRelayerWithdrawn } from '../../generated/schema';

export function handleDeposited(event: Deposited): void {
  let gasRelayer = ensureGasRelayer(event.address);
  let comptrollerProxyAddress = Address.fromString(dataSource.context().getString('comptrollerProxy'));

  let comptroller = ensureComptroller(comptrollerProxyAddress, event);
  if (comptroller.vault == null) {
    return;
  }

  let vault = useVault(comptroller.vault as string);
  let wrappedNativeToken = ensureAsset(wrappedNativeTokenAddress);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));
  let assetAmount = createAssetAmount(
    wrappedNativeToken,
    toBigDecimal(event.params.amount, wrappedNativeToken.decimals),
    denominationAsset,
    'gr',
    event,
  );

  let deposited = new GasRelayerDeposited(uniqueEventId(event));
  deposited.vault = vault.id;
  deposited.timestamp = event.block.timestamp.toI32();
  deposited.gasRelayer = gasRelayer.id;
  deposited.gasRelayerAssetAmount = assetAmount.id;
  deposited.activityCounter = getActivityCounter();
  deposited.activityCategories = ['Vault'];
  deposited.activityType = 'VaultSettings';
  deposited.save();

  trackGasRelayerBalance(event.address);
}

export function handleTransactionRelayed(event: TransactionRelayed): void {
  let gasRelayer = ensureGasRelayer(event.address);

  let transaction = new GasRelayerTransaction(uniqueEventId(event));
  transaction.gasRelayer = gasRelayer.id;
  transaction.authorizer = event.params.authorizer;
  transaction.invokedSelector = event.params.invokedSelector.toHexString();
  transaction.successful = event.params.successful;
  transaction.save();

  trackGasRelayerBalance(event.address);
}

export function handleWithdrawn(event: Withdrawn): void {
  let gasRelayer = ensureGasRelayer(event.address);
  let comptrollerProxyAddress = Address.fromString(dataSource.context().getString('comptrollerProxy'));

  let comptroller = ensureComptroller(comptrollerProxyAddress, event);
  if (comptroller.vault == null) {
    return;
  }

  let vault = useVault(comptroller.vault as string);
  let wrappedNativeToken = ensureAsset(wrappedNativeTokenAddress);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));
  let assetAmount = createAssetAmount(
    wrappedNativeToken,
    toBigDecimal(event.params.amount, wrappedNativeToken.decimals),
    denominationAsset,
    'gr',
    event,
  );

  let withdrawn = new GasRelayerWithdrawn(uniqueEventId(event));
  withdrawn.vault = vault.id;
  withdrawn.timestamp = event.block.timestamp.toI32();
  withdrawn.gasRelayer = gasRelayer.id;
  withdrawn.gasRelayerAssetAmount = assetAmount.id;
  withdrawn.activityCounter = getActivityCounter();
  withdrawn.activityCategories = ['Vault'];
  withdrawn.activityType = 'VaultSettings';
  withdrawn.save();

  trackGasRelayerBalance(event.address);
}
