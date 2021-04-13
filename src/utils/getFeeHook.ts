export function getFeeHook(hook: number): string {
  if (hook == 0) {
    return 'Continuous';
  }

  if (hook == 1) {
    return 'BuySharesSetup';
  }

  if (hook == 2) {
    return 'PreBuyShares';
  }

  if (hook == 3) {
    return 'PostBuyShares';
  }

  if (hook == 4) {
    return 'BuySharesCompleted';
  }

  if (hook == 5) {
    return 'PreRedeemShares';
  }

  return 'Unknown';
}
