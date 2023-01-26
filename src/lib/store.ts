import { common, settings } from 'replugged';
import { SettingsManager } from 'replugged/dist/renderer/apis/settings';

import type { Store } from 'replugged/dist/renderer/modules/webpack/common/flux';
import type { CounterSettings, CounterStore as CounterStoreType, CounterType } from '@types';

const Flux = common.flux;
const FluxDispatcher = common.fluxDispatcher;

import { ActionTypes, Counters, DefaultSettings } from '@lib/constants';

const prefs = await settings.init<CounterSettings, keyof typeof DefaultSettings>('xyz.griefmodz.StatisticCounter', DefaultSettings);
let activeCounter = prefs.get('lastCounter');

interface CounterStoreState {
  activeCounter: CounterType | string;
  nextCounter: CounterType | string;
}

class CounterStore extends Flux.Store {
  public static displayName = 'StatisticCounterStore';

  public get state(): CounterStoreState {
    return {
      activeCounter: activeCounter || this.filteredCounters[0],
      nextCounter: this.nextCounter
    };
  }

  public get settings(): SettingsManager<CounterSettings, keyof typeof DefaultSettings> {
    return prefs;
  }

  public get filteredCounters(): Array<CounterType | string> {
    // @ts-expect-error Yeah... whatever.
    return Object.keys(Counters).filter((counter: CounterType) => prefs.get(counter, true));
  }

  public get nextCounter(): CounterType | string {
    const counters = this.filteredCounters;
    const currentIndex = counters.indexOf(activeCounter || counters[0]);

    return currentIndex >= counters.length - 1 ? counters[0] : counters[currentIndex + 1];
  }
}

export default (Flux.Store?.getAll?.().find((store: Store) => store.getName() === CounterStore.displayName) ||
  new CounterStore(FluxDispatcher, {
    [ActionTypes.STATISTICS_COUNTER_SET_ACTIVE]: ({ counter }) => (activeCounter = counter)
  })) as CounterStoreType;
