import { Fund, SharesRequestor } from '../generated/schema';

export function createSharesRequestor(id: string, fund: Fund): SharesRequestor {
  let requestor = new SharesRequestor(id);
  requestor.fund = fund.id;
  requestor.save();

  return requestor;
}

export function ensureSharesRequestor(id: string, fund: Fund): SharesRequestor {
  let requestor = SharesRequestor.load(id) as SharesRequestor;

  if (requestor != null) {
    return requestor;
  }

  return createSharesRequestor(id, fund);
}
