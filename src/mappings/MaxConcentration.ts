import { ensureMaxConcentrationSetting } from '../entities/MaxConcentrationSetting';
import { ensurePolicy } from '../entities/Policy';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { MaxConcentrationSet } from '../generated/MaxConcentrationContract';
import { MaxConcentrationSetEvent } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleMaxConcentrationSet(event: MaxConcentrationSet): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let policy = ensurePolicy(event.address);
  let value = toBigDecimal(event.params.value);

  let maxConcentration = new MaxConcentrationSetEvent(genericId(event));
  maxConcentration.fund = vault.toHex(); // fund does not exist yet
  maxConcentration.timestamp = event.block.timestamp;
  maxConcentration.transaction = ensureTransaction(event).id;
  maxConcentration.comptrollerProxy = event.params.comptrollerProxy.toHex();
  maxConcentration.value = value;
  maxConcentration.save();

  let setting = ensureMaxConcentrationSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.maxConcentration = value;
  setting.events = arrayUnique<string>(setting.events.concat([maxConcentration.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}
