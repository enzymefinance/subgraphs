import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';
import { ethereum } from './ethereum';

export const ethereumDevTwo: Context<Variables> = { ...ethereum, name: 'enzyme-core-dev-two' };
