import {
  RequestCanceled,
  RequestCreated,
  RequestExecuted,
  RequestExecutorAdded,
  RequestExecutorRemoved,
} from '../generated/AuthUserExecutedSharesRequestorLibContract';

export function handleRequestCanceled(event: RequestCanceled): void {}
export function handleRequestCreated(event: RequestCreated): void {}
export function handleRequestExecuted(event: RequestExecuted): void {}
export function handleRequestExecutorAdded(event: RequestExecutorAdded): void {}
export function handleRequestExecutorRemoved(event: RequestExecutorRemoved): void {}
