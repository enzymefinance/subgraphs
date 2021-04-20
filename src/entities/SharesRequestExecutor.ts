import { ethereum, store } from '@graphprotocol/graph-ts';
import { Account, SharesRequestExecutor, SharesRequestor } from '../generated/schema';

export function sharesRequestExecutorId(sharesRequestor: SharesRequestor, account: Account): string {
  return sharesRequestor.id + '/' + account.id;
}

export function createSharesRequestExecutor(
  sharesRequestor: SharesRequestor,
  account: Account,
  event: ethereum.Event,
): SharesRequestExecutor {
  let id = sharesRequestExecutorId(sharesRequestor, account);
  let executor = new SharesRequestExecutor(id);
  executor.since = event.block.timestamp;
  executor.account = account.id;
  executor.sharesRequestor = sharesRequestor.id;
  executor.save();

  return executor;
}

export function ensureSharesRequestExecutor(
  sharesRequestor: SharesRequestor,
  account: Account,
  event: ethereum.Event,
): SharesRequestExecutor {
  let id = sharesRequestExecutorId(sharesRequestor, account);
  let executor = SharesRequestExecutor.load(id) as SharesRequestExecutor;

  if (executor != null) {
    return executor;
  }

  return createSharesRequestExecutor(sharesRequestor, account, event);
}

export function deleteSharesRequestExecutor(sharesRequestor: SharesRequestor, account: Account): void {
  let id = sharesRequestExecutorId(sharesRequestor, account);

  store.remove('SharesRequestExecutor', id);
}
