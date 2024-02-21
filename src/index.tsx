import type { CounterSettings, GuildClasses, GuildsNavComponent } from '@types';

import { Injector, Logger, i18n, settings, util, webpack } from 'replugged';
import { DefaultSettings, PLUGIN_ID } from '@lib/constants';
import { findInReactTree, forceUpdate } from '@lib/util';

export const prefs = await settings.init<CounterSettings, keyof typeof DefaultSettings>('xyz.griefmodz.StatisticCounter', DefaultSettings);
export const logger = Logger.plugin(PLUGIN_ID.replace(/-/g, ' '), '#3ba55c');
export const inject = new Injector();

let classes: Record<string, GuildClasses | Record<string, string>> = {};

import './main.css';
import translations from '@i18n';

import { Counter, Settings } from '@components';
export { Settings };

export async function start(): Promise<void> {
  classes.guildClasses = await webpack.waitForProps<string, string>(['guilds', 'sidebar']);

  i18n.loadAllStrings(translations);

  void patchGuildsNav();
}

export function stop(): void {
  inject.uninjectAll();

  forceUpdate(document.querySelector(`.${classes.guildClasses.guilds}`));
}

export async function patchGuildsNav(): Promise<void> {
  const start = performance.now();

  const GuildsNav = await webpack.waitForModule<GuildsNavComponent>(webpack.filters.bySource('guildsnav'));

  inject.after(GuildsNav, 'type', ([props], res) => {
    const GuildsNavBar = findInReactTree(res, (node) => node?.props?.className?.includes(props.className));
    if (!GuildsNavBar) return res;

    patchGuildsNavBar(GuildsNavBar);

    return res;
  });

  util
    .waitFor(`.${classes.guildClasses.guilds}`)
    .then(forceUpdate)
    .catch(() => {});

  const end = performance.now();

  logger.log(`“GuildsNav” patched, took ${(end - start).toFixed(3)} ms`);
}

function patchGuildsNavBar(component: JSX.Element): void {
  const start = performance.now();

  inject.after(component, 'type', (_, res) => {
    const NavScroll = findInReactTree(res, (node) => node?.props?.onScroll);
    if (!NavScroll?.props?.children) return res;

    let StatisticCounterIndex = 2;

    const getIndexByKeyword = (keyword: string): number =>
      NavScroll.props.children.findIndex((child: React.ReactElement) => child?.type?.toString()?.includes(keyword));

    const FavouritesIndex = getIndexByKeyword('favorites');
    if (FavouritesIndex !== -1) {
      StatisticCounterIndex = FavouritesIndex + 1;
    } else {
      const HomeButtonIndex = getIndexByKeyword('getHomeLink');
      if (HomeButtonIndex !== -1) {
        StatisticCounterIndex = HomeButtonIndex + 1;
      }
    }

    NavScroll.props.children.splice(StatisticCounterIndex, 0, <Counter />);

    return res;
  });

  const end = performance.now();

  logger.log(`“GuildsNavBar” patched, took ${(end - start).toFixed(3)} ms`);
}
