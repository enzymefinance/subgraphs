import { Account, Fund } from '../generated/schema';

export function sharesRequestId(fund: Fund, account: Account): string {
  return fund.id + '/' + account.id;
}
