import { arrayUnique, toBigDecimal, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Address, ethereum, BigInt, log } from '@graphprotocol/graph-ts';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import { ensureComptroller } from '../../entities/Comptroller';
import { trackTrade } from '../../entities/Trade';
import { useVault } from '../../entities/Vault';
import {
  CallOnIntegrationExecutedForFund,
  ValidatedVaultProxySetForFund,
} from '../../generated/contracts/IntegrationManager4Events';
import { Asset, AssetAmount } from '../../generated/schema';
import { release4Addresses, balancerMinterAddress, curveMinterAddress } from '../../generated/addresses';
import { claimRewardsSelector } from '../../utils/integrationSelectors';
import { ProtocolSdk } from '../../generated/contracts/ProtocolSdk';
import { ExternalSdk } from '../../generated/contracts/ExternalSdk';

export function handleCallOnIntegrationExecutedForFund(event: CallOnIntegrationExecutedForFund): void {
  let comptroller = ensureComptroller(event.params.comptrollerProxy, event);
  if (comptroller.vault == null) {
    return;
  }

  let vault = useVault(comptroller.vault as string);
  let integrationSelector = event.params.selector.toHexString();

  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));
  let incomingAssets = event.params.incomingAssets.map<Asset>((asset) => ensureAsset(asset));
  let outgoingAssets = event.params.spendAssets.map<Asset>((asset) => ensureAsset(asset));

  let incomingAssetAmounts: AssetAmount[] = new Array<AssetAmount>();
  let incomingAmounts = event.params.incomingAssetAmounts;
  for (let i = 0; i < incomingAmounts.length; i++) {
    let amount = toBigDecimal(incomingAmounts[i], incomingAssets[i].decimals);
    let assetAmount = createAssetAmount(incomingAssets[i], amount, denominationAsset, 'trade/incoming', event);
    incomingAssetAmounts = incomingAssetAmounts.concat([assetAmount]);
  }

  let outgoingAssetAmounts: AssetAmount[] = new Array<AssetAmount>();
  let outgoingAmounts = event.params.spendAssetAmounts;
  for (let i = 0; i < outgoingAmounts.length; i++) {
    let amount = toBigDecimal(outgoingAmounts[i], outgoingAssets[i].decimals);
    let assetAmount = createAssetAmount(outgoingAssets[i], amount, denominationAsset, 'trade/outgoing', event);
    outgoingAssetAmounts = outgoingAssetAmounts.concat([assetAmount]);
  }

  // Claim rewards doesn't emit incoming assets. In order to be able to display information, on the activty page, about claimed asset we decode the call action args.
  if (
    [
      release4Addresses.convexCurveLpStakingAdapterAddress,
      release4Addresses.auraBalancerV2LpStakingAdapterAddress,
    ].includes(event.params.adapter) &&
    integrationSelector == claimRewardsSelector
  ) {
    let decoded = ethereum.decode('(address)', event.params.integrationData);

    if (decoded == null) {
      return;
    }

    let tuple = decoded.toTuple();

    let stakingWrapper = tuple[0].toAddress();

    let stakingWrapperContract = ProtocolSdk.bind(stakingWrapper);

    let rewardTokensAddresses = stakingWrapperContract.getRewardTokens();

    for (let i = 0; i < rewardTokensAddresses.length; i++) {
      let rewardAsset = ensureAsset(rewardTokensAddresses[i]);

      incomingAssets = arrayUnique<Asset>(incomingAssets.concat([rewardAsset]));
    }
  }

  // Claim rewards doesn't emit incoming assets. In order to be able to display information, on the activty page, about claimed asset we decode the call action args.
  if (
    [release4Addresses.balancerV2LiquidityAdapterAddress, release4Addresses.curveLiquidityAdapterAddress].includes(
      event.params.adapter,
    ) &&
    integrationSelector == claimRewardsSelector
  ) {
    let decoded = ethereum.decode('(address)', event.params.integrationData);

    if (decoded == null) {
      return;
    }

    let tuple = decoded.toTuple();

    let curveLiquidityGaugeV2Address = tuple[0].toAddress();

    let curveLiquidityGaugeV2Contract = ExternalSdk.bind(curveLiquidityGaugeV2Address);

    let curveGaugeV2MaxRewards = 8;

    for (let i = 0; i < curveGaugeV2MaxRewards; i++) {
      let rewardAssetAddress = curveLiquidityGaugeV2Contract.reward_tokens(BigInt.fromI32(i));

      if (rewardAssetAddress.equals(ZERO_ADDRESS)) {
        break;
      } else {
        let rewardAsset = ensureAsset(rewardAssetAddress);
        incomingAssets = arrayUnique<Asset>(incomingAssets.concat([rewardAsset]));
      }
    }

    //  Curve Minter exist only on Ethereum mainnet
    if (
      curveMinterAddress.notEqual(ZERO_ADDRESS) &&
      release4Addresses.curveLiquidityAdapterAddress.equals(event.params.adapter)
    ) {
      let curveMinterContract = ExternalSdk.bind(curveMinterAddress);

      let rewardAssetAddress = curveMinterContract.token();

      let rewardAsset = ensureAsset(rewardAssetAddress);
      incomingAssets = arrayUnique<Asset>(incomingAssets.concat([rewardAsset]));
    }

    //  Balancer Minter exist only on Ethereum mainnet
    if (
      balancerMinterAddress.notEqual(ZERO_ADDRESS) &&
      release4Addresses.balancerV2LiquidityAdapterAddress.equals(event.params.adapter)
    ) {
      let balancerMinterContract = ExternalSdk.bind(balancerMinterAddress);

      let rewardAssetAddress = balancerMinterContract.getBalancerToken();

      let rewardAsset = ensureAsset(rewardAssetAddress);
      incomingAssets = arrayUnique<Asset>(incomingAssets.concat([rewardAsset]));
    }
  }

  trackTrade(
    vault,
    event.params.adapter,
    integrationSelector,
    incomingAssets,
    outgoingAssets,
    incomingAssetAmounts,
    outgoingAssetAmounts,
    event,
  );
}

export function handleValidatedVaultProxySetForFund(event: ValidatedVaultProxySetForFund): void {}
