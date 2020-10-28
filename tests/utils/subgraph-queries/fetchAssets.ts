import { gql, request } from 'graphql-request';

export interface Asset {
  id: string;
  name: string;
  symbol: string;
}

const assetsQuery = gql`
  query Fund {
    assets {
      id
      name
      symbol
    }
  }
`;

export async function fetchAssets(endpoint: string) {
  const result = await request<{
    assets: Asset[];
  }>(endpoint, assetsQuery);

  return result.assets;
}
