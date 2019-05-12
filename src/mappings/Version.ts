import { NewFund } from '../types/VersionDataSource/VersionContract';
import { fundEntity } from './entities/fundEntity';

export function handleNewFund(event: NewFund): void {
  fundEntity(event.params.hub);
}
