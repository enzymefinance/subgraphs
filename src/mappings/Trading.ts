import { ExchangeMethodCall } from "../types/TradingFactoryDataSource/templates/TradingDataSource/TradingContract";
import { ExchangeMethodCall as ExchangeMethodCallEntity } from "../types/schema";

export function handleExchangeMethodCall(event: ExchangeMethodCall): void {
  let id = event.transaction.hash.toHex();

  let addresses = event.params.orderAddresses.map<string>(value =>
    value.toHex()
  );

  let values = event.params.orderValues;

  let emCall = new ExchangeMethodCallEntity(id);
  emCall.trading = event.address.toHex();
  emCall.exchange = event.params.exchangeAddress.toHex();
  emCall.methodSignature = event.params.methodSignature.toHexString();
  emCall.orderAddress0 = addresses[0];
  emCall.orderAddress1 = addresses[1];
  emCall.orderAddress2 = addresses[2];
  emCall.orderAddress3 = addresses[3];
  emCall.orderAddress4 = addresses[4];
  emCall.orderAddress5 = addresses[5];
  emCall.orderValue0 = values[0];
  emCall.orderValue1 = values[1];
  emCall.orderValue2 = values[2];
  emCall.orderValue3 = values[3];
  emCall.orderValue4 = values[4];
  emCall.orderValue5 = values[5];
  emCall.orderValue6 = values[6];
  emCall.orderValue7 = values[7];
  emCall.makerAssetData = event.params.makerAssetData.toHexString();
  emCall.takerAssetData = event.params.takerAssetData.toHexString();
  emCall.signature = event.params.signature.toHexString();
  emCall.timestamp = event.block.timestamp;
  emCall.save();
}
