// Start the standalone production artifact with the same static files as Docker.
import { cpSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

const server = '.next/standalone/server.js';
if (!existsSync(server)) throw new Error('Run npm run build before browser tests');
cpSync('public', '.next/standalone/public', { recursive: true });
cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
const child = spawn(process.execPath, [server], { stdio: 'inherit', env: process.env });
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => { process.exitCode = code ?? 1; });
