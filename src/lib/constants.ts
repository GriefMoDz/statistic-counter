import type { CounterProps, CounterSettings, CounterType } from '@types';

export const PLUGIN_ID = 'Statistic-Counter';

export const ActionTypes = {
  STATISTIC_COUNTER_SET_ACTIVE: 'STATISTIC_COUNTER_SET_ACTIVE'
};

export const Counters: Record<CounterType, CounterProps> = {
  online: {
    storeKey: 'ONLINE',
    translationKey: 'STATUS_ONLINE'
  },
  friends: {
    storeKey: 'FRIEND',
    translationKey: 'FRIENDS'
  },
  pending: {
    storeKey: 'PENDING_INCOMING',
    translationKey: 'PENDING'
  },
  blocked: {
    storeKey: 'BLOCKED',
    translationKey: 'BLOCKED'
  },
  guilds: {
    storeKey: 'GUILDS',
    translationKey: 'SERVERS'
  }
};

export const DefaultSettings: Partial<CounterSettings> = {
  autoRotation: false,
  autoRotationDelay: 5e3,
  autoRotationHoverPause: true,
  preserveLastCounter: false,
  viewOrder: Object.keys(Counters) as CounterType[],
  online: true,
  friends: true,
  pending: true,
  blocked: true,
  guilds: true
};
