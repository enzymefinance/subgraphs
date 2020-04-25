export function arrayUnique<T>(array: T[]): T[] {
  let unique: T[] = [];
  for (let i: i32 = 0; i < array.length; i++) {
    if (array.indexOf(array[i]) == i) {
      unique.push(array[i]);
    }
  }

  return unique;
}
