/**
 * @file
 * @copyright 2020 Aleksej Komarov
 * @license MIT
 */

import { BaseEffect, BuildEffect, DependsEffect, ProvidesEffect } from './effects';
import * as Flags from './flags';
import { fileCompare } from './fs';

export const Task = (name, effects: BaseEffect[]) => {
  const deps = [];
  const runnables = [];
  // Sort effects into their own piles
  for (const effect of effects) {
    if (effect.type === 'depends') {
      deps.push({
        flags: (effect as DependsEffect).flags | Flags.SOURCE,
        path: (effect as DependsEffect).path,
      });
    }
    else if (effect.type === 'provides') {
      deps.push({
        flags: (effect as ProvidesEffect).flags | Flags.TARGET,
        path: (effect as ProvidesEffect).path,
      });
    }
    else {
      runnables.push(effect);
    }
  }
  // Create a task object
  return {
    name,
    run: async () => {
      // Consider dependencies first, and skip the task if it
      // doesn't need a rebuild.
      if (deps.length > 0) {
        const needsRebuild = fileCompare(deps);
        if (!needsRebuild) {
          console.warn(` => Skipping '${name}'`);
          return;
        }
      }
      console.warn(` => Starting '${name}'`);
      const startedAt = Date.now();
      for (const effect of runnables) {
        if (effect.type === 'build') {
          await (effect as BuildEffect).script();
        }
      }
      const time = ((Date.now() - startedAt) / 1000) + 's';
      console.warn(` => Finished '${name}' in ${time}`);
    },
  };
};
