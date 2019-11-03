const { Plugin } = require('powercord/entities');
const { React, Flux, getModule, getModuleByDisplayName, constants } = require('powercord/webpack');
const { forceUpdateElement } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { AsyncComponent } = require('powercord/components');

const Clickable = AsyncComponent.from(getModuleByDisplayName('Clickable'));

class OnlineFriends extends Plugin {
  constructor () {
    super();

    this.state = {
      type: 0
    };
  }

  get relationshipTypes () {
    const relationTypes = {};

    for (const type in constants.RelationshipTypes) {
      relationTypes[constants.RelationshipTypes[type]] = type;
    }

    return relationTypes;
  }

  get relationshipCounts () {
    const relationCounts = {};
    const relationshipStore = getModule([ 'getRelationships' ], false);

    for (const type in this.relationshipTypes) {
      relationCounts[this.relationshipTypes[type]] = 0;
    }

    for (const id in relationshipStore.getRelationships()) {
      relationCounts[this.relationshipTypes[relationshipStore.getRelationships()[id]]]++;
    }

    return relationCounts;
  }

  get guildCount () {
    const guildStore = getModule([ 'getGuilds' ], false);

    return Object.keys(guildStore.getGuilds()).length;
  }

  async startPlugin () {
    this.loadCSS(require('path').resolve(__dirname, 'style.css'));
    this.classes = {
      ...await getModule([ 'wrapper', 'unreadMentionsBar' ]),
      ...await getModule([ 'guildSeparator', 'listItem' ])
    };

    this._patchGuildsComponent();
  }

  pluginWillUnload () {
    uninject('onlineFriends-FriendCount');
    forceUpdateElement(`.${this.classes.wrapper.split(' ')[0]}`);
  }

  async _patchGuildsComponent () {
    const statusStore = await getModule([ 'getStatus', 'getOnlineFriendCount' ]);
    const relationshipStore = await getModule([ 'getRelationships' ]);
    const FriendsOnline = Flux.connectStores(
      [ statusStore ],
      () => ({ friendCount: statusStore.getOnlineFriendCount() })
    )(this._renderFriendsCount.bind(this));

    const Guilds = await getModuleByDisplayName('Guilds');
    inject('onlineFriends-FriendCount', Guilds.prototype, 'render', (_, res) => {
      const scroller = res.props.children.find(child => child.type && child.type.displayName === 'VerticalScroller');
      const connectedUnreadDMs = scroller.props.children.find(child => child.type && child.type.displayName === 'ConnectedUnreadDMs');

      if (connectedUnreadDMs) {
        const { children } = scroller.props;
        const relationTypes = {
          1: 'FRIEND',
          2: 'PENDING_INCOMING',
          3: 'BLOCKED'
        };

        const ExtendedCount = Flux.connectStores(
          [ relationshipStore ], () => ({
            extendedCount: relationTypes[this.state.type] ? this.relationshipCounts[relationTypes[this.state.type]] : this.guildCount
          })
        )(this._renderExtendedCount.bind(this));

        children.splice(children.indexOf(connectedUnreadDMs), 0, this.state.type > 0
          ? React.createElement(ExtendedCount)
          : React.createElement(FriendsOnline));
      }

      return res;
    });

    forceUpdateElement(`.${this.classes.wrapper.split(' ')[0]}`);
  }

  _onClickHandler () {
    this.state.type++;
    this.state.type = this.state.type % 5;

    const counter = document.querySelector('.onlineFriends-friendsOnline');
    if (counter) {
      counter.style.animation = 'none';

      setTimeout(() => {
        counter.style.animation = null;
      }, 100);
    }

    forceUpdateElement(`.${this.classes.wrapper.split(' ')[0]}`);
  }

  _createCounter (value) {
    return React.createElement(Clickable, {
      className: this.classes.listItem,
      onClick: this._onClickHandler.bind(this)
    }, React.createElement('div', {
      className: 'onlineFriends-friendsOnline',
      style: {
        cursor: 'pointer'
      }
    }, value));
  }

  _renderExtendedCount ({ extendedCount }) {
    const types = OnlineFriends.Types;
    const type = Object.keys(types)[Object.values(types).indexOf(this.state.type)];

    return this._createCounter(`${extendedCount <= 9999 ? extendedCount : '9999+'} ${type}`);
  }

  _renderFriendsCount ({ friendCount }) {
    return this._createCounter(`${friendCount <= 9999 ? friendCount : '9999+'} Online`);
  }
}

OnlineFriends.Types = {
  Friends: 1,
  Pending: 2,
  Blocked: 3,
  Guilds: 4
};

module.exports = OnlineFriends;
