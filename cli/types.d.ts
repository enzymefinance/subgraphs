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
    sources: DataSourceDeclaration[];
    templates?: DataSourceTemplateDeclaration[];
    abis?: AbiDeclaration[];
  }

  export interface Contexts<TVariables> {
    [context: string]: Context<TVariables>;
  }

  export interface Template {
    template: string;
    destination: string;
  }

  export type Configurator<TVariables> = (variables: TVariables) => ManifestValues;

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
    name: string;
    abi: string;
    file: string;
    address?: string;
    block?: number;
    events?: EventHandlerDeclaration[];
    calls?: CallHandlerDeclaration[];
  }

  export interface DataSourceTemplateDeclaration {
    name: string;
    abi: string;
    file: string;
    events?: EventHandlerDeclaration[];
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
