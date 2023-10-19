import { logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { RequestAdded, RequestRemoved } from '../../generated/contracts/LidoWithdrawalsPositionLib4Events';
import { LidoWithdrawalsRequest } from '../../generated/schema';
import { useLidoWithdrawalsPosition } from '../../entities/LidoWithdrawalsPosition';

export function handleRequestAdded(event: RequestAdded): void {
  let request = new LidoWithdrawalsRequest(event.params.id.toString());
  request.amount = toBigDecimal(event.params.amount, 18);
  request.lidoWithdrawalsPosition = useLidoWithdrawalsPosition(event.address.toHex()).id;
  request.claimed = false;
  request.requestedTimestamp = event.block.timestamp.toI32();
  request.claimedTimestamp = 0;
  request.save();
}

export function handleRequestRemoved(event: RequestRemoved): void {
  let request = LidoWithdrawalsRequest.load(event.params.id.toString());

  if (request == null) {
    logCritical('Failed to load LidoWithdrawalsRequest {}.', [event.params.id.toString()]);
    return;
  }

  request.claimed = true;
  request.claimedTimestamp = event.block.timestamp.toI32();
  request.save();
}
