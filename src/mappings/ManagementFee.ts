import { useManager } from '../entities/Account';
import { useComptroller } from '../entities/Comptroller';
import { ensureContract } from '../entities/Contract';
import { useFee } from '../entities/Fee';
import { ensureManagementFeeSetting } from '../entities/ManagementFeeSetting';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { FundSettingsAdded, Settled } from '../generated/ManagementFeeContract';
import { ManagementFeeSettingsAddedEvent } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/tokenValue';

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let fee = useFee(event.address.toHex());
  let rate = toBigDecimal(event.params.rate);

  let feeSettings = new ManagementFeeSettingsAddedEvent(genericId(event));
  feeSettings.fund = vault.toHex(); // fund does not exist yet
  feeSettings.account = useManager(event.transaction.from.toHex()).id;
  feeSettings.contract = ensureContract(event.address, 'ManagementFee', event).id;
  feeSettings.timestamp = event.block.timestamp;
  feeSettings.transaction = ensureTransaction(event).id;
  feeSettings.comptrollerProxy = useComptroller(event.params.comptrollerProxy.toHex()).id;
  feeSettings.rate = rate;
  feeSettings.save();

  let setting = ensureManagementFeeSetting(vault.toHex(), fee);
  setting.rate = rate;
  setting.events = arrayUnique<string>(setting.events.concat([feeSettings.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleSettled(event: Settled): void {}
