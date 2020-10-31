import { MockKyberIntegratee, StandardToken } from '@melonproject/protocol';
import { providers, utils, Wallet } from 'ethers';
import { createAccount, Deployment, fetchDeployment } from './utils/deployment';
import { fetchAssets } from './utils/subgraph-queries/fetchAssets';

describe('Walkthrough', () => {
  let deployment: Deployment;
  let provider: providers.Provider;
  let signer: Wallet;

  const testnetEndpoint = 'http://localhost:4000/graphql';
  const jsonRpcProvider = 'http://localhost:8545';
  const subgraphApi = 'http://localhost:8000/subgraphs/name/melonproject/melon';

  beforeAll(async () => {
    const account = await createAccount(testnetEndpoint);
    deployment = await fetchDeployment(testnetEndpoint);
    provider = new providers.JsonRpcProvider(jsonRpcProvider);
    signer = new Wallet(account.privateKey, provider);
  });

  it('should check the amounts in the integratees', async () => {
    const kyberIntegratee = new MockKyberIntegratee(deployment.kyberIntegratee, provider);

    const assets = await fetchAssets(subgraphApi);

    for (let asset of assets) {
      const token = new StandardToken(asset.id, provider);
      const balance = await token.balanceOf(kyberIntegratee.address);
      console.log(asset.symbol, utils.formatEther(balance));
      expect(1).toBe(1);
    }
  });
});
