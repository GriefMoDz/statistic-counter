const { React } = require('powercord/webpack');
const { ContextMenu } = require('powercord/components');

module.exports = class CountersContextMenu extends React.Component {
  constructor (props) {
    super();

    this.main = props.main;
  }

  render () {
    return (
      React.createElement(ContextMenu, {
        width: 'fit-content',
        itemGroups: [ [ {
          type: 'submenu',
          name: 'Extended Counters',
          getItems: () => Object.keys(this.props.counterTypes).filter(type => type !== 'Online').map(type => ({
            type: 'checkbox',
            name: `Show ${type}`,
            defaultState: this.main.settings.get(type.toLowerCase(), true),
            onToggle: (state) => this.main.settings.set(type.toLowerCase(), state)
          }))
        } ] ]
      })
    );
  }
};
