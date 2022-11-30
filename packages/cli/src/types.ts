import { utils } from 'ethers';

export enum AbiDeclarationType {
  'EVENTS',
  'SDK',
}

export interface Context<TVariables> {
  name: string;
  network: string;
  variables: TVariables;
  local?: boolean;
  node?: string;
  ipfs?: string;
}

export interface Configuration {
  sources: DataSourceUserDeclaration[];
  templates?: DataSourceTemplateUserDeclaration[];
  sdks?: SdkUserDeclaration[];
}

export interface ManifestValues {
  network: string;
  sources: DataSourceDeclaration[];
  templates?: DataSourceTemplateDeclaration[];
  sdks?: SdkAbiDeclaration[];
}

export interface Contexts<TVariables> {
  [context: string]: Context<TVariables>;
}

export interface Template {
  template: string;
  destination: string;
}

export type Configurator<TVariables> = (variables: TVariables) => Configuration;

export type EventHandlerUserDeclaration = string | utils.EventFragment;
export interface EventHandlerDeclaration {
  event: string;
  handler: string;
  fragment: utils.EventFragment;
}

export interface AbiDeclaration {
  type: AbiDeclarationType;
  name: string;
  file: string;
}

export interface EventsAbiDeclaration extends AbiDeclaration {
  type: AbiDeclarationType.EVENTS;
  events: utils.EventFragment[];
  interface: utils.Interface;
}

export interface SdkAbiDeclaration extends AbiDeclaration {
  type: AbiDeclarationType.SDK;
  functions: utils.FunctionFragment[];
  interfaces: Record<string, utils.Interface>;
}

export interface DataSourceDeclaration {
  name: string;
  file: string;
  abi: EventsAbiDeclaration;
  events: EventHandlerDeclaration[];
  address?: string;
  block?: number;
}

export interface DataSourceUserDeclaration {
  name: string;
  abi?: string;
  file?: string;
  version?: string | number;
  address?: string;
  block?: number;
  events?: ((abi: utils.Interface) => EventHandlerUserDeclaration[]) | EventHandlerUserDeclaration[];
}

export interface DataSourceTemplateDeclaration {
  name: string;
  file: string;
  abi: EventsAbiDeclaration;
  events: EventHandlerDeclaration[];
}

export interface DataSourceTemplateUserDeclaration {
  name: string;
  abi?: string;
  file?: string;
  version?: string | number;
  events?: ((abi: utils.Interface) => EventHandlerUserDeclaration[]) | EventHandlerUserDeclaration[];
}

export interface SdkUserDeclaration {
  name: string;
  abis?: Record<string, string>;
  functions: ((abis: Record<string, utils.Interface>) => utils.FunctionFragment[]) | utils.FunctionFragment[];
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
