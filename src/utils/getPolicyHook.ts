export function getPolicyHook(hook: number): string {
  if (hook == 0) {
    return 'PreBuyShares';
  }

  if (hook == 1) {
    return 'PostBuyShares';
  }

  if (hook == 2) {
    return 'PreCallOnIntegration';
  }

  if (hook == 3) {
    return 'PostCallOnIntegration';
  }

  return 'PolicyHook not found';
}
