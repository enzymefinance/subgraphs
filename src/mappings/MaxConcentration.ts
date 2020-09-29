import { ensureManager } from '../entities/Account';
import { useComptroller } from '../entities/Comptroller';
import { ensureContract } from '../entities/Contract';
import { ensureMaxConcentrationSetting } from '../entities/MaxConcentrationSetting';
import { usePolicy } from '../entities/Policy';
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
  let policy = usePolicy(event.address.toHex());
  let value = toBigDecimal(event.params.value);

  let maxConcentration = new MaxConcentrationSetEvent(genericId(event));
  maxConcentration.fund = vault.toHex(); // fund does not exist yet
  maxConcentration.account = ensureManager(event.transaction.from, event).id;
  maxConcentration.contract = ensureContract(event.address, 'MaxConcentration', event).id;
  maxConcentration.timestamp = event.block.timestamp;
  maxConcentration.transaction = ensureTransaction(event).id;
  maxConcentration.comptrollerProxy = useComptroller(event.params.comptrollerProxy.toHex()).id;
  maxConcentration.value = value;
  maxConcentration.save();

  let setting = ensureMaxConcentrationSetting(vault.toHex(), policy);
  setting.maxConcentration = value;
  setting.events = arrayUnique<string>(setting.events.concat([maxConcentration.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}
