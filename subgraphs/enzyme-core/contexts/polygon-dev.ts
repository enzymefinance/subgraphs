import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';
import { polygon } from './polygon';

export const polygonDev: Context<Variables> = { ...polygon, name: 'enzyme-core-polygon-dev' };
