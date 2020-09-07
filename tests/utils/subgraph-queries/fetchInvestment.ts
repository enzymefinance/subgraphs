import { request, gql } from 'graphql-request';
import { Fund } from './fetchFund';

export interface Investment {
  id: string;
  fund: Fund;
  shares: number;
  investor: {
    id: string;
    investor: boolean;
  };
}

const investmentQuery = gql`
  query Investment($id: ID!, $block: Int!) {
    investment(id: $id, block: { number: $block }) {
      id
      fund {
        id
        name
      }
      shares
      investor {
        id
        investor
      }
    }
  }
`;

export async function fetchInvestment(endpoint: string, id: string, block: number) {
  const result = await request<{
    investment: Investment;
  }>(endpoint, investmentQuery, {
    id,
    block,
  });

  return result.investment;
}
