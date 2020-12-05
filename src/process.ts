/**
 * @file
 * @copyright 2020 Aleksej Komarov
 * @license MIT
 */

import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { resolve as resolvePath } from 'path';
import { stat } from './fs';

const children = new Set<ChildProcessWithoutNullStreams>();

const trap = (signals, handler) => {
  let readline;
  if (process.platform === 'win32') {
    readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  for (const signal of signals) {
    if (signal === 'EXIT') {
      process.on('exit', () => handler(signal));
      continue;
    }
    if (readline) {
      readline.on('SIG' + signal, () => handler(signal));
    }
    process.on('SIG' + signal, () => handler(signal));
  }
};

trap(['EXIT', 'BREAK', 'HUP', 'INT', 'TERM', 'KILL'], signal => {
  if (signal !== 'EXIT') {
    console.log('Received', signal);
  }
  for (const child of children) {
    child.kill('SIGTERM');
    children.delete(child);
    console.log('killed child process');
  }
  if (signal !== 'EXIT') {
    process.exit(1);
  }
});

class ExitError extends Error {
  code: number;
}

export const exec = (executable, ...args) => {
  return new Promise((resolve, reject) => {
    // If executable exists relative to the current directory,
    // use that executable, otherwise spawn should fall back to
    // running it from PATH.
    if (stat(executable)) {
      executable = resolvePath(executable);
    }
    const child = spawn(executable, args);
    children.add(child);
    child.stdout.on('data', data => {
      process.stdout.write(data);
    });
    child.stderr.on('data', data => {
      process.stderr.write(data);
    });
    child.stdin.end();
    child.on('exit', code => {
      children.delete(child);
      if (code !== 0) {
        const error = new ExitError('Process exited with code: ' + code);
        error.code = code;
        reject(error);
      }
      else {
        resolve(code);
      }
    });
  });
};
