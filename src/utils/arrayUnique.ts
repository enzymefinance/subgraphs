export function arrayUnique<T>(array: T[]): T[] {
  let unique: T[] = [];
  for (let i: i32 = 0; i < array.length; i++) {
    if (array.indexOf(array[i]) == i) {
      unique.push(array[i]);
    }
  }

  return unique;
}

export function arrayUniqueBy<T, U>(array: T[], pluck: (item: T) => U): T[] {
  let references = array.map<U>((item) => pluck(item));
  let unique: T[] = [];
  for (let i: i32 = 0; i < references.length; i++) {
    if (references.indexOf(references[i]) == i) {
      unique.push(array[i]);
    }
  }

  return unique;
}
