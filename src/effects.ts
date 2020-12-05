/**
 * @file
 * @copyright 2020 Aleksej Komarov
 * @license MIT
 */

type AsyncFunction = () => Promise<any>;

export interface BaseEffect {
  type: string;
}

export interface DependsEffect extends BaseEffect {
  flags: number;
  path: string;
}

export interface ProvidesEffect extends BaseEffect {
  flags: number;
  path: string;
}

export interface BuildEffect extends BaseEffect {
  script: AsyncFunction;
}

export const Effects = {
  depends: (flags: number, path: string): DependsEffect => ({
    type: 'depends',
    flags,
    path,
  }),
  provides: (flags: number, path: string): ProvidesEffect => ({
    type: 'provides',
    flags,
    path,
  }),
  build: (script: AsyncFunction): BuildEffect => ({
    type: 'build',
    script,
  }),
};
