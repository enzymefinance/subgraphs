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
    return 'MintSharesOutstanding';
  }

  if (type == 4) {
    return 'BurnSharesOutstanding';
  }

  return 'Settlement type not found';
}
