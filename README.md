# CBT

> Common Build Tool

This is a tool for creating generic build scripts, that rebuild only
if sources are newer than their targets.

## Usage

```js
#!/usr/bin/env node
const { Task, Flags, Effects, Commands } = require('./cbt');
const { depends, provides, build } = Effects;
const { exec } = Commands;

const taskTgui = Task('tgui', [
  depends(Flags.GLOB, 'tgui/.yarn/releases/*'),
  depends(Flags.FILE, 'tgui/yarn.lock'),
  depends(Flags.FILE, 'tgui/package.json'),
  depends(Flags.GLOB, 'tgui/packages/**/*.js'),
  provides(Flags.GLOB, 'tgui/public/*.(bundle|chunk).js'),
  build(async () => {
    await exec('powershell.exe',
      '-NoLogo', '-ExecutionPolicy', 'Bypass',
      '-File', 'tgui/bin/tgui.ps1');
  }),
]);

const taskDm = Task('dm', [
  build(async () => {
    await exec('dm.exe', 'tgstation.dme');
  }),
]);

const runTasks = async () => {
  await taskTgui.run();
  await taskDm.run();
  process.exit();
};

runTasks();
```

## How To Build

Change directory to this folder.

Run the following:

```
yarn install
yarn build
```

Copy the resulting `cbt.js` file to where you want to use it.

## License

Source code is available under the **MIT** license.

The Authors retain all copyright to their respective work here submitted.
