import { arrayUnique, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { AnswerUpdated } from '../generated/AggregatorInterfaceContract';
import { AggregatorProxy } from '../generated/schema';
import { getUpdatedAggregator, Registration } from './entities/Registration';
import { updateForRegistration } from './utils/updateForRegistration';

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let aggregator = getUpdatedAggregator(event.address);
  if (aggregator.proxies.length == 0) {
    return;
  }

  let proxies: Array<AggregatorProxy> = aggregator.proxies
    .map<AggregatorProxy>((id) => AggregatorProxy.load(id) as AggregatorProxy)
    .filter((item) => item != null);

  let ids = new Array<string>();
  for (let i: i32 = 0; i < proxies.length; i++) {
    let proxy = proxies[i];
    ids = ids.concat(proxy.registrations);
  }

  let registrations: Array<Registration> = arrayUnique<string>(ids)
    .map<Registration>((id) => Registration.load(id) as Registration)
    .filter((item) => item != null);

  let value = toBigDecimal(event.params.current, aggregator.type == 'USD' ? 8 : 18);
  for (let i: i32 = 0; i < registrations.length; i++) {
    updateForRegistration(registrations[i], value, event.block);
  }
}
