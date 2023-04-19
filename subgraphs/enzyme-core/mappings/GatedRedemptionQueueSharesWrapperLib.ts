import { arrayDiff, arrayUnique, toBigDecimal, UINT256_MAX_BD, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureAccount } from '../entities/Account';
import { ensureAsset, isAsset } from '../entities/Asset';
import {
  ensureGatedRedemptionQueueSharesWrapper,
  ensureGatedRedemptionQueueSharesWrapperDepositApproval,
  ensureGatedRedemptionQueueSharesWrapperTransferApproval,
  ensureGatedRedemptionQueueSharesWrapperRedemptionApproval,
  ensureGatedRedemptionQueueSharesWrapperRedemptionRequest,
  ensureGatedRedemptionQueueSharesWrapperDepositorBalance,
  gatedRedemptionQueueSharesWrapperRedemptionRequestId,
  ensureGatedRedemptionQueueSharesWrapperDepositRequest,
} from '../entities/GatedRedemptionQueueSharesWrapper';
import {
  Approval,
  DepositApproval,
  Deposited,
  DepositModeSet,
  DepositRequestAdded,
  DepositRequestRemoved,
  Initialized,
  Kicked,
  ManagerAdded,
  ManagerRemoved,
  Redeemed,
  RedemptionApproval,
  RedemptionAssetSet,
  RedemptionRequestAdded,
  RedemptionRequestRemoved,
  RedemptionWindowConfigSet,
  Transfer,
  TransferApproval,
  UseDepositApprovalsSet,
  UseRedemptionApprovalsSet,
  UseTransferApprovalsSet,
} from '../generated/contracts/GatedRedemptionQueueSharesWrapperLibEvents';
import { store } from '@graphprotocol/graph-ts';
import { UINT256_MAX, ZERO_ADDRESS, ZERO_BD } from '../../../packages/utils/constants';
import {
  GatedRedemptionQueueSharesWrapperDeposit,
  GatedRedemptionQueueSharesWrapperKick,
  GatedRedemptionQueueSharesWrapperRedemption,
  GatedRedemptionQueueSharesWrapperRedemptionRequest,
  GatedRedemptionQueueSharesWrapperTransfer,
} from '../generated/schema';

// Configuration

export function handleManagerAdded(event: ManagerAdded): void {
  let sharesWrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);

  let account = ensureAccount(event.params.user, event);
  sharesWrapper.managers = arrayUnique<string>(sharesWrapper.managers.concat([account.id]));
  sharesWrapper.save();
}

export function handleManagerRemoved(event: ManagerRemoved): void {
  let sharesWrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);

  let account = ensureAccount(event.params.user, event);
  sharesWrapper.managers = arrayDiff<string>(sharesWrapper.managers, [account.id]);
  sharesWrapper.save();
}

export function handleDepositModeSet(event: DepositModeSet): void {
  let sharesWrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  sharesWrapper.depositMode = event.params.mode == 0 ? 'DIRECT' : 'REQUEST';
  sharesWrapper.save();
}

export function handleRedemptionWindowConfigSet(event: RedemptionWindowConfigSet): void {
  let sharesWrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  sharesWrapper.firstWindowStart = event.params.firstWindowStart;
  sharesWrapper.duration = event.params.duration;
  sharesWrapper.frequency = event.params.frequency;
  sharesWrapper.relativeSharesCap = toBigDecimal(event.params.relativeSharesCap, 18);
  sharesWrapper.save();
}

export function handleRedemptionAssetSet(event: RedemptionAssetSet): void {
  let sharesWrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);

  let asset = ensureAsset(event.params.asset);
  sharesWrapper.redemptionAsset = asset.id;
  sharesWrapper.save();
}

export function handleUseDepositApprovalsSet(event: UseDepositApprovalsSet): void {
  let sharesWrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  sharesWrapper.useDepositApprovals = event.params.useApprovals;
  sharesWrapper.save();
}

export function handleUseRedemptionApprovalsSet(event: UseRedemptionApprovalsSet): void {
  let sharesWrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  sharesWrapper.useRedemptionApprovals = event.params.useApprovals;
  sharesWrapper.save();
}

export function handleUseTransferApprovalsSet(event: UseTransferApprovalsSet): void {
  let sharesWrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  sharesWrapper.useTransferApprovals = event.params.useApprovals;
  sharesWrapper.save();
}

// Deposit

