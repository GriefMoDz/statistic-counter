import { Injector, Logger, webpack } from 'replugged';
import { findInReactTree } from './lib/util';
import { PLUGIN_ID } from './lib/constants';
import { Counter } from './components';

import type { GuildsNavComponent } from './types';

const inject = new Injector();
const logger = Logger.plugin(PLUGIN_ID.replace(/-/g, ' '), '#3ba55c');

export function start(): void {
  patchGuildsNav();
}

export function stop(): void {
  inject.uninjectAll();
}

export async function patchGuildsNav(): Promise<void> {
  const t1 = performance.now();

  const GuildsNav: GuildsNavComponent = await webpack.waitForModule<any>(webpack.filters.bySource('guildsnav'));

  inject.after(GuildsNav, 'type', ([props], res) => {
    const GuildsNavBar = findInReactTree(res, (node) => node?.props?.className?.includes(props.className));
    if (!GuildsNavBar) return res;

    inject.after(GuildsNavBar, 'type', (_, res) => {
      const NavScroll = findInReactTree(res, (node) => node?.props?.onScroll);
      if (!NavScroll || !NavScroll.props?.children) return res;

      const HomeButtonIndex = NavScroll.props.children.findIndex((child: React.ReactElement) => child?.type?.toString()?.includes('getHomeLink'));
      const StatisticCounterIndex = HomeButtonIndex > -1 ? HomeButtonIndex + 1 : 2;

      NavScroll.props.children.splice(StatisticCounterIndex, 0, <Counter />);

      return res;
    });

    return res;
  });

  const t2 = performance.now();

  logger.log(`“GuildsNav” patched, took ${t2 - t1} ms`);
}
