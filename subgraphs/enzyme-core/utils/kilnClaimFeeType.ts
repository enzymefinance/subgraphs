export function kilnClaimFeeType(type: number): string {
  if (type == 0) {
    return 'ExecutionLayer';
  }

  if (type == 1) {
    return 'ConsensusLayer';
  }

  if (type == 2) {
    return 'All';
  }

  return 'Unknown';
}
