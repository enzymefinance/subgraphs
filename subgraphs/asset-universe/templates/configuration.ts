import { Address } from '@graphprotocol/graph-ts';

export let wethTokenAddress = Address.fromString('{{or wethTokenAddress "0x0000000000000000000000000000000000000000"}}');

export let testnetTreasuryControllerAddress = Address.fromString('{{or testnetConfiguration.treasuryController "0x0000000000000000000000000000000000000000"}}');

export let releaseV2Address = Address.fromString('{{or releaseConfiguration.v2.fundDeployer "0x0000000000000000000000000000000000000000"}}');
export let releaseV3Address = Address.fromString('{{or releaseConfiguration.v3.fundDeployer "0x0000000000000000000000000000000000000000"}}');
export let releaseV4Address = Address.fromString('{{or releaseConfiguration.v4.fundDeployer "0x0000000000000000000000000000000000000000"}}');

export let aavePriceFeedV2Address = Address.fromString('{{or releaseConfiguration.v2.aavePriceFeed "0x0000000000000000000000000000000000000000"}}');
export let alphaHomoraV1PriceFeedV2Address = Address.fromString('{{or releaseConfiguration.v2.alphaHomoraV1PriceFeed "0x0000000000000000000000000000000000000000"}}');
export let compoundPriceFeedV2Address = Address.fromString('{{or releaseConfiguration.v2.compoundPriceFeed "0x0000000000000000000000000000000000000000"}}');
export let curvePriceFeedV2Address = Address.fromString('{{or releaseConfiguration.v2.curvePriceFeed "0x0000000000000000000000000000000000000000"}}');
export let idlePriceFeedV2Address = Address.fromString('{{or releaseConfiguration.v2.idlePriceFeed "0x0000000000000000000000000000000000000000"}}');
export let lidoStethPriceFeedV2Address = Address.fromString('{{or releaseConfiguration.v2.lidoStethPriceFeed "0x0000000000000000000000000000000000000000"}}');
export let stakehoundEthPriceFeedV2Address = Address.fromString('{{or releaseConfiguration.v2.stakehoundEthPriceFeed "0x0000000000000000000000000000000000000000"}}');
export let synthetixPriceFeedV2Address = Address.fromString('{{or releaseConfiguration.v2.synthetixPriceFeed "0x0000000000000000000000000000000000000000"}}');
export let uniswapV2PoolPriceFeedV2Address = Address.fromString('{{or releaseConfiguration.v2.uniswapV2PoolPriceFeed "0x0000000000000000000000000000000000000000"}}');
export let wdgldPriceFeedV2Address = Address.fromString('{{or releaseConfiguration.v2.wdgldPriceFeed "0x0000000000000000000000000000000000000000"}}');

export let aavePriceFeedV3Address = Address.fromString('{{or releaseConfiguration.v3.aavePriceFeed "0x0000000000000000000000000000000000000000"}}');
export let alphaHomoraV1PriceFeedV3Address = Address.fromString('{{or releaseConfiguration.v3.alphaHomoraV1PriceFeed "0x0000000000000000000000000000000000000000"}}');
export let compoundPriceFeedV3Address = Address.fromString('{{or releaseConfiguration.v3.compoundPriceFeed "0x0000000000000000000000000000000000000000"}}');
export let curvePriceFeedV3Address = Address.fromString('{{or releaseConfiguration.v3.curvePriceFeed "0x0000000000000000000000000000000000000000"}}');
export let idlePriceFeedV3Address = Address.fromString('{{or releaseConfiguration.v3.idlePriceFeed "0x0000000000000000000000000000000000000000"}}');
export let lidoStethPriceFeedV3Address = Address.fromString('{{or releaseConfiguration.v3.lidoStethPriceFeed "0x0000000000000000000000000000000000000000"}}');
export let stakehoundEthPriceFeedV3Address = Address.fromString('{{or releaseConfiguration.v3.stakehoundEthPriceFeed "0x0000000000000000000000000000000000000000"}}');
export let synthetixPriceFeedV3Address = Address.fromString('{{or releaseConfiguration.v3.synthetixPriceFeed "0x0000000000000000000000000000000000000000"}}');
export let uniswapV2PoolPriceFeedV3Address = Address.fromString('{{or releaseConfiguration.v3.uniswapV2PoolPriceFeed "0x0000000000000000000000000000000000000000"}}');
export let wdgldPriceFeedV3Address = Address.fromString('{{or releaseConfiguration.v3.wdgldPriceFeed "0x0000000000000000000000000000000000000000"}}');
export let yearnVaultV2PriceFeedV3Address = Address.fromString('{{or releaseConfiguration.v3.yearnVaultV2PriceFeed "0x0000000000000000000000000000000000000000"}}');
