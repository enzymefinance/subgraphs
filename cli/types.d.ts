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
    abis: AbiDeclaration[];
    sources: DataSourceDeclaration[];
    templates: DataSourceTemplateDeclaration[];
  }

  export interface Contexts<TVariables> {
    [context: string]: Context<TVariables>;
  }

  export type ConfiguratorCallback<TVariables> = (variables: TVariables) => SubgraphManifestValues;
  export type Configurator<TVariables> = (
    contexts: Contexts<TVariables>,
    callback: ConfiguratorCallback<TVariables>,
  ) => Environment<TVariables>;

  export interface AbiDeclaration {
    name: string;
    file: string;
  }

  export interface EventHandlerDeclaration {
    event: string;
    handler: string;
  }

  export interface CallHandlerDeclaration {
    call: string;
    handler: string;
  }

  export interface DataSourceDeclaration {
    address?: string;
    block?: number;
    file: string;
    events: EventHandlerDeclaration[];
    calls?: CallHandlerDeclaration[];
  }

  export interface DataSourceTemplateDeclaration {
    file: string;
    events: EventHandlerDeclaration[];
    calls?: CallHandlerDeclaration[];
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
