import type { CounterProps, CounterType } from '../types';

export const PLUGIN_ID = 'Statistic-Counter';

export const ActionTypes = {
  STATISTICS_COUNTER_SET_ACTIVE: 'STATISTICS_COUNTER_SET_ACTIVE'
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
