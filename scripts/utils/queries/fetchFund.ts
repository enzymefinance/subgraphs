import { request, gql } from 'graphql-request';

export interface Fund {
  id: string;
  name: string;
}

const fundQuery = gql`
  query Fund($id: ID!, $block: Int!) {
    fund(id: $id, block: { number: $block }) {
      id
      name
    }
  }
`;

export async function fetchFund(endpoint: string, id: string, block: number) {
  const result = await request<{
    fund: Fund;
  }>(endpoint, fundQuery, {
    id,
    block,
  });

  return result.fund;
}
