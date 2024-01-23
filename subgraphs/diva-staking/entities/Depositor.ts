import { Address, ethereum, BigDecimal, log } from '@graphprotocol/graph-ts';
import { Deposit, DepositLoader, Depositor } from '../generated/schema';
import { logCritical } from '@enzymefinance/subgraph-utils';
import { useDeposit } from './Deposit';
import { ensureGeneralInfo } from './GeneralInfo';


export function createDepositor(
  depositorAddress: Address,
  shares: BigDecimal,
  amount: BigDecimal,
  event: ethereum.Event,
): Depositor {
  let depositor = new Depositor(depositorAddress);

  depositor.shares = shares;
  depositor.amount = amount;
  depositor.createdAt = event.block.timestamp.toI32();
  depositor.updatedAt = event.block.timestamp.toI32();

  depositor.save();

  return depositor;
}

export function useDepositor(depositorAddress: Address): Depositor {
  let depositor = Depositor.load(depositorAddress);
  if (depositor == null) {
    logCritical('Failed to load depositor {}.', [depositorAddress.toString()]);
  }

  return depositor as Depositor;
}

export function ensureDepositor(depositorAddress: Address, event: ethereum.Event): Depositor {
  let depositor = Depositor.load(depositorAddress);

  if (depositor) {
    return depositor;
  }

  depositor = new Depositor(depositorAddress);
  depositor.shares = BigDecimal.zero();
  depositor.amount = BigDecimal.zero();
  depositor.createdAt = event.block.timestamp.toI32();
  depositor.updatedAt = event.block.timestamp.toI32();

  let generalInfo = ensureGeneralInfo();
  generalInfo.depositorsCounterActive = generalInfo.depositorsCounterActive + 1;
  generalInfo.depositorsCounterOverall = generalInfo.depositorsCounterOverall + 1;
  generalInfo.updatedAt = event.block.timestamp.toI32();
  generalInfo.save();

  return depositor as Depositor;
}
