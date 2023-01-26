/* eslint-disable @typescript-eslint/naming-convention */
import type { Store } from 'replugged/dist/renderer/modules/webpack/common/flux';
import type { SettingsManager } from 'replugged/dist/renderer/apis/settings';
import type { RawModule } from 'replugged/dist/types';
import type { Counters } from '@lib/constants';

export type Comparator<T> = (a: T, b: T) => boolean;

export interface ErrorBoundaryState {
  hasError: boolean;
}

export interface GuildsNavProps {
  className: string;
  themeOverride: string;
}

export interface GuildClasses extends RawModule {
  activityPanel: string;
  base: string;
  container: string;
  content: string;
  downloadProgressCircle: string;
  fullWidth: string;
  guilds: string;
  hasNotice: string;
  hidden: string;
  panels: string;
  sidebar: string;
}

export interface GuildsNavClasses {
  fixedBottomList: string;
  hidden: string;
  scroller: string;
  scrolling: string;
  tree: string;
  unreadMentionsBar: string;
  unreadMentionsIndicatorBottom: string;
  unreadMentionsIndicatorTop: string;
  wrapper: string;
}

export interface GuildsNavComponent extends RawModule {
  $$typeof: symbol;
  compare: Comparator<unknown>;
  type: (props: GuildsNavProps) => React.ReactElement;
}

export type CounterType = 'online' | 'friends' | 'pending' | 'blocked' | 'guilds';
export interface CounterProps {
  storeKey: string;
  translationKey: string;
}

export interface CounterStore extends Store {
  state: CounterState;
  settings: SettingsManager<CounterSettings>;
  nextCounter: CounterType;
  filteredCounters: CounterType[];
}

export interface CounterSettings {
  autoRotation?: boolean;
  autoRotationDelay?: number;
  autoRotationHoverPause?: boolean;
  preserveLastCounter?: boolean;
  lastCounter?: CounterType;
  online?: boolean;
  friends?: boolean;
  pending?: boolean;
  blocked?: boolean;
  guilds?: boolean;
}

export interface CounterState {
  activeCounter: CounterType;
  nextCounter: CounterType;
  settings: SettingsManager<CounterSettings>;
  counters: Counters;
}

export type Snowflake = string;
export const enum RelationshipTypes {
  NONE,
  FRIEND,
  BLOCKED,
  PENDING_INCOMING,
  PENDING_OUTGOING,
  IMPLICIT,
  SUGGESTION
}

export interface RelationshipStore extends RawModule, Store {
  getFriendIDs(): Snowflake[];
  getNickname(userId: string): string;
  getPendingCount(): number;
  getRelationshipCount(): number;
  getRelationshipType(userId: Snowflake): RelationshipTypes;
  getRelationships(): Record<Snowflake, RelationshipTypes>;
  isBlocked(userId: Snowflake): boolean;
  isFriend(userId: Snowflake): boolean;
  __getLocalVars(): {
    relationships: Record<Snowflake, RelationshipTypes>;
    nicknames: Record<Snowflake, string>;
    pendingCount: number;
    relationshipCount: number;
  };
}

export const enum StatusTypes {
  DND = 'dnd',
  IDLE = 'idle',
  INVISIBLE = 'invisible',
  OFFLINE = 'offline',
  ONLINE = 'online',
  STREAMING = 'streaming',
  UNKNOWN = 'unknown'
}

export interface Activity {
  assets?: {
    large_image: string;
    large_text: string;
  };
  emoji: {
    id: string;
    name: string;
  };
  created_at: string;
  details: string;
  flags?: number;
  id: string;
  name: string;
  party?: {
    id: string;
  };
  session_id?: string;
  state: string;
  sync_id?: string;
  timestamps?: {
    end: string;
    start: string;
  };
  type: string;
}

export interface ClientStatus {
  embedded?: StatusTypes;
  desktop?: StatusTypes;
  mobile?: StatusTypes;
  web?: StatusTypes;
}

export interface UserPresence {
  activities: Activity[];
  clientStatus: ClientStatus;
  status: StatusTypes;
  timestamp: number;
}

export interface PresenceStoreState {
  statuses: Record<Snowflake, StatusTypes>;
  clientStatuses: Record<Snowflake, ClientStatus>;
  activities: Record<Snowflake, Activity[]>;
  activityMetadata: Record<unknown, unknown>;
  presencesForGuilds: Record<Snowflake, Record<Snowflake, UserPresence>>;
}

export interface PresenceStore extends RawModule, Store {
  findActivity(userId: Snowflake, predicate: (arg: unknown) => boolean): Activity;
  getActivities(userId: Snowflake): Activity[];
  getActivityMetadata(userId: Snowflake): unknown;
  getAllApplicationActivities(applicationId: Snowflake): Activity[];
  getApplicationActivity(userId: Snowflake, applicationId: Snowflake): Activity;
  getPrimaryActivity(userId: Snowflake): Activity;
  getState(): PresenceStoreState;
  getStatus(userId: Snowflake): StatusTypes;
  getUserIds(): Snowflake[];
  isMobileOnline(userId: Snowflake): boolean;
  setCurrentUserOnConnectionOpen(status: StatusTypes, activities: Record<Snowflake, Activity[]>): void;
}

export interface GuildAvailabilityStore extends RawModule, Store {
  isUnavailable(guildId: Snowflake): boolean;
  get totalGuilds(): number;
  get totalUnavailableGuilds(): number;
  get unavailableGuilds(): Record<Snowflake, unknown>;
  __getLocalVars(): {
    logger: object;
    unavailableGuilds: Set<Snowflake>;
  };
}
