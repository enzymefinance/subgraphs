declare module '@enzymefinance/subgraph-cli' {
  export interface Context<TVariables> {
    name: string;
    network: string;
    variables: TVariables;
    local?: boolean;
    node?: string;
    ipfs?: string;
  }

  export interface ManifestValues {
    network: string;
    sources: DataSourceDeclarationLike[];
    templates?: DataSourceTemplateDeclarationLike[];
    abis?: AbiDeclarationLike[];
  }

  export interface Contexts<TVariables> {
    [context: string]: Context<TVariables>;
  }

  export interface Template {
    template: string;
    destination: string;
  }

  export type Configurator<TVariables> = (variables: TVariables) => Omit<ManifestValues, 'network'>;

  export type AbiDeclarationLike = AbiDeclaration | string;
  export interface AbiDeclaration {
    name: string;
    file: string;
  }

  export type EventHandlerDeclarationLike = EventHandlerDeclaration | string;
  export interface EventHandlerDeclaration {
    event: string;
    handler: string;
  }

  export type CallHandlerDeclarationLike = CallHandlerDeclaration | string;
  export interface CallHandlerDeclaration {
    call: string;
    handler: string;
  }

  export interface DataSourceDeclaration {
    name: string;
    abi: string;
    file: string;
    address?: string;
    block?: number;
    events?: EventHandlerDeclaration[];
    calls?: CallHandlerDeclaration[];
  }

  export interface DataSourceDeclarationLike extends DataSourceDeclaration {
    version?: string;
    abi?: string;
    file?: string;
    events?: EventHandlerDeclarationLike[];
    calls?: CallHandlerDeclarationLike[];
  }

  export interface DataSourceTemplateDeclaration {
    name: string;
    abi: string;
    file: string;
    events?: EventHandlerDeclaration[];
    calls?: CallHandlerDeclaration[];
  }

  export interface DataSourceTemplateDeclarationLike extends DataSourceTemplateDeclaration {
    abi?: string;
    file?: string;
    events?: EventHandlerDeclarationLike[];
    calls?: CallHandlerDeclarationLike[];
  }

  export interface Environment<TVariables> {
    name: string;
    network: string;
    local: boolean;
    node: string;
    ipfs: string;
    variables: TVariables;
    manifest: ManifestValues;
  }
}
