import { Address } from '@graphprotocol/graph-ts';
import { OrderIdAdded, OrderIdRemoved } from '../../generated/contracts/AlicePositionLib4Events';
import { AliceOrder } from '../../generated/schema';
import { useAliceOrder, useAlicePosition } from '../../entities/AlicePosition';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import { toBigDecimal, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { useVault } from '../../entities/Vault';
import { ensureComptroller } from '../../entities/Comptroller';
import { wethTokenAddress } from '../../generated/addresses';

export function handleOrderIdAdded(event: OrderIdAdded): void {
  let position = useAlicePosition(event.address.toHex());
  let vault = useVault(position.vault);
  let comptroller = ensureComptroller(Address.fromString(vault.comptroller), event);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  let outgoingAssetAddress = event.params.orderDetails.outgoingAssetAddress.equals(ZERO_ADDRESS) ? wethTokenAddress : event.params.orderDetails.outgoingAssetAddress;
  let outgoingAsset = ensureAsset(outgoingAssetAddress);
  let outgoingAssetAmount = createAssetAmount(
    outgoingAsset,
    toBigDecimal(event.params.orderDetails.outgoingAmount, outgoingAsset.decimals),
    denominationAsset,
    'alice-order-added',
    event,
  );

  let incomingAssetAddress = event.params.orderDetails.incomingAssetAddress.equals(ZERO_ADDRESS) ? wethTokenAddress : event.params.orderDetails.incomingAssetAddress;
  let incomingAsset = ensureAsset(incomingAssetAddress);

  let order = new AliceOrder(event.params.orderId.toString());
  order.createdAt = event.block.timestamp.toI32();
  order.alicePosition = position.id;
  order.outgoingAssetAmount = outgoingAssetAmount.id;
  order.incomingAsset = incomingAsset.id;
  order.removed = false;
  order.save();
}

export function handleOrderIdRemoved(event: OrderIdRemoved): void {
  let order = useAliceOrder(event.params.orderId.toString());

  order.removed = true;
  order.save();
}
