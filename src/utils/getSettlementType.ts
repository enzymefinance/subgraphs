export function getSettlementType(type: number): string {
  if (type == 0) {
    return 'None';
  }

  if (type == 1) {
    return 'Direct';
  }

  if (type == 2) {
    return 'Mint';
  }

  if (type == 3) {
    return 'Burn';
  }

  if (type == 4) {
    return 'MintSharesOutstanding';
  }

  if (type == 5) {
    return 'BurnSharesOutstanding';
  }

  return 'Unknown';
}
