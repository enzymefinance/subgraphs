import { KyberAdapter, MockKyberIntegratee, StandardToken } from '@melonproject/protocol';
import { providers, utils, Wallet } from 'ethers';
import { createAccount, Deployment, fetchDeployment } from './utils/deployment';
import { fetchAssets } from './utils/subgraph-queries/fetchAssets';

describe('Walkthrough', () => {
  let deployment: Deployment;
  let provider: providers.Provider;
  let signer: Wallet;

  const testnetEndpoint = 'http://localhost:4000/graphql';
  const jsonRpcProvider = 'http://localhost:8545';
  const subgraphApi = 'http://localhost:8000/subgraphs/name/enzymefinance/enzyme';

  beforeAll(async () => {
    const account = await createAccount(testnetEndpoint);
    deployment = await fetchDeployment(testnetEndpoint);
    provider = new providers.JsonRpcProvider(jsonRpcProvider);
    signer = new Wallet(account.privateKey, provider);
  });

  fit('should get the selectors', async () => {
    const kyberAdapter = new KyberAdapter(deployment.kyberAdapter, provider);

    console.log(
      await kyberAdapter.ADD_TRACKED_ASSETS_SELECTOR(),
      await kyberAdapter.TAKE_ORDER_SELECTOR(),
      await kyberAdapter.LEND_SELECTOR(),
      await kyberAdapter.REDEEM_SELECTOR(),
    );
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

  it('should check Kyber rates', async () => {
    const kyberIntegratee = new MockKyberIntegratee(deployment.kyberIntegratee, signer);

    console.log(deployment.kyberIntegratee);

    const assets = await fetchAssets(subgraphApi);

    for (let asset of assets) {
      // await kyberIntegratee.setRates([asset.id], [deployment.wethToken], [utils.parseEther('0.5')]);

      const rate = await kyberIntegratee.getExpectedRate
        .args(asset.id, deployment.wethToken, utils.parseEther('0.001'))
        .call();
      console.log(`${asset.symbol} rate: `, utils.formatEther(rate.rate_));
      expect(1).toBe(1);
    }
  });
});
