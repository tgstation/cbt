/**
 * @file
 * @copyright 2020 Aleksej Komarov
 * @license MIT
 */


import { Effects } from './effects';
import * as Flags from './flags';
import { Task } from './task';
import { stat } from './fs';
import { exec } from './process';

const Commands = {
  stat,
  exec,
};

export {
  Commands,
  Effects,
  Flags,
  Task,
};
