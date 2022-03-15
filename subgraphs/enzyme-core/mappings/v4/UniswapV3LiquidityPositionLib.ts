import { createUniswapV3Nft, useUniswapV3Nft } from '../../entities/UniswapV3Nft';
import { ProtocolSdk } from '../../generated/contracts/ProtocolSdk';
import { NFTPositionAdded, NFTPositionRemoved } from '../../generated/contracts/UniswapV3LiquidityPositionLib4Events';

export function handleNFTPositionAdded(event: NFTPositionAdded): void {
  // We are listening to this event to get the nftId, and to save the parameters of the nft
  let externalPositionContract = ProtocolSdk.bind(event.address);
  let nonFungiblePositionManagerAddress = externalPositionContract.getNonFungibleTokenManager();

  createUniswapV3Nft(event.params.tokenId, event.address, nonFungiblePositionManagerAddress);
}

export function handleNFTPositionRemoved(event: NFTPositionRemoved): void {
  let nft = useUniswapV3Nft(event.params.tokenId);
  nft.externalPosition = null;
  nft.save();
}
