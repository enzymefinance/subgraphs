import { Address, BigInt } from '@graphprotocol/graph-ts';
import { OrderIdAdded, OrderIdRemoved } from '../../generated/contracts/AlicePositionLib4Events';
import { AliceOrder } from '../../generated/schema';
import { useAlicePosition } from '../../entities/AlicePosition';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import { logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { useVault } from '../../entities/Vault';
import { ensureComptroller } from '../../entities/Comptroller';

function orderId(externalPosition: Address, orderId: BigInt): string {
  return externalPosition.toHex() + '/' + orderId.toString();
}

export function handleOrderIdAdded(event: OrderIdAdded): void {
  let id = orderId(event.address, event.params.orderId);
  let position = useAlicePosition(event.address.toHex());
  let vault = useVault(position.vault);
  let comptroller = ensureComptroller(Address.fromString(vault.comptroller), event);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  let outgoingAsset = ensureAsset(event.params.orderDetails.outgoingAssetAddress);
  let outgoingAssetAmount = createAssetAmount(
    outgoingAsset,
    toBigDecimal(event.params.orderDetails.outgoingAmount, outgoingAsset.decimals),
    denominationAsset,
    'alice-order-added',
    event,
  );

  let incomingAsset = ensureAsset(event.params.orderDetails.incomingAssetAddress);

  let order = new AliceOrder(id);
  order.orderID = event.params.orderId;
  order.alicePosition = position.id;
  order.outgoingAssetAmount = outgoingAssetAmount.id;
  order.incomingAsset = incomingAsset.id;
  order.removed = false;
  order.save();
}
export function handleOrderIdRemoved(event: OrderIdRemoved): void {
  let id = orderId(event.address, event.params.orderId);

  let order = AliceOrder.load(id);

  if (order == null) {
    logCritical('Alice order {} for external position {} not found!', [
      event.params.orderId.toString(),
      event.address.toHex(),
    ]);
    return;
  }

  order.removed = true;
  order.save();
}
