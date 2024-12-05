import { logCritical, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { RequestAdded, RequestRemoved } from '../../generated/contracts/StaderWithdrawalsPositionLib4Events';
import { StaderWithdrawalsRequest } from '../../generated/schema';
import { useStaderWithdrawalsPosition } from '../../entities/StaderWithdrawalsPosition';

export function handleRequestAdded(event: RequestAdded): void {
  let externalPosition = useStaderWithdrawalsPosition(event.address.toHex());

  let request = new StaderWithdrawalsRequest(event.params.id.toString());
  request.amount = toBigDecimal(event.params.amount, 18);
  request.staderWithdrawalsPosition = externalPosition.id;
  request.vault = externalPosition.vault;
  request.claimed = false;
  request.requestedTimestamp = event.block.timestamp.toI32();
  request.claimedTimestamp = 0;
  request.save();
}

export function handleRequestRemoved(event: RequestRemoved): void {
  let request = StaderWithdrawalsRequest.load(event.params.id.toString());

  if (request == null) {
    logCritical('Failed to load StaderWithdrawalsRequest {}.', [event.params.id.toString()]);
    return;
  }

  request.claimed = true;
  request.claimedTimestamp = event.block.timestamp.toI32();
  request.save();
}
