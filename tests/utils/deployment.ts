import axios, { AxiosResponse } from 'axios';

export interface DeploymentWithAssets {
  contracts: Deployment;
  assets: string[];
}

export interface Deployment {
  allowedAdapterIncomingAssetsPolicy: string;
  allowedAdaptersPolicy: string;
  allowedAssetsForRedemptionPolicy: string;
  allowedDepositRecipientsPolicy: string;
  allowedExternalPositionTypesPolicy: string;
  allowedSharesTransferRecipientsPolicy: string;
  assetFinalityResolver: string;
  comptrollerLib: string;
  cumulativeSlippageTolerancePolicy: string;
  depositWrapper: string;
  dispatcher: string;
  entranceRateBurnFee: string;
  entranceRateDirectFee: string;
  exitRateBurnFee: string;
  exitRateDirectFee: string;
  externalPositionFactory: string;
  externalPositionManager: string;
  feeManager: string;
  fundDeployer: string;
  gasRelayPaymasterFactory: string;
  globalConfigLib: string;
  globalConfigProxy: string;
  guaranteedRedemptionPolicy: string;
  integrationManager: string;
  managementFee: string;
  minMaxInvestmentPolicy: string;
  mlnToken: string;
  onlyUntrackDustOrPricelessAssetsPolicy: string;
  performanceFee: string;
  policyManager: string;
  protocolFeeReserveLib: string;
  protocolFeeReverseProxy: string;
  protocolFeeTracker: string;
  testnetTreasuryController: string;
  unpermissionedActionsWrapper: string;
  valueInterpreter: string;
  vaultLib: string;
  wethToken: string;
  //
  aaveAdapter: string;
  alphaHomoraV1Adapter: string;
  compoundAdapter: string;
  curveExchangeAdapter: string;
  curveLiquidityAaveAdapter: string;
  curveLiquidityEursAdapter: string;
  curveLiquiditySethAdapter: string;
  curveLiquidityStethAdapter: string;
  idleAdapter: string;
  kyberAdapter: string;
  paraSwapV4Adapter: string;
  synthetixAdapter: string;
  trackedAssetsAdapter: string;
  uniswapV2Adapter: string;
  yearnVaultV2Adapter: string;
  zeroExV2Adapter: string;
}

export async function fetchDeployment(endpoint: string) {
  const response: AxiosResponse<{ data: DeploymentWithAssets }> = await axios.get(endpoint);

  if (response.status !== 200) {
    console.error(`Failed to fetch deployment from ${endpoint}`);
  }

  return response.data.data;
}
