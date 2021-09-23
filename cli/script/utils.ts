import type {
  DataSourceDeclaration,
  DataSourceUserDeclaration,
  DataSourceTemplateDeclaration,
  DataSourceTemplateUserDeclaration,
  EventHandlerDeclaration,
  EventHandlerUserDeclaration,
  SdkUserDeclaration,
  SdkAbiDeclaration,
} from '@enzymefinance/subgraph-cli';
import { utils } from 'ethers';
import { ParamType } from 'ethers/lib/utils';
import path from 'path';
import fs from 'fs';
import { AbiDeclarationType } from './types';

export function formatEventJson(event: utils.EventFragment) {
  return {
    anonymous: event.anonymous,
    inputs: event.inputs.map((input) => ({
      indexed: input.indexed,
      internalType: input.type,
      name: input.name ?? '',
      type: input.type,
    })),
    name: event.name,
    type: 'event',
  };
}
export function formatFunctionJson(fn: utils.FunctionFragment) {
  return {
    inputs:
      fn.inputs?.map((output) => ({
        internalType: output.type,
        name: output.name ?? '',
        type: output.type,
      })) ?? [],
    name: fn.name,
    outputs:
      fn.outputs?.map((output) => ({
        internalType: output.type,
        name: output.name ?? '',
        type: output.type,
      })) ?? [],
    stateMutability: fn.stateMutability,
    type: 'function',
  };
}

function formatParams(params: ParamType[]) {
  return params.map((param) => `${param.indexed ? 'indexed ' : ''}${param.type}`).join(',');
}

export function eventDeclaration(input: EventHandlerUserDeclaration): EventHandlerDeclaration {
  const fragment = typeof input === 'string' ? utils.EventFragment.fromString(input) : input;
  const handler = `handle${fragment.name}`;
  const output = `${fragment.name}(${formatParams(fragment.inputs)})`;

  return { event: output, fragment, handler };
}

function resolveUserDefinedPath(input: string, root: string): string {
  try {
    const absolutePath = input.startsWith('/') ? input : path.join(root, input);
    if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
      return absolutePath;
    }

    return require.resolve(input);
  } catch (e) {
    throw new Error(`Failed to resolve user-defined path ${input} at ${root}.`);
  }
}

function loadAbiAtPath(path: string) {
  try {
    return new utils.Interface(require(path));
  } catch (e) {
    throw new Error(`Failed to load abi at path ${path}`);
  }
}

function sourceOrTemplateDeclaration(input: DataSourceUserDeclaration, root: string): DataSourceDeclaration;
function sourceOrTemplateDeclaration(
  input: DataSourceTemplateUserDeclaration,
  root: string,
): DataSourceTemplateDeclaration;
function sourceOrTemplateDeclaration(
  input: DataSourceUserDeclaration | DataSourceTemplateUserDeclaration,
  root: string,
): DataSourceDeclaration | DataSourceTemplateDeclaration {
  const abiPath = input.abi ? input.abi : `abis${input.version ? `/v${input.version}` : ''}/${input.name}.json`;
  const abiPathAbsolute = resolveUserDefinedPath(abiPath, root);
  const abiInterface = loadAbiAtPath(abiPathAbsolute);
  const abiEvents = Object.values(abiInterface.events);

  const mappingsFile = input.file ?? `mappings${input.version ? '/v' + input.version : ''}/${input.name}.ts`;

  // Extract and validate the list of specified event handlers.
  const eventList = (typeof input.events === 'function' ? input.events(abiInterface) : input.events) ?? abiEvents;
  const eventHandlerDeclarations = eventList.map((item) => eventDeclaration(item));
  const eventHandlerFragments = eventHandlerDeclarations.map((item) => item.fragment);
  const availableEventSignatures = abiEvents.map((event: utils.EventFragment) => event.format('minimal'));
  const invalidEventSignatures = eventHandlerFragments.filter(
    (item) => !availableEventSignatures.includes(item.format('minimal')),
  );

  if (invalidEventSignatures.length) {
    const a = invalidEventSignatures.map((item) => item.format('full').substr(6)).join('\n');
    const b = availableEventSignatures.map((item) => item.substr(6)).join('\n');

    console.error(`Invalid events:\n\n${a}\n\nAvailable events:\n\n${b}\n`);
    process.exit(1);
  }

  return {
    name: `${input.name}${input.version ?? ''}DataSource`,
    file: mappingsFile,
    events: eventHandlerDeclarations,
    abi: {
      type: AbiDeclarationType.EVENTS,
      name: `${input.name}${input.version ?? ''}Events`,
      file: `generated/abis/events/${input.name}${input.version ?? ''}Events.json`,
      events: eventHandlerFragments,
      interface: abiInterface,
    },
  };
}

export function sourceDeclaration(source: DataSourceUserDeclaration, root: string): DataSourceDeclaration {
  const baseDeclaration = sourceOrTemplateDeclaration(source, root);

  return {
    ...baseDeclaration,
    ...(source.address ? { address: source.address } : undefined),
    ...(source.block ? { block: source.block } : undefined),
  };
}

export function templateDeclaration(
  template: DataSourceTemplateUserDeclaration,
  root: string,
): DataSourceTemplateDeclaration {
  return sourceOrTemplateDeclaration(template, root);
}

export function sdkDeclaration(sdk: SdkUserDeclaration, root: string): SdkAbiDeclaration {
  const abis = Object.entries(sdk.abis as any).reduce((carry, [name, file]) => {
    const abiPathAbsolute = resolveUserDefinedPath(file as string, root);
    const abiInterface = loadAbiAtPath(abiPathAbsolute);
    return { ...carry, [name]: abiInterface };
  }, {} as Record<string, utils.Interface>);

  return {
    type: AbiDeclarationType.SDK,
    name: `${sdk.name}Sdk`,
    file: `generated/abis/sdks/${sdk.name}Sdk.json`,
    functions: typeof sdk.functions === 'function' ? sdk.functions(abis) : sdk.functions,
    interfaces: abis,
  };
}
