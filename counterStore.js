const { Flux, FluxDispatcher } = require('powercord/webpack');

const CounterTypes = Object.freeze({
  FRIEND_COUNT: 'FRIEND_COUNT',
  EXTENDED_COUNT: 'EXTENDED_COUNT'
});

const ExtendedCounterTypes = Object.freeze({
  FRIEND: 'FRIEND',
  PENDING_INCOMING: 'PENDING_INCOMING',
  BLOCKED: 'BLOCKED',
  GUILDS: 'GUILDS'
});

let activeCounter = CounterTypes.FRIEND_COUNT;
let activeExtendedCounter;
class CounterStore extends Flux.Store {
  get CounterTypes () {
    return CounterTypes;
  }

  getStore () {
    return { activeCounter, activeExtendedCounter };
  }

  getFilteredExtendedCounters () {
    const settingsKeys = [ 'friends', 'pending', 'blocked', 'guilds' ];
    const filteredExtendedCounts = Object.keys(ExtendedCounterTypes)
      .filter((_, index) => powercord.pluginManager.get('online-friends-count').settings.get(settingsKeys[index], true));

    return filteredExtendedCounts;
  }

  getActiveCounter () {
    return this.getFilteredExtendedCounters().length > 0 ? activeCounter : 'FRIEND_COUNT';
  }

  getActiveExtendedCounter () {
    const filteredExtendedCounts = this.getFilteredExtendedCounters();

    return activeExtendedCounter || filteredExtendedCounts[0];
  }

  getNextExtendedCounter () {
    const activeExtendedCounter = this.getActiveExtendedCounter();
    const filteredExtendedCounts = this.getFilteredExtendedCounters();
    const nextExtendedCounter = filteredExtendedCounts[filteredExtendedCounts.indexOf(activeExtendedCounter) + 1];

    return nextExtendedCounter;
  }
}

module.exports = {
  store: new CounterStore(FluxDispatcher, {
    ONLINE_FRIENDS_SET_ACTIVE_COUNTER: ({ counter }) => (activeCounter = counter),
    ONLINE_FRIENDS_SET_ACTIVE_EXTENDED_COUNTER: ({ counter }) => (activeExtendedCounter = counter)
  }),
  setActiveCounter: (newCounter) => {
    FluxDispatcher.dirtyDispatch({
      type: 'ONLINE_FRIENDS_SET_ACTIVE_COUNTER',
      counter: newCounter
    });
  },
  setActiveExtendedCounter: (newCounter) => {
    FluxDispatcher.dirtyDispatch({
      type: 'ONLINE_FRIENDS_SET_ACTIVE_EXTENDED_COUNTER',
      counter: newCounter
    });
  }
};