export function handleDepositApproval(event: DepositApproval): void {
  if (!isAsset(event.params.asset)) {
    return;
  }

  let wrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  let account = ensureAccount(event.params.user, event);
  let asset = ensureAsset(event.params.asset);
  let amount = toBigDecimal(event.params.amount, asset.decimals);

  let approval = ensureGatedRedemptionQueueSharesWrapperDepositApproval(wrapper, account, asset);
  if (amount.notEqual(ZERO_BD)) {
    approval.amount = amount;
    approval.timestamp = event.block.timestamp.toI32();
    approval.save();
  } else {
    store.remove('GatedRedemptionQueueSharesWrapperDepositApproval', approval.id);
  }
}

export function handleDepositRequestAdded(event: DepositRequestAdded): void {
  let wrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  let account = ensureAccount(event.params.user, event);
  let asset = ensureAsset(event.params.depositAsset);

  let request = ensureGatedRedemptionQueueSharesWrapperDepositRequest(wrapper, account, asset);
  request.amount = request.amount.plus(toBigDecimal(event.params.depositAssetAmount, asset.decimals));
  request.timestamp = event.block.timestamp.toI32();
  request.save();

  // remove approval if needed
  if (wrapper.useDepositApprovals == true) {
    let approval = ensureGatedRedemptionQueueSharesWrapperDepositApproval(wrapper, account, asset);
    if (approval.amount.notEqual(toBigDecimal(UINT256_MAX, asset.decimals))) {
      store.remove('GatedRedemptionQueueSharesWrapperDepositApproval', approval.id);
    }
  }
}

export function handleDepositRequestRemoved(event: DepositRequestRemoved): void {
  let wrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  let account = ensureAccount(event.params.user, event);
  let asset = ensureAsset(event.params.depositAsset);

  let request = ensureGatedRedemptionQueueSharesWrapperDepositRequest(wrapper, account, asset);
  store.remove('ensureGatedRedemptionQueueSharesWrapperDepositRequest', request.id);
}

export function handleDeposited(event: Deposited): void {
  let wrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  let account = ensureAccount(event.params.user, event);
  let asset = ensureAsset(event.params.depositToken);
  let sharesReceived = toBigDecimal(event.params.sharesReceived);

  let deposit = new GatedRedemptionQueueSharesWrapperDeposit(uniqueEventId(event));
  deposit.timestamp = event.block.timestamp.toI32();
  deposit.vault = wrapper.vault;
  deposit.wrapper = wrapper.id;
  deposit.account = account.id;
  deposit.asset = asset.id;
  deposit.amount = toBigDecimal(event.params.depositTokenAmount, asset.decimals);
  deposit.shares = sharesReceived;
  deposit.save();

  // remove approval if needed
  if (wrapper.useDepositApprovals == true) {
    let approval = ensureGatedRedemptionQueueSharesWrapperDepositApproval(wrapper, account, asset);
    if (approval.amount.notEqual(toBigDecimal(UINT256_MAX, asset.decimals))) {
      store.remove('GatedRedemptionQueueSharesWrapperDepositApproval', approval.id);
    }
  }

  // remove deposit request if needed
}

// Transfer

export function handleTransferApproval(event: TransferApproval): void {
  let wrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  let sender = ensureAccount(event.params.sender, event);
  let recipient = ensureAccount(event.params.recipient, event);
  let amount = toBigDecimal(event.params.amount);

  let approval = ensureGatedRedemptionQueueSharesWrapperTransferApproval(wrapper, sender, recipient);
  if (amount.notEqual(ZERO_BD)) {
    approval.amount = amount;
    approval.timestamp = event.block.timestamp.toI32();
    approval.save();
  } else {
    store.remove('GatedRedemptionQueueSharesWrapperTransferApproval', approval.id);
  }
}

