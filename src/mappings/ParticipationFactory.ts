import { NewInstance } from '../types/ParticipationFactoryDataSource/ParticipationFactoryContract';
import { ParticipationDataSource } from '../types/ParticipationFactoryDataSource/templates';
import { Participation } from '../types/schema';

export function handleNewInstance(event: NewInstance): void {
  ParticipationDataSource.create(event.params.instance);

  let participation = new Participation(event.params.instance.toHex());
  participation.fund = event.params.hub.toHex();
  participation.allowedAssets = [];
  participation.investmentRequests = [];
  participation.save();
}
