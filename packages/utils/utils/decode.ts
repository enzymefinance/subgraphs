import { ByteArray, Bytes } from '@graphprotocol/graph-ts';

// Adapted from https://ethereum.stackexchange.com/questions/114582/the-graph-nodes-cant-decode-abi-encoded-data-containing-arrays
// Wrap arguments with this function if (and only if) one of the arguments is an array or 'bytes'
export function tuplePrefixBytes(input: Bytes): Bytes {
  let inputTypedArray = input.subarray(0);

  let tuplePrefix = ByteArray.fromHexString('0x0000000000000000000000000000000000000000000000000000000000000020');

  let inputAsTuple = new Uint8Array(tuplePrefix.length + inputTypedArray.length);

  inputAsTuple.set(tuplePrefix, 0);
  inputAsTuple.set(inputTypedArray, tuplePrefix.length);

  return Bytes.fromUint8Array(inputAsTuple);
}
