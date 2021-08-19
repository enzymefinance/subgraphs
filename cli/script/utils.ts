import {
  AbiDeclaration,
  AbiDeclarationLike,
  CallHandlerDeclaration,
  CallHandlerDeclarationLike,
  DataSourceDeclaration,
  DataSourceDeclarationLike,
  DataSourceTemplateDeclaration,
  DataSourceTemplateDeclarationLike,
  EventHandlerDeclaration,
  EventHandlerDeclarationLike,
} from '@enzymefinance/subgraph-cli';
import path from 'path';

export function abi(abi: AbiDeclarationLike, root: string): AbiDeclaration {
  const file = typeof abi === 'string' ? abi : abi.file;
  const name =
    typeof abi === 'string' ? `${path.basename(file, '.json')}Contract` : `${abi.name}${abi.version ?? ''}Contract`;
  const relative = path.relative(root, file.startsWith('.') ? file : require.resolve(file));

  return { name, file: relative };
}

export function event(event: EventHandlerDeclarationLike): EventHandlerDeclaration {
  if (typeof event !== 'string') {
    return event;
  }

  const [handler] = event.split('(', 1).map((event) => `handle${event}`);
  return { event, handler };
}

export function call(call: CallHandlerDeclarationLike): CallHandlerDeclaration {
  if (typeof call !== 'string') {
    return call;
  }

  const [handler] = call.split('(', 1).map((call) => `handle${call}`);
  return { call, handler };
}

export function source(source: DataSourceDeclarationLike): DataSourceDeclaration {
  const events = source.events?.map((item) => event(item));
  const calls = source.calls?.map((item) => call(item));
  const address = source.address;
  const block = source.block;

  return {
    name: `${source.name}${source.version ?? ''}DataSource`,
    abi: source.abi ?? `${source.name}${source.version ?? ''}Contract`,
    file: source.file ?? `mappings${source.version ? '/v' + source.version : ''}/${source.name}.ts`,
    ...(events ? { events } : undefined),
    ...(calls ? { calls } : undefined),
    ...(address ? { address } : undefined),
    ...(block ? { block } : undefined),
  };
}

export function template(template: DataSourceTemplateDeclarationLike): DataSourceTemplateDeclaration {
  const events = template.events?.map((item) => event(item));
  const calls = template.calls?.map((item) => call(item));

  return {
    name: `${template.name}${template.version ?? ''}DataSource`,
    abi: template.abi ?? `${template.name}${template.version ?? ''}Contract`,
    file: template.file ?? `mappings${template.version ? '/v' + template.version : ''}/${template.name}.ts`,
    ...(events ? { events } : undefined),
    ...(calls ? { calls } : undefined),
  };
}
