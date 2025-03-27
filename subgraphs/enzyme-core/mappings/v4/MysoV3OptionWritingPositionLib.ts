import { createMysoV3Escrow, useMysoV3Escrow } from '../../entities/MysoV3OptionWritingPosition';
import { EscrowClosedAndSwept, EscrowCreated } from '../../generated/contracts/MysoV3OptionWritingPositionLib4Events';

export function handleEscrowCreated(event: EscrowCreated): void {
  let escrow = createMysoV3Escrow(event.params.escrowIdx);

  escrow.createdAt = event.block.timestamp.toI32();
  escrow.closed = false;
  escrow.mysoV3OptionWritingPosition = event.address.toHex();

  escrow.save();
}

export function handleEscrowClosedAndSwept(event: EscrowClosedAndSwept): void {
  let mysoV3Escrow = useMysoV3Escrow(event.params.escrowIdx);

  mysoV3Escrow.closed = true;
  mysoV3Escrow.closedAt = event.block.timestamp.toI32();

  mysoV3Escrow.save();
}
