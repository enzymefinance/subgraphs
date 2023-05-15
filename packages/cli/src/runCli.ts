import path from 'path';
import { spawn } from 'child_process';

function runCommand(
  command: string,
  args: string[] = [],
  cwd = process.cwd(),
): Promise<
  [
    number | null, // exitCode
    string, // stdout
    string, // stderr
  ]
> {
  // Make sure to set an absolute working directory
  cwd = cwd[0] === '/' ? cwd : path.resolve(__dirname, cwd);

  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const childProcess = spawn(command, args, { cwd });

    console.log({ cwd, command, args, cli: `${command} ${args.join(' ')}` });

    childProcess.on('error', (error) => {
      reject(error);
    });

    childProcess.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    childProcess.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    childProcess.on('exit', (exitCode) => {
      resolve([exitCode, stdout, stderr]);
    });
  });
}

export function runGraphCli(args: string[], cwd?: string) {
  // Resolve the path to graph.js
  const graphCli = path.join(__dirname, '..', 'node_modules', '@graphprotocol', 'graph-cli', 'bin', 'run');

  return runCommand(graphCli, args, cwd);
}
