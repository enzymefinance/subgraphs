import { request, gql } from 'graphql-request';
import { Fund } from './fetchFund';

export interface Redemption {
  id: string;
  transaction: string;
  shares: number;
  kind: string;
}

const redemptionQuery = gql`
  query Redemption($transaction: String!, $block: Int!) {
    sharesRedemptions(where: { transaction: $transaction }, block: { number: $block }) {
      id
      transaction
      shares
      kind
    }
  }
`;

export async function fetchRedemption(endpoint: string, transaction: string, block: number) {
  const result = await request<{
    sharesRedemptions: Redemption[];
  }>(endpoint, redemptionQuery, {
    transaction,
    block,
  });

  return result.sharesRedemptions[0];
}
