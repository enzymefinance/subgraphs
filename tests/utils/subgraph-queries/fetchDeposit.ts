import { gql, request } from 'graphql-request';
import { Vault } from './fetchVault';

export interface Deposit {
  id: string;
  vault: Vault;
  shares: number;
  depositor: {
    id: string;
    isDepositor: boolean;
  };
}

const investmentQuery = gql`
  query Deposit($id: ID!, $block: BigInt!) {
    deposit(id: $id, block: { number: $block }) {
      id
      vault {
        id
        name
      }
      shares
      depositor {
        id
        isDepositor
      }
    }
  }
`;

export async function fetchDeposit(endpoint: string, id: string, block: number) {
  const result = await request<{
    deposit: Deposit;
  }>(endpoint, investmentQuery, {
    id,
    block,
  });

  return result.deposit;
}
