export function rateAsset(asset: number): string {
  if (asset == 1) {
    return 'USD';
  }

  return 'ETH';
}
