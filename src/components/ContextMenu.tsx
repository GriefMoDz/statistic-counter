import type { CounterType, MenuControlItemProps } from '@types';
import type { Slider } from 'replugged/dist/renderer/modules/components';

import { ActionTypes, Counters, DefaultSettings } from '@lib/constants';
import { common, components, util, webpack } from 'replugged';
import { prefs } from '@index';

import CounterStore from '@lib/store';
import ErrorBoundary from './ErrorBoundary';

const { React, fluxDispatcher, contextMenu } = common;
const { ContextMenu } = components;
const { Messages } = common.i18n;

const SliderControl = await webpack
  .waitForModule<typeof Slider>(webpack.filters.bySource('sliderContainer,'))
  .then((mod) => Object.values(mod).find((mod) => mod?.render?.toString?.().includes('sliderContainer')));

function CounterItems(): React.ReactElement[] {
  const items: React.ReactElement[] = [];

  for (const key in Counters) {
    const counter = key as CounterType;
    const counterName = Messages[Counters[counter].translationKey];
    const currentState = util.useSetting(prefs, counter);

    items.push(
      <ContextMenu.MenuCheckboxItem
        id={`show-${counter}`}
        label={Messages.STATISTIC_COUNTER_SHOW_COUNTER.format({ counter: counterName })}
        checked={currentState.value}
        disabled={CounterStore.filteredCounters.length === 1 && CounterStore.filteredCounters.includes(counter)}
        action={() => {
          const newState = !currentState.value;

          currentState.onChange(newState);

          if (!newState) {
            const { activeCounter, nextCounter } = CounterStore.state;

            if (activeCounter === counter) {
              fluxDispatcher.dispatch({
                type: ActionTypes.STATISTIC_COUNTER_SET_ACTIVE,
                counter: nextCounter
              });
            }
          }
        }}
      />
    );
  }

  return items;
}

function VisibilityItems(): React.ReactElement {
  const counterState = CounterStore.state;
  const preserveLastCounter = util.useSetting(prefs, 'preserveLastCounter');

  return (
    <ContextMenu.MenuItem id='visibility' label={Messages.STATISTIC_COUNTER_VISIBILITY}>
      {CounterItems()}
      <ContextMenu.MenuGroup>
        <ContextMenu.MenuCheckboxItem
          id='preserve-last-counter'
          label={Messages.STATISTIC_COUNTER_PRESERVE_LAST_COUNTER}
          checked={preserveLastCounter.value}
          action={() => {
            const newState = !preserveLastCounter.value;

            prefs.set('lastCounter', newState ? counterState.activeCounter : void 0);

            preserveLastCounter.onChange(newState);
          }}
        />
      </ContextMenu.MenuGroup>
    </ContextMenu.MenuItem>
  );
}

function AutoRotationItems(): React.ReactElement {
  const autoRotation = util.useSetting(prefs, 'autoRotation');
  const autoRotationDelay = util.useSetting(prefs, 'autoRotationDelay');
  const autoRotationHoverPause = util.useSetting(prefs, 'autoRotationHoverPause');

  return (
    <ContextMenu.MenuItem id='auto-rotation' label={Messages.STATISTIC_COUNTER_AUTO_ROTATION}>
      <ContextMenu.MenuCheckboxItem
        id='enabled'
        label={Messages.USER_SETTINGS_MFA_ENABLED}
        checked={autoRotation.value}
        action={() => autoRotation.onChange(!autoRotation.value)}
      />
      {autoRotation.value && (
        <ContextMenu.MenuGroup>
          <ContextMenu.MenuControlItem
            id='rotate-interval'
            label={Messages.STATISTIC_COUNTER_ROTATION_INTERVAL}
            control={(props: MenuControlItemProps, ref) => (
              <SliderControl
                mini
                ref={ref}
                initialValue={DefaultSettings.autoRotationDelay}
                minValue={5e3}
                maxValue={36e5}
                renderValue={(value: number) => {
                  const seconds = value / 1000;
                  const minutes = value / 1000 / 60;
                  return value < 6e4
                    ? Messages.DURATION_SECS.format({ secs: seconds.toFixed(0) })
                    : Messages.DURATION_MINS.format({ mins: minutes.toFixed(0) });
                }}
                {...autoRotationDelay}
                {...props}
              />
            )}
          />
          <ContextMenu.MenuCheckboxItem
            id='pause-on-hover'
            label={Messages.STATISTIC_COUNTER_PAUSE_ON_HOVER}
            checked={autoRotationHoverPause.value}
            action={() => autoRotationHoverPause.onChange(!autoRotationHoverPause.value)}
          />
        </ContextMenu.MenuGroup>
      )}
    </ContextMenu.MenuItem>
  );
}

function ContextMenuItems(): React.ReactElement {
  return (
    <ContextMenu.MenuGroup>
      {VisibilityItems()}
      {AutoRotationItems()}
    </ContextMenu.MenuGroup>
  );
}

export default React.memo((props) => (
  <ErrorBoundary>
    <ContextMenu.ContextMenu navId='statistic-counter-context-menu' {...props} onClose={contextMenu.close}>
      {ContextMenuItems()}
    </ContextMenu.ContextMenu>
  </ErrorBoundary>
));
