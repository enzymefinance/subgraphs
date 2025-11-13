import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';
import { ethereum } from './ethereum';

export const ethereumDev: Context<Variables> = {
  ...ethereum,
  deploymentId: 'QmSQSwYbATeKbU8TRbvjRiw3yZApx7H6JQb2cAjp6MCfNH',
  name: 'enzyme-core-dev',
};
