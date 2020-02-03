import { BigInt, Address } from "@graphprotocol/graph-ts";
export default class EventHistoryParams {
  private _params: EventHistoryParams;
  constructor(parameters: EventHistoryParams) {
    this._params = parameters;
  }
  set id(value: String) {
    this._params.id = value;
  }
  get id(): String {
    return this._params.id;
  }
  set timestamp(value: BigInt) {
    this._params.timestamp = value;
  }
  get timestamp(): BigInt {
    return this._params.timestamp;
  }
  set fund(value: Address) {
    this._params.fund = value;
  }
  get fund(): Address {
    return this._params.fund;
  }
}
