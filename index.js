const { Plugin } = require('powercord/entities');
const { React, Flux, getModule, getModuleByDisplayName, contextMenu } = require('powercord/webpack');
const { forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { Clickable } = require('powercord/components');
const { constants, constants: { Stores } } = require('./core');

class OnlineFriends extends Plugin {
  constructor () {
    super();

    this.state = {
      type: 0
    };
  }

  async startPlugin () {
    this.loadCSS(require('path').resolve(__dirname, 'style.css'));
    this.utils = require('./core/utils')(this);
    this.classes = {
      ...await getModule([ 'wrapper', 'unreadMentionsBar' ]),
      ...await getModule([ 'guildSeparator', 'listItem' ])
    };

    await this._importStores();
    this._patchGuildsComponent();
  }

  pluginWillUnload () {
    uninject('onlineFriends-FriendCount');

    const scroller = getOwnerInstance(document.querySelector(`.${this.classes.guildSeparator}`));
    const guildSeparator = scroller.props.children.find(child => child._oldType);
    if (guildSeparator) {
      guildSeparator.type = guildSeparator._oldType;

      delete guildSeparator._oldType;
    }

    forceUpdateElement(`.${this.classes.wrapper.split(' ')[0]}`);
  }

  async _patchGuildsComponent () {
    const FriendsOnline = Flux.connectStores(
      [ constants.StatusStore ],
      () => ({ friendCount: constants.StatusStore.getOnlineFriendCount() })
    )(this._renderFriendsCount.bind(this));

    const instance = getOwnerInstance(await waitFor(`.${this.classes.wrapper.split(' ')[0]}`));
    inject('onlineFriends-FriendCount', instance.__proto__, 'render', (_, res) => {
      const scroller = res.props.children.find(child => child.props && child.props.className && child.props.className.includes('scroller'));
      const connectedUnreadDMs = scroller.props.children.find(child => child.type && child.type.displayName === 'ConnectedUnreadDMs');

      if (connectedUnreadDMs) {
        const { children } = scroller.props;
        const types = {
          1: 'FRIEND',
          2: 'PENDING_INCOMING',
          3: 'BLOCKED'
        };

        const ExtendedCount = Flux.connectStores(
          [ this.state.type !== 4 ? constants.RelationshipStore : constants.GuildStore ], () => ({
            extendedCount: types[this.state.type] ? this.utils.relationshipCounts[types[this.state.type]] : this.utils.guildCount
          })
        )(this._renderExtendedCount.bind(this));

        const guildSeparator = children[children.indexOf(connectedUnreadDMs) + 2];
        if (!guildSeparator._oldType) {
          guildSeparator._oldType = guildSeparator.type;
        }

        guildSeparator.type = () =>
          React.createElement('div', {
            className: this.classes.listItem
          }, this.state.type > 0
            ? React.createElement(ExtendedCount)
            : React.createElement(FriendsOnline),
          React.createElement('div', {
            className: this.classes.guildSeparator,
            style: { marginTop: '20px' }
          }));
      }

      return res;
    });

    instance.forceUpdate();
  }

  _onClickHandler () {
    this.utils.skipFilteredCounters();
    this.state.type = this.state.type % Object.keys(constants.Types).length;

    const counter = document.querySelector('.onlineFriends-friendsOnline');
    if (counter) {
      counter.style.animation = 'none';

      setTimeout(() => {
        counter.style.animation = null;
      }, 100);
    }

    forceUpdateElement(`.${this.classes.wrapper.split(' ')[0]}`);
  }

  _onContextMenuHandler (e) {
    const CountersContextMenu = require('./components/ContextMenu');

    contextMenu.openContextMenu(e, () =>
      React.createElement(CountersContextMenu, {
        counterTypes: constants.Types,
        main: this
      })
    );
  }

  _createCounter (value) {
    return React.createElement(Clickable, {
      className: 'onlineFriends-friendsOnline',
      onClick: this._onClickHandler.bind(this),
      onContextMenu: this._onContextMenuHandler.bind(this),
      style: {
        cursor: 'pointer'
      }
    }, value);
  }

  _renderExtendedCount ({ extendedCount }) {
    const types = constants.Types;
    const type = Object.keys(types)[Object.values(types).indexOf(this.state.type)];

    return this._createCounter(`${extendedCount <= 9999 ? extendedCount : '9999+'} ${type}`);
  }

  _renderFriendsCount ({ friendCount }) {
    return this._createCounter(`${friendCount <= 9999 ? friendCount : '9999+'} Online`);
  }

  async _importStores () {
    for (const store in Stores) {
      await this.utils.import(store, Stores[store]);
    }
  }
}

module.exports = OnlineFriends;
