import { logCritical } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { ProtocolFee } from '../generated/schema';

export function protocolFeeId(vaultAddress: Address, protocolFeeTrackerAddress: Address): string {
  return vaultAddress.toHex() + '/' + protocolFeeTrackerAddress.toHex();
}

export function createProtocolFee(vaultAddress: Address, protocolFeeTrackerAddress: Address): ProtocolFee {
  let id = protocolFeeId(vaultAddress, protocolFeeTrackerAddress);

  let protocolFee = new ProtocolFee(id);
  protocolFee = new ProtocolFee(id);
  protocolFee.vault = vaultAddress.toHex();
  protocolFee.feeTracker = protocolFeeTrackerAddress;
  protocolFee.rate = BigDecimal.fromString('0');
  protocolFee.lastPaid = 0;
  protocolFee.save();

  return protocolFee;
}

export function useProtocolFee(vaultAddress: Address, protocolFeeTrackerAddress: Address): ProtocolFee {
  let id = protocolFeeId(vaultAddress, protocolFeeTrackerAddress);

  let protocolFee = new ProtocolFee(id) as ProtocolFee;

  if (protocolFee == null) {
    logCritical('Failed to load fee {}.', [id]);
  }

  return protocolFee;
}
