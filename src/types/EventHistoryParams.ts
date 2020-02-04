import { BigInt } from "@graphprotocol/graph-ts";
export default class EventHistoryParams {
  private _params: EventHistoryParams;

  constructor(parameters: EventHistoryParams) {
    this._params = parameters;
  }

  set eventId(value: string) {
    this._params.eventId = value;
  }

  get eventId(): string {
    return this._params.eventId;
  }

  set timestamp(value: BigInt) {
    this._params.timestamp = value;
  }

  get timestamp(): BigInt {
    return this._params.timestamp;
  }

  set fundAddress(value: string) {
    this._params.fundAddress = value;
  }

  get fundAddress(): string {
    return this._params.fundAddress;
  }

  set contract(value: string) {
    this._params.contract = value;
  }

  get contract(): string {
    return this._params.contract;
  }

  set contractAddress(value: string) {
    this._params.contractAddress = value;
  }

  get contractAddress(): string {
    return this._params.contractAddress;
  }

  set parameterNames(values: string[]) {
    this._params.parameterNames = values;
  }

  get parameterNames(): string[] {
    return this._params.parameterNames;
  }

  set parameterValues(values: string[]) {
    this._params.parameterNames = values;
  }

  get parameterValues(): string[] {
    return this._params.parameterNames;
  }
}
