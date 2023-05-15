import path from 'path';
import { spawn } from 'child_process';

// inspired by https://github.com/graphprotocol/graph-tooling/blob/f9f0b14bc88241aa76da25568baa9343a0d66b4d/packages/cli/tests/cli/util.ts#L92
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

    childProcess.on('error', (error) => {
      console.error(error);
      reject(error);
    });

    childProcess.stdout.on('data', (data: Buffer) => {
      console.log(data.toString());
      stdout += data.toString();
    });

    childProcess.stderr.on('data', (data: Buffer) => {
      console.log(data.toString());

      stderr += data.toString();
    });

    childProcess.on('exit', (exitCode) => {
      console.log('exit code', exitCode);

      resolve([exitCode, stdout, stderr]);
    });
  });
}

// inspired by https://github.com/graphprotocol/graph-tooling/blob/f9f0b14bc88241aa76da25568baa9343a0d66b4d/packages/cli/tests/cli/util.ts#L129
export function runGraphCli(args: string[], cwd?: string) {
  const graphCli = path.join(__dirname, '..', 'node_modules', '@graphprotocol', 'graph-cli', 'bin', 'run');

  return runCommand(graphCli, args, cwd);
}
