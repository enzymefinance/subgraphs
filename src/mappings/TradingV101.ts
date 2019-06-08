import { ExchangeMethodCall } from "../types/TradingFactoryDataSourceV101/templates/TradingDataSourceV101/TradingContractV101";
import { ExchangeMethodCall as ExchangeMethodCallEntity } from "../types/schema";

export function handleExchangeMethodCall(event: ExchangeMethodCall): void {
  let id = event.transaction.hash.toHex();

  let addresses = event.params.orderAddresses.map<string>(value =>
    value.toHex()
  );

  let values = event.params.orderValues;

  let emCall = new ExchangeMethodCallEntity(id);
  emCall.exchange = event.params.exchangeAddress.toHex();
  emCall.methodSignature = event.params.methodSignature.toHexString();
  emCall.orderAddress1 = addresses[0];
  emCall.orderAddress2 = addresses[1];
  emCall.orderAddress3 = addresses[2];
  emCall.orderAddress4 = addresses[3];
  emCall.orderAddress5 = addresses[4];
  emCall.orderAddress6 = addresses[5];
  emCall.orderValue1 = values[0];
  emCall.orderValue2 = values[1];
  emCall.orderValue3 = values[2];
  emCall.orderValue4 = values[3];
  emCall.orderValue5 = values[4];
  emCall.orderValue6 = values[5];
  emCall.orderValue7 = values[6];
  // emCall.orderValue8 = values[7];
  emCall.makerAssetData = event.params.makerAssetData.toHexString();
  emCall.takerAssetData = event.params.takerAssetData.toHexString();
  emCall.signature = event.params.signature.toHexString();
  emCall.save();
}
