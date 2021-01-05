import { gql, request } from 'graphql-request';

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  uniswapV2PoolAssetDetail: {
    token0: Asset;
    token1: Asset;
  };
}

const assetsQuery = gql`
  query Fund {
    assets(first: 1000) {
      id
      name
      symbol
      uniswapV2PoolAssetDetail {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
    }
  }
`;

export async function fetchAssets(endpoint: string) {
  const result = await request<{
    assets: Asset[];
  }>(endpoint, assetsQuery);

  return result.assets;
}
