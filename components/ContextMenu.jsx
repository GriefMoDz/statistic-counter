const { React } = require('powercord/webpack');
const { ContextMenu } = require('powercord/components');

module.exports = class CounterContextMenu extends React.Component {
  render () {
    const { main } = this.props;
    const extendedCounters = [ 'friends', 'pending', 'blocked', 'guilds' ].map(count => ({
      type: 'checkbox',
      name: `Show ${count.charAt(0).toUpperCase()}${count.slice(1)}`,
      defaultState: main.settings.get(count, true),
      onToggle: (state) => {
        main.settings.set(count, state);
        main.forceUpdateHomeButton();
      }
    }));

    return (
      React.createElement(ContextMenu, {
        itemGroups: [ [ {
          type: 'submenu',
          name: 'Extended Counters',
          getItems: () => extendedCounters
        }, {
          type: 'submenu',
          name: 'Auto Rotation',
          getItems: () => [ {
            type: 'checkbox',
            name: 'Enabled',
            defaultState: main.settings.get('autoRotation', false),
            onToggle: (state) => {
              main.settings.set('autoRotation', state);
              main.forceUpdateHomeButton();

              if (!state) {
                clearInterval(main.state.autoRotation);
              }
            }
          }, {
            type: 'slider',
            name: 'Rotate Interval',
            value: main.settings.get('autoRotationDelay', 3e4),
            initialValue: 3e4,
            minValue: 5e3,
            maxValue: 36e5,
            renderValue: (value) => {
              const seconds = (value / 1000);
              const minutes = ((value / 1000) / 60);
              return value < 6e4 ? `${seconds.toFixed(1)} secs` : `${minutes.toFixed(1)} mins`;
            },
            onChange: (value) => {
              main.settings.set('autoRotationDelay', Math.round(value));
              main.forceUpdateHomeButton();
            }
          } ]
        } ] ]
      })
    );
  }
};
