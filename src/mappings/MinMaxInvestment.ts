import { ensureAsset } from '../entities/Asset';
import { ensureMinMaxInvestmentSetting } from '../entities/MinMaxInvestmentSetting';
import { ensurePolicy } from '../entities/Policy';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { FundSettingsSet } from '../generated/MinMaxInvestmentContract';
import { MinMaxInvestmentFundSettingsSetEvent } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleFundSettingsSet(event: FundSettingsSet): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fundId = comptroller.getVaultProxy().toHex(); // fund entity may not exist yet
  let policy = ensurePolicy(event.address);
  let denominationAsset = ensureAsset(comptroller.getDenominationAsset());

  let settingsSet = new MinMaxInvestmentFundSettingsSetEvent(genericId(event));
  settingsSet.fund = fundId;
  settingsSet.timestamp = event.block.timestamp;
  settingsSet.transaction = ensureTransaction(event).id;
  settingsSet.comptrollerProxy = event.params.comptrollerProxy.toHex();
  settingsSet.minInvestmentAmount = toBigDecimal(event.params.minInvestmentAmount, denominationAsset.decimals);
  settingsSet.maxInvestmentAmount = toBigDecimal(event.params.maxInvestmentAmount, denominationAsset.decimals);
  settingsSet.save();

  let setting = ensureMinMaxInvestmentSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.minInvestmentAmount = settingsSet.minInvestmentAmount;
  setting.maxInvestmentAmount = settingsSet.maxInvestmentAmount;
  setting.events = arrayUnique<string>(setting.events.concat([settingsSet.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}
