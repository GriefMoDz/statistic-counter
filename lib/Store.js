const { Flux, FluxDispatcher } = require('powercord/webpack');
const { ActionTypes, FormattedCounterTypes } = require('./Constants');

const { join } = require('path');

const directoryParts = join(__dirname, '..').split(/[\\|/]/);
const pluginId = directoryParts[directoryParts.length - 1];

let activeCounter;

class CounterStore extends Flux.Store {
  getState () {
    return {
      activeCounter: activeCounter || this.getFilteredCounters()[0],
      nextCounter: this.getNextCounter()
    };
  }

  getFilteredCounters () {
    return Object.keys(FormattedCounterTypes).filter(counter =>
      powercord.pluginManager.get(pluginId).settings.get(FormattedCounterTypes[counter].toLowerCase(), true)
    );
  }

  getNextCounter () {
    const filteredCounters = this.getFilteredCounters();
    const currentIndex = filteredCounters.indexOf(activeCounter || filteredCounters[0]);

    return (currentIndex >= filteredCounters.length - 1) ? filteredCounters[0] : filteredCounters[currentIndex + 1];
  }
}

module.exports = new CounterStore(FluxDispatcher, {
  [ActionTypes.STATISTICS_COUNTER_SET_ACTIVE_COUNTER]: ({ counter }) => (activeCounter = counter)
});
