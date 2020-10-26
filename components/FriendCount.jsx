const { React, Flux, getModule, i18n: { Messages } } = require('powercord/webpack');
const counterStore = require('../counterStore');

class FriendCount extends React.PureComponent {
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
      className: [ 'onlineFriends-friendCount', this.props.clickable && 'clickable' ].filter(Boolean).join(' '),
      onClick: this.props.clickable && this.handleClick
    }, `${friendsOnline} ${Messages.STATUS_ONLINE}`);
  }
}

module.exports = Flux.connectStoresAsync(
  [ getModule([ 'initialize', 'getStatus' ]) ],
  ([ statusStore ]) => ({ onlineFriendCount: statusStore.getOnlineFriendCount() })
)(FriendCount);
