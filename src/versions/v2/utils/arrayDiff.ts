export function arrayDiff<T>(a: T[], b: T[]): T[] {
  let diff: T[] = [];
  for (let i: i32 = 0; i < a.length; i++) {
    if (b.indexOf(a[i]) == -1) {
      diff.push(a[i]);
    }
  }

  return diff;
}
