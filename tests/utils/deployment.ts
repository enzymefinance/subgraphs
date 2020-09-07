import request, { gql } from 'graphql-request';

const deploymentQuery = gql`
  query {
    deployment {
      wethToken
      chaiPriceSource
      chaiIntegratee
      kyberIntegratee
      dispatcher
      vaultLib
      fundDeployer
      valueInterpreter
      engine
      comptrollerLib
      feeManager
      integrationManager
      policyManager
      chainlinkPriceFeed
      chaiPriceFeed
      aggregatedDerivativePriceFeed
      chaiAdapter
      kyberAdapter
    }
  }
`;

export interface Deployment {
  wethToken: string;
  chaiPriceSource: string;
  chaiIntegratee: string;
  kyberIntegratee: string;
  dispatcher: string;
  vaultLib: string;
  fundDeployer: string;
  valueInterpreter: string;
  engine: string;
  comptrollerLib: string;
  feeManager: string;
  integrationManager: string;
  policyManager: string;
  chainlinkPriceFeed: string;
  chaiPriceFeed: string;
  aggregatedDerivativePriceFeed: string;
  chaiAdapter: string;
  kyberAdapter: string;
}

export async function fetchDeployment(endpoint: string) {
  const result = await request<{
    deployment: Deployment;
  }>(endpoint, deploymentQuery);

  return result.deployment;
}

export interface Account {
  address: string;
  mnemonic: string;
  publicKey: string;
  privateKey: string;
}

const createAccountMutation = gql`
  mutation {
    account: createWallet {
      address
      mnemonic
      publicKey
      privateKey
    }
  }
`;

export async function createAccount(endpoint: string) {
  const result = await request<{
    account: Account;
  }>(endpoint, createAccountMutation);

  return result.account;
}
