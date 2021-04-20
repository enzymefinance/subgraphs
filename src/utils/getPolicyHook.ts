export function getPolicyHook(hook: number): string {
  if (hook == 0) {
    return 'BuySharesSetup';
  }

  if (hook == 1) {
    return 'PreBuyShares';
  }

  if (hook == 2) {
    return 'PostBuyShares';
  }

  if (hook == 3) {
    return 'BuySharesCompleted';
  }

  if (hook == 4) {
    return 'PreCallOnIntegration';
  }

  if (hook == 5) {
    return 'PostCallOnIntegration';
  }

  return 'Unknown';
}
