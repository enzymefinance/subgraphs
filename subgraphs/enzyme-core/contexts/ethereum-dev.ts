import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';
import { ethereum } from './ethereum';

export const ethereumDev: Context<Variables> = { ...ethereum, name: 'enzyme-core-dev' };
