const { React, Flux, getModule, i18n: { Messages } } = require('powercord/webpack');
const counterStore = require('../counterStore');

class OnlineCount extends React.PureComponent {
  constructor (props) {
    super(props);

    this.handleClick = () => {
      counterStore.setActiveCounter('EXTENDED_COUNT');
      props.forceUpdateHomeButton();
    };
  }

  render () {
    this.props.invokeAutoRotation(this.handleClick);

    const friendsOnline = this.props.onlineFriendCount;
    return React.createElement('div', {
      id: 'online-count',
      className: [ 'onlineFriends-counter', this.props.clickable && 'clickable' ].filter(Boolean).join(' '),
      onClick: this.props.clickable && this.handleClick
    }, `${Messages.STATUS_ONLINE} — ${friendsOnline}`);
  }
}

const statusStore = getModule([ 'initialize', 'isMobileOnline' ], false);
const relationshipStore = getModule([ 'initialize', 'getRelationships' ], false);
module.exports = Flux.connectStores(
  [ relationshipStore, statusStore ],
  () => ({
    onlineFriendCount: relationshipStore?.getFriendIDs().filter(id => statusStore?.getStatus(id) !== 'offline').length
  })
)(OnlineCount);
