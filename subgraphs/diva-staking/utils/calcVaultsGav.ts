import { BigInt } from '@graphprotocol/graph-ts';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import { ethVaultAddress, stEthVaultAddress } from '../generated/addresses';

export function calcVaultsGav(): BigInt {
  let vaultStEth = ProtocolSdk.bind(stEthVaultAddress);
  let vaultEth = ProtocolSdk.bind(ethVaultAddress);

  let vaultStEthAccessor = ProtocolSdk.bind(vaultStEth.getAccessor());
  let vaultEthAccessor = ProtocolSdk.bind(vaultEth.getAccessor());

  let vaultStEthGav = vaultStEthAccessor.calcGav();
  let vaultEthGav = vaultEthAccessor.calcGav();

  return vaultStEthGav.plus(vaultEthGav);
}
