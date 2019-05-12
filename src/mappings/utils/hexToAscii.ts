export function hexToAscii(hex: string): string {
  let output = '';
  for (let i = 0; i < hex.length; i += 2) {
    let slice = parseInt(hex.substr(i, 2), 16) as i32;

    if (slice) {
      output += String.fromCharCode(slice);
    }
  }

  return output;
}
