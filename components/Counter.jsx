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

const IntervalWrapper = getModuleByDisplayName('IntervalWrapper', false);
const renderListItem = getModuleByDisplayName('renderListItem', false);

const guildStore = getModule([ 'initialize', 'totalGuilds' ], false);
const statusStore = getModule([ 'initialize', 'isMobileOnline' ], false);
const relationshipStore = getModule([ 'initialize', 'getRelationships' ], false);

function getRelationshipCounts () {
  const relationshipTypes = Object.keys(RelationshipTypes).filter(key => isNaN(key));
  const relationshipCounts = relationshipTypes.reduce((obj, type) => ({ ...obj, [type]: 0 }), {});
  const relationships = relationshipStore?.getRelationships();

  if (relationships) {
    for (const type in relationships) {
      relationshipCounts[relationshipTypes[relationships[type]]]++;
    }
  }

  return relationshipCounts;
}

const Flux = getModule([ 'useStateFromStores' ], false);

module.exports = React.memo(props => {
  const { getSetting, main: { counterStore } } = props;

  const states = Flux.useStateFromStores([ counterStore, relationshipStore, statusStore, guildStore ], () => {
    const { activeCounter, nextCounter } = counterStore.getState();

    return ({
      activeCounter,
      nextCounter,
      counters: {
        ONLINE: relationshipStore?.getFriendIDs().filter(id => statusStore.getStatus(id) !== 'offline').length || 0,
        GUILDS: guildStore?.totalGuilds || 0,
        ...getRelationshipCounts()
      }
    })
  });

  const goToNextCounter = () => {
    FluxDispatcher.dirtyDispatch({
      type: ActionTypes.STATISTICS_COUNTER_SET_ACTIVE_COUNTER,
      counter: counterStore.getNextCounter()
    });
  }

  const handleOnClick = goToNextCounter;
  const handleOnInterval = goToNextCounter;
  const handleOnContextMenu = (e) => contextMenu.openContextMenu(e, () => <ContextMenu main={props.main} />);

  return (
    renderListItem(
      <IntervalWrapper
        className={[ 'statistics-counter', states.activeCounter !== states.nextCounter && 'clickable' ].filter(Boolean).join(' ')}
        onInterval={handleOnInterval}
        interval={getSetting('autoRotationDelay', 3e4)}
        disable={getSetting('autoRotation', false) === false}
        pauseOnHover={true}
      >
        <span onContextMenu={handleOnContextMenu} onClick={handleOnClick}>
          {Messages[CounterTranslationKeys[states.activeCounter]]} — {states.counters[states.activeCounter]}
        </span>
      </IntervalWrapper>
    )
  );
});