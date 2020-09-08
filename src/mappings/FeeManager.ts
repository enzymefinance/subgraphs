import {
  FeeDeregistered,
  FeeEnabledForFund,
  FeeRegistered,
  FeeSettledForFund,
  FeeSharesOutstandingPaidForFund,
} from '../generated/FeeManagerContract';

export function handleFeeDeregistered(event: FeeDeregistered): void {}
export function handleFeeEnabledForFund(event: FeeEnabledForFund): void {}
export function handleFeeRegistered(event: FeeRegistered): void {}
export function handleFeeSettledForFund(event: FeeSettledForFund): void {}
export function handleFeeSharesOutstandingPaidForFund(event: FeeSharesOutstandingPaidForFund): void {}
