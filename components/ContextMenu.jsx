const { React, Flux, FluxDispatcher, getModule, contextMenu: { closeContextMenu } } = require('powercord/webpack');
const { Menu } = require('powercord/components');

const { FormattedCounterTypes } = require('../lib/Constants');

class ContextMenu extends React.PureComponent {
  constructor (props) {
    super(props);

    this.handleRotationDelay = global._.debounce(this.handleRotationDelay.bind(this), 200);
    this.state = {
      autoRotation: props.getSetting('autoRotation', false),
      counters: Object.assign({}, ...Object.values(FormattedCounterTypes).map(counter => ({
        [counter.toLowerCase()]: props.getSetting(counter.toLowerCase(), true)
      })))
    };
  }

  handleRotationDelay (delay) {
    this.props.updateSetting('autoRotationDelay', Math.round(delay));
  }

  render () {
    return (
      <Menu.Menu navId='statistics-counter-context-menu' onClose={closeContextMenu}>
        {this.renderSettings()}
      </Menu.Menu>
    );
  }

  renderSettings () {
    const { getSetting, updateSetting } = this.props;
    const Slider = getModule(m => m.render && m.render.toString().includes('sliderContainer'), false);

    return (
      <Menu.MenuGroup>
        <Menu.MenuItem id='visibility' label='Visibility'>
          {this.renderCounters()}
        </Menu.MenuItem>

        <Menu.MenuItem id='auto-rotation' label='Auto Rotation'>
          <Menu.MenuCheckboxItem
            id='enabled'
            label='Enabled'
            checked={this.state.autoRotation}
            action={() => {
              const newState = !this.state.autoRotation;

              updateSetting('autoRotation', newState);

              this.setState({ autoRotation: newState });
            }}
          />
          <Menu.MenuControlItem
            id='rotate-interval'
            label='Rotate Interval'
            control={(props, ref) => (
              <Slider
                mini
                ref={ref}
                value={getSetting('autoRotationDelay', 3e4)}
                initialValue={3e4}
                minValue={5e3}
                maxValue={36e5}
                renderValue={(value) => {
                  const seconds = (value / 1000);
                  const minutes = ((value / 1000) / 60);
                  return value < 6e4 ? `${seconds.toFixed(1)} secs` : `${minutes.toFixed(1)} mins`;
                }}
                onChange={this.handleRotationDelay.bind(this)}
                {...props}
              />
            )}
          />
        </Menu.MenuItem>
      </Menu.MenuGroup>
    );
  }

  renderCounters () {
    const { main: { constants, counterStore } } = this.props;

    return Object.keys(FormattedCounterTypes).map(counter => {
      const counterName = FormattedCounterTypes[counter];
      const lowerCounterName = counterName.toLowerCase();

      return <Menu.MenuCheckboxItem
        id={`show-${counterName}`}
        label={`Show ${counterName}`}
        checked={this.state.counters[lowerCounterName]}
        disabled={counterStore.getFilteredCounters().length === 1 && counterStore.getFilteredCounters().includes(counter)}
        action={() => {
          const newState = !this.state.counters[lowerCounterName];

          this.props.updateSetting(lowerCounterName, newState);
          this.state.counters[lowerCounterName] = newState;

          if (newState === false) {
            const { activeCounter, nextCounter } = counterStore.getState();

            activeCounter === counter && FluxDispatcher.dirtyDispatch({
              type: constants.ActionTypes.STATISTICS_COUNTER_SET_ACTIVE_COUNTER,
              counter: nextCounter
            });
          }

          this.setState({ counters: this.state.counters });
        }}
      />
    });
  }
}

module.exports = Flux.connectStores(
  [ powercord.api.settings.store ],
  (props) => ({ ...powercord.api.settings._fluxProps(props.main.entityID) })
)(ContextMenu);
