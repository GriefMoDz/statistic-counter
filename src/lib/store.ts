import { common, settings } from 'replugged';
import { SettingsManager } from 'replugged/dist/renderer/apis/settings';
import type { CounterSettings, CounterStore as CounterStoreType, CounterType, Flux, Store } from '@types';

const Flux = common.flux as unknown as Flux;
const FluxDispatcher = common.fluxDispatcher;

import { ActionTypes, Counters } from './constants';

const prefs = await settings.init<CounterSettings>('xyz.griefmodz.StatisticCounter');
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

  public get settings(): SettingsManager<CounterSettings> {
    return prefs;
  }

  public get filteredCounters(): Array<CounterType | string> {
    return Object.keys(Counters).filter((counter) => prefs.get(counter, true));
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
