import { ethereum, Bytes, Address } from '@graphprotocol/graph-ts';

export class ERC20SymbolBytesContract extends ethereum.SmartContract {
  static bind(address: Address): ERC20SymbolBytesContract {
    return new ERC20SymbolBytesContract('ERC20SymbolBytesContract', address);
  }

  symbol(): Bytes {
    let result = super.call('symbol', 'symbol():(bytes32)', []);

    return result[0].toBytes();
  }

  try_symbol(): ethereum.CallResult<Bytes> {
    let result = super.tryCall('symbol', 'symbol():(bytes32)', []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }
}
