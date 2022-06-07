import { Address, dataSource } from '@graphprotocol/graph-ts';
import { createUniswapV3LiquidityPositionChange } from '../../entities/UniswapV3LiquidityPosition';
import { createUniswapV3Nft, useUniswapV3Nft } from '../../entities/UniswapV3Nft';
import { useVault } from '../../entities/Vault';
import { ProtocolSdk } from '../../generated/contracts/ProtocolSdk';
import { NFTPositionAdded, NFTPositionRemoved } from '../../generated/contracts/UniswapV3LiquidityPositionLib4Events';

export function handleNFTPositionAdded(event: NFTPositionAdded): void {
  // We are listening to this event to get the nftId, and to save the parameters of the nft
  let externalPositionContract = ProtocolSdk.bind(event.address);
  let nonFungiblePositionManagerAddress = externalPositionContract.getNonFungibleTokenManager();

  let nft = createUniswapV3Nft(event.params.tokenId, event.address, nonFungiblePositionManagerAddress);
  let vault = useVault(dataSource.context().getString('vaultProxy'));

  // We are tracking the position change in this event because it contains the nftId
  createUniswapV3LiquidityPositionChange(event.address, nft, null, nft.liquidity, 'Mint', vault, event);
}

export function handleNFTPositionRemoved(event: NFTPositionRemoved): void {
  let nft = useUniswapV3Nft(event.params.tokenId);
  nft.externalPosition = null;
  nft.save();
}
