import { Injector, Logger, util, webpack } from 'replugged';
import { findInReactTree, forceUpdate } from './lib/util';
import { PLUGIN_ID } from './lib/constants';
import { Counter } from './components';

import type { GuildsNavComponent } from './types';

const inject = new Injector();
const logger = Logger.plugin(PLUGIN_ID.replace(/-/g, ' '), '#3ba55c');

let GuildClasses: { guilds: string; };

export async function start(): Promise<void> {
  GuildClasses = await webpack.waitForModule<any>(webpack.filters.byProps('guilds', 'sidebar'));

  patchGuildsNav();
}

export function stop(): void {
  inject.uninjectAll();

  forceUpdate(document.querySelector(`.${GuildClasses.guilds}`));
}

export async function patchGuildsNav(): Promise<void> {
  const start = performance.now();

  const GuildsNav: GuildsNavComponent = await webpack.waitForModule<any>(webpack.filters.bySource('guildsnav'));

  inject.after(GuildsNav, 'type', ([props], res) => {
    const GuildsNavBar = findInReactTree(res, (node) => node?.props?.className?.includes(props.className));
    if (!GuildsNavBar) return res;

    inject.after(GuildsNavBar, 'type', (_, res) => {
      const NavScroll = findInReactTree(res, (node) => node?.props?.onScroll);
      if (!NavScroll || !NavScroll.props?.children) return res;

      let StatisticCounterIndex = 2;

      const FavouritesIndex = NavScroll.props.children.findIndex((child: React.ReactElement) => child?.type?.toString()?.includes('favorites'));
      if (FavouritesIndex) {
        StatisticCounterIndex = FavouritesIndex + 1;
      } else {
        const HomeButtonIndex = NavScroll.props.children.findIndex((child: React.ReactElement) => child?.type?.toString()?.includes('getHomeLink'));
        HomeButtonIndex && (StatisticCounterIndex = HomeButtonIndex + 1);
      }

      NavScroll.props.children.splice(StatisticCounterIndex, 0, <Counter/>);

      return res;
    });

    return res;
  });

  forceUpdate(await util.waitFor(`.${GuildClasses.guilds}`));

  const end = performance.now();

  logger.log(`“GuildsNav” patched, took ${end - start} ms`);
}
