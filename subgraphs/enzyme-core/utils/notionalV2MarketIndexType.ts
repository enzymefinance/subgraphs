export function notionalV2MarketIndexType(type: number): string {
  if (type == 1) {
    return '3 month';
  }

  if (type == 2) {
    return '6 month';
  }

  if (type == 3) {
    return '1 year';
  }

  if (type == 4) {
    return '2 year';
  }

  if (type == 5) {
    return '5 year';
  }

  if (type == 6) {
    return '10 year';
  }

  if (type == 7) {
    return '20 year';
  }

  return 'Unknown';
}
