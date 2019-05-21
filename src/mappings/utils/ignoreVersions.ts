export function isBlacklisted(address: string): bool {
  let addresses: string[] = [
    "0xcb6c6bdf0aa4cf0188518783b871931efb64248f",
    "0xf1d376db5ed16d183a962eaa719a58773fba5dff",
    "0x07ed984b46ff6789ba30b75b5f4690b9f15464d4"
  ];

  return addresses.includes(address);
}
