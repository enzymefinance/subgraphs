import { Address } from '@graphprotocol/graph-ts';
import {
  Account,
  Asset,
  GatedRedemptionQueueSharesWrapperDepositApproval,
  GatedRedemptionQueueSharesWrapper,
  GatedRedemptionQueueSharesWrapperDepositorBalance,
  GatedRedemptionQueueSharesWrapperRedemptionApproval,
  GatedRedemptionQueueSharesWrapperRedemptionRequest,
  GatedRedemptionQueueSharesWrapperTransferApproval,
} from '../generated/schema';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import { ZERO_ADDRESS, ZERO_BD, ZERO_BI } from '@enzymefinance/subgraph-utils';

function gatedRedemptionQueueSharesWrapperId(wrapper: GatedRedemptionQueueSharesWrapper, account: Account): string {
  return wrapper.id + '/' + account.id;
}

export function ensureGatedRedemptionQueueSharesWrapper(address: Address): GatedRedemptionQueueSharesWrapper {
  let sharesWrapper = GatedRedemptionQueueSharesWrapper.load(address.toHex());

  if (sharesWrapper != null) {
    return sharesWrapper;
  }

  let sharesWrapperContract = ProtocolSdk.bind(address);
  let vaultAddress = sharesWrapperContract.getVaultProxy1();

  sharesWrapper = new GatedRedemptionQueueSharesWrapper(address.toHex());
  sharesWrapper.vault = vaultAddress.toHex();
  sharesWrapper.managers = new Array<string>();
  sharesWrapper.redemptionAsset = ZERO_ADDRESS.toHex();
  sharesWrapper.firstWindowStart = ZERO_BI;
  sharesWrapper.frequency = ZERO_BI;
  sharesWrapper.duration = ZERO_BI;
  sharesWrapper.relativeSharesCap = ZERO_BD;
  sharesWrapper.useDepositApprovals = false;
  sharesWrapper.useRedemptionApprovals = false;
  sharesWrapper.useTransferApprovals = false;
  sharesWrapper.save();

  return sharesWrapper;
}

// Deposit

export function gatedRedemptionQueueSharesWrapperDepositApprovalId(
  wrapper: GatedRedemptionQueueSharesWrapper,
  account: Account,
  asset: Asset,
): string {
  return gatedRedemptionQueueSharesWrapperId(wrapper, account) + '/' + asset.id;
}

export function ensureGatedRedemptionQueueSharesWrapperDepositApproval(
  wrapper: GatedRedemptionQueueSharesWrapper,
  account: Account,
  asset: Asset,
): GatedRedemptionQueueSharesWrapperDepositApproval {
  let id = gatedRedemptionQueueSharesWrapperDepositApprovalId(wrapper, account, asset);
  let approval = GatedRedemptionQueueSharesWrapperDepositApproval.load(id);

  if (approval != null) {
    return approval;
  }

  approval = new GatedRedemptionQueueSharesWrapperDepositApproval(id);
  approval.timestamp = 0;
  approval.vault = wrapper.vault;
  approval.wrapper = wrapper.id;
  approval.account = account.id;
  approval.asset = asset.id;
  approval.amount = ZERO_BD;
  approval.save();

  return approval;
}

// Transfer

export function gatedRedemptionQueueSharesWrapperTransferApprovalId(
  wrapper: GatedRedemptionQueueSharesWrapper,
  sender: Account,
  recipient: Account,
): string {
  return gatedRedemptionQueueSharesWrapperId(wrapper, sender) + '/' + recipient.id;
}

export function ensureGatedRedemptionQueueSharesWrapperTransferApproval(
  wrapper: GatedRedemptionQueueSharesWrapper,
  sender: Account,
  recipient: Account,
): GatedRedemptionQueueSharesWrapperTransferApproval {
  let id = gatedRedemptionQueueSharesWrapperTransferApprovalId(wrapper, sender, recipient);
  let approval = GatedRedemptionQueueSharesWrapperTransferApproval.load(id);

  if (approval != null) {
    return approval;
  }

  approval = new GatedRedemptionQueueSharesWrapperTransferApproval(id);
  approval.timestamp = 0;
  approval.vault = wrapper.vault;
  approval.wrapper = wrapper.id;
  approval.sender = sender.id;
  approval.recipient = recipient.id;
  approval.amount = ZERO_BD;
  approval.save();

  return approval;
}

// Redemption

export function gatedRedemptionQueueSharesWrapperRedemptionApprovalId(
  wrapper: GatedRedemptionQueueSharesWrapper,
  account: Account,
): string {
  return gatedRedemptionQueueSharesWrapperId(wrapper, account);
}

export function ensureGatedRedemptionQueueSharesWrapperRedemptionApproval(
  wrapper: GatedRedemptionQueueSharesWrapper,
  account: Account,
): GatedRedemptionQueueSharesWrapperRedemptionApproval {
  let id = gatedRedemptionQueueSharesWrapperRedemptionApprovalId(wrapper, account);
  let approval = GatedRedemptionQueueSharesWrapperRedemptionApproval.load(id);

  if (approval != null) {
    return approval;
  }

  approval = new GatedRedemptionQueueSharesWrapperRedemptionApproval(id);
  approval.timestamp = 0;
  approval.vault = wrapper.vault;
  approval.wrapper = wrapper.id;
  approval.account = account.id;
  approval.amount = ZERO_BD;
  approval.save();

  return approval;
}

export function gatedRedemptionQueueSharesWrapperRedemptionRequestId(
  wrapper: GatedRedemptionQueueSharesWrapper,
  account: Account,
): string {
  return gatedRedemptionQueueSharesWrapperId(wrapper, account);
}

export function ensureGatedRedemptionQueueSharesWrapperRedemptionRequest(
  wrapper: GatedRedemptionQueueSharesWrapper,
  account: Account,
): GatedRedemptionQueueSharesWrapperRedemptionRequest {
  let id = gatedRedemptionQueueSharesWrapperRedemptionRequestId(wrapper, account);
  let request = GatedRedemptionQueueSharesWrapperRedemptionRequest.load(id);

  if (request != null) {
    return request;
  }

  request = new GatedRedemptionQueueSharesWrapperRedemptionRequest(id);
  request.timestamp = 0;
  request.vault = wrapper.vault;
  request.wrapper = wrapper.id;
  request.account = account.id;
  request.shares = ZERO_BD;
  request.updatedAt = 0;
  request.save();

  return request;
}

export function gatedRedemptionQueueSharesWrapperDepositorBalanceId(
  wrapper: GatedRedemptionQueueSharesWrapper,
  account: Account,
): string {
  return gatedRedemptionQueueSharesWrapperId(wrapper, account);
}

export function ensureGatedRedemptionQueueSharesWrapperDepositorBalance(
  wrapper: GatedRedemptionQueueSharesWrapper,
  account: Account,
): GatedRedemptionQueueSharesWrapperDepositorBalance {
  let id = gatedRedemptionQueueSharesWrapperDepositorBalanceId(wrapper, account);
  let balance = GatedRedemptionQueueSharesWrapperDepositorBalance.load(id);

  if (balance != null) {
    return balance;
  }

  balance = new GatedRedemptionQueueSharesWrapperDepositorBalance(id);
  balance.wrapper = wrapper.id;
  balance.account = account.id;
  balance.shares = ZERO_BD;
  balance.save();

  return balance;
}
