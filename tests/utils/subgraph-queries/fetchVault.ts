import { gql, request } from 'graphql-request';

export interface Vault {
  id: string;
  name: string;
}

const vaultQuery = gql`
  query Vault($id: ID!, $block: Int!) {
    vault(id: $id, block: { number: $block }) {
      id
      name
    }
  }
`;

export async function fetchFund(endpoint: string, id: string, block: number) {
  const result = await request<{
    vault: Vault;
  }>(endpoint, vaultQuery, {
    id,
    block,
  });

  return result.vault;
}
