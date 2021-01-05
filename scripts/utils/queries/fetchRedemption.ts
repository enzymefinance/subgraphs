import { request, gql } from 'graphql-request';
import { Fund } from './fetchFund';

export interface Redemption {
  id: string;
  transaction: {
    id: string;
  };
  shares: number;
}

const redemptionQuery = gql`
  query Redemption($transaction: String!, $block: Int!) {
    sharesRedeemedEvents(where: { transaction: $transaction }, block: { number: $block }) {
      id
      transaction {
        id
      }
      shares
    }
  }
`;

export async function fetchRedemption(endpoint: string, transaction: string, block: number) {
  const result = await request<{
    sharesRedeemedEvents: Redemption[];
  }>(endpoint, redemptionQuery, {
    transaction,
    block,
  });

  return result.sharesRedeemedEvents[0];
}
