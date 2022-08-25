export function uintListUpdateType(type: number): string {
  if (type == 0) {
    return 'None';
  }

  if (type == 1) {
    return 'AddOnly';
  }

  if (type == 2) {
    return 'RemoveOnly';
  }

  if (type == 3) {
    return 'AddAndRemove';
  }

  return 'Unknown';
}
