import type { ModuleExports, ObjectExports } from 'replugged/dist/types';
import type {
  CounterState,
  GuildAvailabilityStore,
  IntervalWrapper,
  PresenceStore,
  RelationshipCounts,
  RelationshipStore,
  UseStateFromStores
} from '@types';

import CounterStore from '@lib/store';
import ContextMenu from './ContextMenu';
import ErrorBoundary from './ErrorBoundary';

import { common, webpack } from 'replugged';
import { ActionTypes, Counters } from '@lib/constants';

const FluxDispatcher = common.fluxDispatcher;

const { Messages } = common.i18n;

const RelationshipTypes = (await webpack.waitForProps('IMPLICIT')) as Record<string, string | number>;
const RelationshipStore: RelationshipStore = await webpack.waitForProps(['getRelationships']);
const PresenceStore: PresenceStore = await webpack.waitForProps(['isMobileOnline']);
const GuildAvailabilityStore: GuildAvailabilityStore = await webpack.waitForProps(['totalGuilds']);

function getRelationshipCounts(): RelationshipCounts {
  const relationshipTypes = Object.keys(RelationshipTypes).filter((type) => isNaN(Number(type)));
  const relationshipCounts: RelationshipCounts = relationshipTypes.reduce((types, type) => ({ ...types, [type]: 0 }), {});
  const relationships = RelationshipStore.getRelationships();

  for (const type in relationships) {
    relationshipCounts[relationshipTypes[relationships[type]]]++;
  }

  return relationshipCounts;
}

const IntervalWrapper: IntervalWrapper = webpack.getBySource<ModuleExports & IntervalWrapper>(/defaultProps={disable:!1,pauseOnHover:!1}/)!;
const useStateFromStoresMod = await webpack.waitForModule<ObjectExports>(webpack.filters.bySource('useStateFromStores'));
const useStateFromStores: UseStateFromStores = webpack.getFunctionBySource(useStateFromStoresMod, 'useStateFromStores')!;

function Counter(props: { preview?: boolean }): React.ReactElement {
  const { activeCounter, nextCounter, counters, settings }: CounterState = useStateFromStores(
    [CounterStore, RelationshipStore, PresenceStore, GuildAvailabilityStore],
    () => ({
      ...CounterStore.state,
      settings: CounterStore.settings,
      counters: {
        ONLINE: RelationshipStore?.getFriendIDs?.().filter((id) => PresenceStore.getStatus(id) !== 'offline').length ?? 0,
        GUILDS: GuildAvailabilityStore?.totalGuilds ?? 0,
        ...getRelationshipCounts()
      }
    })
  );

  const goToNextCounter = (): void => {
    if (!props.preview && settings.get('preserveLastCounter', false)) {
      settings.set('lastCounter', CounterStore.nextCounter);
    }

    FluxDispatcher.dispatch({
      type: ActionTypes.STATISTIC_COUNTER_SET_ACTIVE,
      counter: CounterStore.nextCounter
    });
  };

  // @ts-expect-error Render parameter type is incorrect, so let's ignore this for now...
  const handleOnContextMenu = (event: React.UIEvent): void => !props.preview && common.contextMenu.open(event, (props) => <ContextMenu {...props} />);
  const handleOnInterval = goToNextCounter;
  const handleOnClick = goToNextCounter;

  return (
    <div className='statistic-counter-list-item'>
      <ErrorBoundary>
        <IntervalWrapper
          className='statistic-counter'
          onInterval={handleOnInterval}
          interval={settings.get('autoRotationDelay', 5e3)}
          disable={activeCounter === nextCounter || !settings.get('autoRotation', false)}
          pauseOnHover={Boolean(settings.get('autoRotationHoverPause', true))}>
          <span className={activeCounter !== nextCounter ? 'clickable' : ''} onClick={handleOnClick} onContextMenu={handleOnContextMenu}>
            {Messages[Counters[activeCounter].translationKey]} — {counters[Counters[activeCounter].storeKey]}
          </span>
        </IntervalWrapper>
      </ErrorBoundary>
    </div>
  );
}

export default Counter;
