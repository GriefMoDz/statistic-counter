const { React, Flux, getModule, contextMenu: { closeContextMenu } } = require('powercord/webpack');
const { Menu } = require('powercord/components');

class ContextMenu extends React.PureComponent {
  constructor (props) {
    super(props);

    this.handleRotationDelay = global._.debounce(this.handleRotationDelay.bind(this), 200);
    this.state = {
      autoRotation: props.getSetting('autoRotation', false),
      extendedCounts: Object.assign({}, ...[ 'friends', 'pending', 'blocked', 'guilds' ]
        .map(extendedCount => ({ [extendedCount]: props.getSetting(extendedCount, true) }))
      )
    };
  }

  handleRotationDelay (delay) {
    this.props.updateSetting('autoRotationDelay', Math.round(delay));
    this.props.main.forceUpdateHomeButton();
  }

  render () {
    return (
      <Menu.Menu navId='onlineFriends-context-menu' onClose={closeContextMenu}>
        {this.renderSettings()}
      </Menu.Menu>
    );
  }

  renderSettings () {
    const { getSetting, updateSetting } = this.props;
    const Slider = getModule(m => m.render && m.render.toString().includes('sliderContainer'), false);

    return (
      <Menu.MenuGroup>
        <Menu.MenuItem id='extended-counters' label='Extended Counters'>
          {this._renderCounters()}
        </Menu.MenuItem>

        <Menu.MenuItem id='auto-rotation' label='Auto Rotation'>
          <Menu.MenuCheckboxItem
            id='enabled'
            label='Enabled'
            checked={this.state.autoRotation}
            action={() => {
              const newState = !this.state.autoRotation;

              updateSetting('autoRotation', newState);
              this.props.main.forceUpdateHomeButton();

              if (!newState) {
                clearInterval(this.props.main.state.autoRotation);
              }

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

  _renderCounters () {
    return [ 'friends', 'pending', 'blocked', 'guilds' ].map(extendedCount => (
      <Menu.MenuCheckboxItem
        id={extendedCount}
        label={`Show ${extendedCount.charAt(0).toUpperCase()}${extendedCount.slice(1)}`}
        checked={this.state.extendedCounts[extendedCount]}
        action={() => {
          const newState = !this.state.extendedCounts[extendedCount];

          this.props.updateSetting(extendedCount, newState);
          this.props.main.forceUpdateHomeButton();

          this.state.extendedCounts[extendedCount] = newState;
          this.setState({ extendedCounts: this.state.extendedCounts });
        }}
      />
    ));
  }
}

module.exports = Flux.connectStores(
  [ powercord.api.settings.store ],
  (props) => ({ ...powercord.api.settings._fluxProps(props.main.entityID) })
)(ContextMenu);
