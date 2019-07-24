import {
  Registration,
  PolicyManagerContract
} from "../types/PolicyManagerFactoryDataSource/templates/PolicyManagerDataSource/PolicyManagerContract";
import { Policy } from "../types/schema";
import { PolicyContract } from "../types/PolicyManagerFactoryDataSource/templates/PolicyManagerDataSource/PolicyContract";
import { PriceToleranceContract } from "../types/PolicyManagerFactoryDataSource/templates/PolicyManagerDataSource/PriceToleranceContract";
import { MaxPositionsContract } from "../types/PolicyManagerFactoryDataSource/templates/PolicyManagerDataSource/MaxPositionsContract";
import { MaxConcentrationContract } from "../types/PolicyManagerFactoryDataSource/templates/PolicyManagerDataSource/MaxConcentrationContract";
import { AssetWhiteListContract } from "../types/PolicyManagerFactoryDataSource/templates/PolicyManagerDataSource/AssetWhiteListContract";
import { AssetBlackListContract } from "../types/PolicyManagerFactoryDataSource/templates/PolicyManagerDataSource/AssetBlackListContract";
import { saveEventHistory } from "./utils/saveEventHistory";

export function handleRegistration(event: Registration): void {
  let policyAddress = event.params.policy;

  let policyContract = PolicyContract.bind(policyAddress);
  let identifier = policyContract.identifier();

  let policyManagerContract = PolicyManagerContract.bind(event.address);
  let hub = policyManagerContract.hub();

  let policy = new Policy(policyAddress.toHex());
  policy.policyManager = event.address.toHex();
  policy.signature = event.params.sig.toHex();
  policy.position = event.params.position;
  policy.identifier = identifier;

  // get policy parameters according to policy identifier
  if (identifier == "UserWhitelist") {
    // needs to be implemented through event listeners on the UserWhiteList contract
  } else if (identifier == "Asset blacklist") {
    let assetBlackListContract = AssetBlackListContract.bind(policyAddress);
    policy.assetBlackList = assetBlackListContract
      .getMembers()
      .map<string>(address => address.toHex());
  } else if (identifier == "Asset whitelist") {
    let assetWhiteListContract = AssetWhiteListContract.bind(policyAddress);
    policy.assetWhiteList = assetWhiteListContract
      .getMembers()
      .map<string>(address => address.toHex());
  } else if (identifier == "Max concentration") {
    let maxConcentrationContract = MaxConcentrationContract.bind(policyAddress);
    policy.maxConcentration = maxConcentrationContract.maxConcentration();
  } else if (identifier == "Max positions") {
    let maxPositionsContract = MaxPositionsContract.bind(policyAddress);
    policy.maxPositions = maxPositionsContract.maxPositions();
  } else if (identifier == "Price tolerance") {
    let priceToleranceContract = PriceToleranceContract.bind(policyAddress);
    policy.priceTolerance = priceToleranceContract.tolerance();
  }
  policy.save();

  saveEventHistory(
    event.transaction.hash.toHex() + "/" + event.params.sig.toHex(),
    event.block.timestamp,
    hub.toHex(),
    "PolicyManager",
    event.address.toHex(),
    "Registration",
    ["policy"],
    [policyAddress.toHex()]
  );
}
