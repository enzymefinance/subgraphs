import { toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureAccount } from '../entities/Account';
import { sharesSplitterUserPercentageId } from '../entities/SharesSplitter';
import { SplitPercentageSet, TokenClaimed } from '../generated/contracts/SharesSplitterLibEvents';
import { SharesSplitterUserPercentage, SharesSplitterTokenClaims } from '../generated/schema';
import { tokenDecimals } from '../utils/tokenCalls';

export function handleSplitPercentageSet(event: SplitPercentageSet): void {
  let address = event.address;
  let percentage = event.params.percentage;
  let user = event.params.user;

  let userPercentage = new SharesSplitterUserPercentage(sharesSplitterUserPercentageId(address, user));
  userPercentage.user = ensureAccount(user, event).id;
  userPercentage.percentage = toBigDecimal(percentage, 4);
  userPercentage.sharesSplitter = address.toHex();
  userPercentage.save();
}

export function handleTokenClaimed(event: TokenClaimed): void {
  let address = event.address;
  let user = event.params.user;
  let token = event.params.token;
  let amount = event.params.amount;

  let decimals = tokenDecimals(token);

  let tokenClaim = new SharesSplitterTokenClaims(uniqueEventId(event));
  tokenClaim.user = ensureAccount(user, event).id;
  tokenClaim.token = token;
  tokenClaim.amount = toBigDecimal(amount, decimals);
  tokenClaim.sharesSplitter = address.toHex();
  tokenClaim.save();
}
