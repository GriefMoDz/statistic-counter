const { Flux, FluxDispatcher } = require('powercord/webpack');
const { ActionTypes, FormattedCounterTypes } = require('./Constants');

let settings = powercord.api.settings._fluxProps('statistics-counter');
let activeCounter = settings.getSetting('lastCounter');

class CounterStore extends Flux.Store {
  static STORE_ID = 'statistics-counter-store';

  get state () {
    return {
      activeCounter: activeCounter || this.filteredCounters[0],
      nextCounter: this.nextCounter
    };
  }

  get filteredCounters () {
    return Object.keys(FormattedCounterTypes).filter(counter =>
      settings.getSetting(FormattedCounterTypes[counter].toLowerCase(), true)
    );
  }

  get nextCounter () {
    const counters = this.filteredCounters;
    const currentIndex = counters.indexOf(activeCounter || counters[0]);

    return (currentIndex >= counters.length - 1) ? counters[0] : counters[currentIndex + 1];
  }
}

module.exports = Flux.Store?.getAll?.().find(store => store.constructor.STORE_ID === CounterStore.STORE_ID) || new CounterStore(FluxDispatcher, {
  [ActionTypes.STATISTICS_COUNTER_SET_ACTIVE]: ({ counter }) => (activeCounter = counter)
});
