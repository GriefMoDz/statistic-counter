const { React, FluxDispatcher, getModule, contextMenu: { closeContextMenu } } = require('powercord/webpack');
const { Menu } = require('powercord/components');

const { ActionTypes, FormattedCounterTypes } = require('../lib/Constants');

const CounterStore = require('../lib/Store');
const Slider = getModule(m => m.render?.toString().includes('sliderContainer'), false) || (() => null);

function renderCounterItems (settings) {
  return Object.keys(FormattedCounterTypes).map(counter => {
    const counterName = FormattedCounterTypes[counter];
    const lowerCounterName = counterName.toLowerCase();

    const currentState = settings.getSetting(lowerCounterName, true);

    return (
      <Menu.MenuCheckboxItem
        id={`show-${counterName}`}
        label={`Show ${counterName}`}
        checked={currentState}
        disabled={CounterStore.filteredCounters.length === 1 && CounterStore.filteredCounters.includes(counter)}
        action={() => {
          const newState = !currentState;

          settings.updateSetting(lowerCounterName, newState);

          if (newState === false) {
            const { activeCounter, nextCounter } = CounterStore.state;

            activeCounter === counter && FluxDispatcher.dirtyDispatch({
              type: ActionTypes.STATISTICS_COUNTER_SET_ACTIVE,
              counter: nextCounter
            });
          }
        }}
      />
    );
  });
}

function renderAutoRotationItems ({ getSetting, updateSetting }) {
  const autoRotation = getSetting('autoRotation', false);
  const autoRotationDelay = getSetting('autoRotationDelay', 3e4);
  const autoRotationHoverPause = getSetting('autoRotationHoverPause', true);

  const handleRotationDelay = (delay) => global._.debounce(
    updateSetting('autoRotationDelay', Math.round(delay)),
    200
  );

  return (
    <Menu.MenuItem id='auto-rotation' label='Auto Rotation'>
      <Menu.MenuCheckboxItem
        id='enabled'
        label='Enabled'
        checked={autoRotation}
        action={() => updateSetting('autoRotation', !autoRotation)}
      />
      {autoRotation && <Menu.MenuGroup>
        <Menu.MenuCheckboxItem
          id='pause-on-hover'
          label='Pause on Hover'
          checked={autoRotationHoverPause}
          action={() => updateSetting('autoRotationHoverPause', !autoRotationHoverPause)}
        />
        <Menu.MenuControlItem
          id='rotate-interval'
          label='Rotate Interval'
          control={(props, ref) => (
            <Slider
              mini
              ref={ref}
              value={autoRotationDelay}
              initialValue={3e4}
              minValue={5e3}
              maxValue={36e5}
              renderValue={(value) => {
                const seconds = (value / 1000);
                const minutes = ((value / 1000) / 60);
                return value < 6e4 ? `${seconds.toFixed(0)} secs` : `${minutes.toFixed(0)} mins`;
              }}
              onChange={handleRotationDelay}
              {...props}
            />
          )}
        />
      </Menu.MenuGroup>}
    </Menu.MenuItem>
  );
}

function renderVisibilityItems (settings) {
  const counterState = CounterStore.state;
  const preserveLastCounter = settings.getSetting('preserveLastCounter', false);

  return (
    <Menu.MenuItem id='visibility' label='Visibility'>
      {renderCounterItems(settings)}
      <Menu.MenuGroup>
        <Menu.MenuCheckboxItem
          id='preserve-last-counter'
          label='Preserve Last Counter'
          checked={preserveLastCounter}
          action={() => {
            const newState = !preserveLastCounter;

            settings.updateSetting('lastCounter', newState ? counterState.activeCounter : void 0);
            settings.updateSetting('preserveLastCounter', newState);
          }}
        />
      </Menu.MenuGroup>
    </Menu.MenuItem>
  );
}

function renderSettingItems (props) {
  return (
    <Menu.MenuGroup>
      {renderVisibilityItems(props)}
      {renderAutoRotationItems(props)}
    </Menu.MenuGroup>
  );
}

module.exports = React.memo(props =>
  <Menu.Menu navId='statistics-counter-context-menu' onClose={closeContextMenu}>
    {renderSettingItems(props)}
  </Menu.Menu>
);
