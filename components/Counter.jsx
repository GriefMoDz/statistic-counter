const {
  React,
  FluxDispatcher,
  getModule,
  getModuleByDisplayName,
  contextMenu,
  i18n: { Messages },
  constants: { RelationshipTypes }
} = require('powercord/webpack');

const { ActionTypes, CounterTranslationKeys } = require('../lib/Constants');

const ContextMenu = require('./ContextMenu');
const CounterStore = require('../lib/Store');
const RelationshipStore = getModule([ 'initialize', 'getRelationships' ], false);

function getRelationshipCounts () {
  const relationshipTypes = Object.keys(RelationshipTypes).filter(isNaN);
  const relationshipCounts = relationshipTypes.reduce((obj, type) => ({ ...obj, [type]: 0 }), {});
  const relationships = RelationshipStore.getRelationships();

  for (const type in relationships) {
    relationshipCounts[relationshipTypes[relationships[type]]]++;
  }

  return relationshipCounts;
}

const Flux = getModule([ 'useStateFromStores' ], false);

const IntervalWrapper = getModuleByDisplayName('IntervalWrapper', false);
const renderListItem = getModuleByDisplayName('renderListItem', false);

const StatusStore = getModule([ 'initialize', 'isMobileOnline' ], false);
const GuildStore = getModule([ 'initialize', 'totalGuilds' ], false);

module.exports = () => {
  const { getSetting, updateSetting } = powercord.api.settings._fluxProps('statistics-counter');
  const { activeCounter, nextCounter, counters } = Flux.useStateFromStores([ CounterStore, RelationshipStore, StatusStore, GuildStore ], () => ({
    ...CounterStore.state,
    counters: {
      ONLINE: RelationshipStore?.getFriendIDs?.().filter(id => StatusStore.getStatus(id) !== 'offline').length || 0,
      GUILDS: GuildStore?.totalGuilds || 0,
      ...getRelationshipCounts()
    }
  }));

  const goToNextCounter = () => {
    if (getSetting('preserveLastCounter', false)) {
      updateSetting('lastCounter', CounterStore.nextCounter);
    }

    FluxDispatcher.dirtyDispatch({
      type: ActionTypes.STATISTICS_COUNTER_SET_ACTIVE,
      counter: CounterStore.nextCounter
    });
  };

  const handleOnClick = goToNextCounter;
  const handleOnInterval = goToNextCounter;
  const handleOnContextMenu = (e) => contextMenu.openContextMenu(e, () => {
    const ConnectedContextMenu = Flux.default.connectStores([ powercord.api.settings.store ], () => ({
      ...powercord.api.settings._fluxProps('statistics-counter')
    }))(ContextMenu);

    return <ConnectedContextMenu/>;
  });

  return (
    renderListItem(
      <IntervalWrapper
        className='statistics-counter'
        onInterval={handleOnInterval}
        interval={getSetting('autoRotationDelay', 3e4)}
        disable={activeCounter === nextCounter || getSetting('autoRotation', false) === false}
        pauseOnHover={getSetting('autoRotationHoverPause', true) === true}
      >
        <span className={activeCounter !== nextCounter && 'clickable'} onContextMenu={handleOnContextMenu} onClick={handleOnClick}>
          {Messages[CounterTranslationKeys[activeCounter]]} — {counters[activeCounter]}
        </span>
      </IntervalWrapper>
    )
  );
};
