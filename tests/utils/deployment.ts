export interface Deployment {
  dispatcher: string;
  fundDeployer: string;
  mlnToken: string;
  wethToken: string;
  managementFee: string;
  performanceFee: string;
  entranceRateDirectFee: string;
  exitRateDirectFee: string;
  allowedAdapterIncomingAssetsPolicy: string;
  allowedAdaptersPolicy: string;
  allowedAssetsForRedemptionPolicy: string;
  allowedDepositRecipientsPolicy: string;
  allowedExternalPositionTypesPolicy: string;
  allowedSharesTransferRecipientsPolicy: string;
  cumulativeSlippageTolerancePolicy: string;
  guaranteedRedemptionPolicy: string;
  minMaxInvestmentPolicy: string;
  onlyUntrackDustOrPricelessAssetsPolicy: string;
}

export const deployment: Deployment = {
  dispatcher: '0xC48f7A682FAb8216cf475e6D269f447c54396cb4',
  fundDeployer: '0xdc7Fcff86385A86A9BB29472C9165f77b96DDAC8',
  mlnToken: '0x90580375f495140FA86d76CB26149418c88140f7',
  wethToken: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
  managementFee: '0xf8D15D2785c943dd7bfA80EFA85270e263e1c023',
  performanceFee: '0x4182B8d416e47e01892eE43b376d19C542833aB9',
  entranceRateDirectFee: '0x2D0019845670305cD7D4Df9a4C05c2FBc2691952',
  exitRateDirectFee: '0x0a8bc8360ada4274e01516Ddf2909c805f54E5B4',
  allowedAdapterIncomingAssetsPolicy: '0xF507b2bd15b5d5c50c85Dff4a7FECC06254446cd',
  allowedAdaptersPolicy: '0x4595758D58e3AA35E8Ad3f6ACA6d1cC025f6EaF1',
  allowedAssetsForRedemptionPolicy: '0x8107c9082799deb74cb14d950F5e485EA84F700a',
  allowedDepositRecipientsPolicy: '0x07F9A4fEd8c32E1589B88b72deBd9F5123F46ad1',
  allowedExternalPositionTypesPolicy: '0x2277dc8C4fC448Edff5C2A3Eaf993DFa0d7f510d',
  allowedSharesTransferRecipientsPolicy: '0x0B02b1366EdbA995447CB45625153bfE26fA7ab8',
  cumulativeSlippageTolerancePolicy: '0xf732EF794D1Ad3b69316ba38C617F7527eBD4fA4',
  guaranteedRedemptionPolicy: '0xb33bE98d6E0a094F4eD79c1040cd90F1a90328b3',
  minMaxInvestmentPolicy: '0x1dCC1cf27280d33B513Ffd39E816472f62f9a7Ec',
  onlyUntrackDustOrPricelessAssetsPolicy: '0xb8251cedD51C6945806520439FAd5543b6805fd1',
};