export function handleTransfer(event: Transfer): void {
  let wrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  let sender = ensureAccount(event.params.from, event);
  let recipient = ensureAccount(event.params.to, event);
  let sharesAmount = toBigDecimal(event.params.value);

  if (event.params.from.notEqual(ZERO_ADDRESS) && event.params.to.notEqual(ZERO_ADDRESS)) {
    let transfer = new GatedRedemptionQueueSharesWrapperTransfer(uniqueEventId(event));
    transfer.timestamp = event.block.timestamp.toI32();
    transfer.vault = wrapper.vault;
    transfer.wrapper = wrapper.id;
    transfer.sender = sender.id;
    transfer.recipient = recipient.id;
    transfer.shares = sharesAmount;
    transfer.save();
  }

  // remove approval if needed
  if (wrapper.useRedemptionApprovals == true) {
    let approval = ensureGatedRedemptionQueueSharesWrapperTransferApproval(wrapper, sender, recipient);
    if (approval.amount.notEqual(UINT256_MAX_BD)) {
      store.remove('GatedRedemptionQueueSharesWrapperTransferApproval', approval.id);
    }
  }

  if (event.params.from.notEqual(ZERO_ADDRESS)) {
    let senderBalance = ensureGatedRedemptionQueueSharesWrapperDepositorBalance(wrapper, sender);
    senderBalance.shares = senderBalance.shares.minus(sharesAmount);
    senderBalance.save();
  }

  if (event.params.to.notEqual(ZERO_ADDRESS)) {
    let recipientBalance = ensureGatedRedemptionQueueSharesWrapperDepositorBalance(wrapper, recipient);
    recipientBalance.shares = recipientBalance.shares.plus(sharesAmount);
    recipientBalance.save();
  }
}

// Redemption

export function handleRedemptionApproval(event: RedemptionApproval): void {
  let wrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  let account = ensureAccount(event.params.user, event);
  let amount = toBigDecimal(event.params.amount);

  let approval = ensureGatedRedemptionQueueSharesWrapperRedemptionApproval(wrapper, account);
  if (amount.notEqual(ZERO_BD)) {
    approval.amount = amount;
    approval.timestamp = event.block.timestamp.toI32();
    approval.save();
  } else {
    store.remove('GatedRedemptionQueueSharesWrapperRedemptionApproval', approval.id);
  }
}

export function handleRedemptionRequestAdded(event: RedemptionRequestAdded): void {
  let wrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  let account = ensureAccount(event.params.user, event);

  let request = ensureGatedRedemptionQueueSharesWrapperRedemptionRequest(wrapper, account);
  request.shares = request.shares.plus(toBigDecimal(event.params.sharesAmount));
  request.timestamp = event.block.timestamp.toI32();
  request.save();

  // remove approval if needed
  if (wrapper.useRedemptionApprovals == true) {
    let approval = ensureGatedRedemptionQueueSharesWrapperRedemptionApproval(wrapper, account);
    if (approval.amount.notEqual(UINT256_MAX_BD)) {
      store.remove('GatedRedemptionQueueSharesWrapperRedemptionApproval', approval.id);
    }
  }
}

export function handleRedemptionRequestRemoved(event: RedemptionRequestRemoved): void {
  let wrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  let account = ensureAccount(event.params.user, event);

  let request = ensureGatedRedemptionQueueSharesWrapperRedemptionRequest(wrapper, account);
  store.remove('GatedRedemptionQueueSharesWrapperRedemptionRequest', request.id);
}

export function handleRedeemed(event: Redeemed): void {
  let wrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  let account = ensureAccount(event.params.user, event);
  let sharesAmount = toBigDecimal(event.params.sharesAmount);

  let redemption = new GatedRedemptionQueueSharesWrapperRedemption(uniqueEventId(event));
  redemption.timestamp = event.block.timestamp.toI32();
  redemption.vault = wrapper.vault;
  redemption.wrapper = wrapper.id;
  redemption.shares = sharesAmount;
  redemption.save();

  // update request
  let requestId = gatedRedemptionQueueSharesWrapperRedemptionRequestId(wrapper, account);
  let request = GatedRedemptionQueueSharesWrapperRedemptionRequest.load(requestId);

  if (request == null) {
    return;
  }

  if (request.shares.minus(sharesAmount).equals(ZERO_BD)) {
    store.remove('GatedRedemptionQueueSharesWrapperRedemptionRequest', request.id);
  } else {
    request.shares.minus(sharesAmount);
    request.save();
  }
}

export function handleKicked(event: Kicked): void {
  let wrapper = ensureGatedRedemptionQueueSharesWrapper(event.address);
  let account = ensureAccount(event.params.user, event);
  let sharesAmount = toBigDecimal(event.params.sharesAmount);

  let kick = new GatedRedemptionQueueSharesWrapperKick(uniqueEventId(event));
  kick.timestamp = event.block.timestamp.toI32();
  kick.vault = wrapper.vault;
  kick.wrapper = wrapper.id;
  kick.account = account.id;
  kick.shares = sharesAmount;
  kick.save();
}

export function handleApproval(event: Approval): void {}

export function handleInitialized(event: Initialized): void {}
