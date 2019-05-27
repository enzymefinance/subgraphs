import {
  FeeRegistration,
  FeeReward
} from "../types/FeeManagerFactoryDataSource/templates/FeeManagerDataSource/FeeManagerContract";

export function handleFeeRegistration(event: FeeRegistration): void {
  // TODO
  // we don't get the fee paramaters in the event, need to query the contract here...
}

export function handleFeeReward(event: FeeReward): void {
  // TODO
  // log fee rewards (write to FeeManager entity and to Log)
}
