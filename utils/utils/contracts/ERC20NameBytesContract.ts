import { ethereum, Bytes, Address } from '@graphprotocol/graph-ts';

export class ERC20NameBytesContract extends ethereum.SmartContract {
  static bind(address: Address): ERC20NameBytesContract {
    return new ERC20NameBytesContract('ERC20NameBytesContract', address);
  }

  name(): Bytes {
    let result = super.call('name', 'name():(bytes32)', []);

    return result[0].toBytes();
  }

  try_name(): ethereum.CallResult<Bytes> {
    let result = super.tryCall('name', 'name():(bytes32)', []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }
}
