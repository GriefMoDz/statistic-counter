/* eslint-disable object-property-newline */
const { React, Flux, getModule, i18n: { Messages }, constants: { RelationshipTypes } } = require('powercord/webpack');
const counterStore = require('../counterStore');

const relationshipStore = getModule([ 'initialize', 'isBlocked' ], false);
const guildCount = getModule([ 'initialize', 'totalGuilds' ], false);

function getRelationshipCounts () {
  const relationshipTypes = Object.keys(RelationshipTypes).filter(key => isNaN(key));
  const relationshipCounts = relationshipTypes.reduce((obj, type) => ({ ...obj, [type]: 0 }), {});
  const relationships = relationshipStore.getRelationships();

  for (const type in relationships) {
    relationshipCounts[relationshipTypes[relationships[type]]]++;
  }

  return relationshipCounts;
}

function fetchExtendedCounts () {
  return Object.assign({ GUILDS: guildCount.totalGuilds }, getRelationshipCounts());
}

class ExtendedCount extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = { activeCounter: counterStore.store.getActiveExtendedCounter() };
    this.handleClick = () => {
      const nextCounter = counterStore.store.getNextExtendedCounter();
      counterStore.setActiveExtendedCounter(nextCounter);

      if (nextCounter) {
        this.setState({ activeCounter: nextCounter });
      } else {
        counterStore.setActiveCounter('ONLINE_COUNT');
      }

      props.forceUpdateHomeButton();
    };
  }

  render () {
    this.props.invokeAutoRotation(this.handleClick);

    let translationKey;
    const activeExtendedCount = this.state.activeCounter;
    switch (activeExtendedCount) {
      case 'FRIEND': translationKey = 'FRIENDS'; break;
      case 'PENDING_INCOMING': translationKey = 'PENDING'; break;
      case 'GUILDS': translationKey = 'SERVERS';
    }

    return React.createElement('div', {
      id: `extended-count-${(translationKey || activeExtendedCount).toLowerCase()}`,
      className: [ 'onlineFriends-counter', this.props.clickable && 'clickable' ].filter(Boolean).join(' '),
      onClick: this.props.clickable && this.handleClick
    }, `${Messages[translationKey || activeExtendedCount]} — ${this.props.extendedCounts[activeExtendedCount]}`);
  }
}

module.exports = Flux.connectStoresAsync(
  [ relationshipStore, guildCount ],
  () => ({ extendedCounts: fetchExtendedCounts() })
)(ExtendedCount);
