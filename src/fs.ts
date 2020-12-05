/**
 * @file
 * @copyright 2020 Aleksej Komarov
 * @license MIT
 */

import * as fs from 'fs';
import glob from 'glob';
import * as Flags from './flags';

class File {
  path: string;
  stat: any;

  constructor(path) {
    this.path = path;
    this.stat = null;
  }

  performStat() {
    this.stat = fs.statSync(this.path);
  }

  get mtime() {
    if (!this.stat) {
      this.performStat();
    }
    return this.stat.mtime;
  }
}

/**
 * If true, source is newer than target.
 */
export const fileCompare = nodes => {
  let toVisit = [...nodes];
  let bestSource = null;
  let bestTarget = null;
  while (toVisit.length > 0) {
    const node = toVisit.shift();
    if (node.flags & Flags.FILE) {
      const file = node.file || new File(node.path);
      if (node.flags & Flags.SOURCE) {
        if (!bestSource || file.mtime > bestSource.mtime) {
          bestSource = file;
        }
        continue;
      }
      else if (node.flags & Flags.TARGET) {
        if (!bestTarget || file.mtime < bestTarget.mtime) {
          bestTarget = file;
        }
        continue;
      }
    }
    if (node.flags & Flags.GLOB) {
      // Replace GLOB flag with FILE for the following nodes to visit.
      const fileFlags = node.flags & ~Flags.GLOB | Flags.FILE;
      // Expand the glob and only add paths that are safe to perform
      // the stat operation on.
      const unsafePaths = glob.sync(node.path, {
        strict: false,
        silent: true,
      });
      for (let path of unsafePaths) {
        try {
          const file = new File(path);
          file.performStat();
          toVisit.push({ flags: fileFlags, file });
        }
        catch {}
      }
      continue;
    }
  }
  // Doesn't need rebuild if there is no source, but target exists.
  if (!bestSource) {
    return !bestTarget;
  }
  // Always needs a rebuild if target doesn't exist.
  if (!bestTarget) {
    return true;
  }
  // Needs rebuild if source is newer than target
  return bestSource.mtime > bestTarget.mtime;
};

/**
 * Returns file stats for the provided path, or null if file is
 * not accessible.
 */
export const stat = path => {
  try {
    return fs.statSync(path);
  }
  catch {
    return null;
  }
};
