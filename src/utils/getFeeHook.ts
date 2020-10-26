export function getFeeHook(hook: number): string {
  if (hook == 0) {
    return 'Continuous';
  }

  if (hook == 1) {
    return 'PreBuyShares';
  }

  if (hook == 2) {
    return 'PostBuyShares';
  }

  if (hook == 3) {
    return 'PreRedeemShares';
  }

  return 'FeeHook not found';
}
