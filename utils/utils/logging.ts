import { log } from '@graphprotocol/graph-ts';

// There currently seems to be a race conditions, critical errors are not logged
export function logCritical(message: string, parameters: string[] = new Array<string>()): void {
  log.warning(message, parameters);
  log.critical(message, parameters);
}
